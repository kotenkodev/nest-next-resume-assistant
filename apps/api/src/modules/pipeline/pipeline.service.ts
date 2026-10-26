import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, ObjectType, Repository } from 'typeorm';
import { Resume } from '../resume/entities/resume.entity';
import { S3Service } from '../storage/s3.service';
import { PdfExtractionService } from './pdf-extraction.service';
import { ProcessingJob } from './entities/processing-job.entity';
import { AiService } from '../ai/ai.service';
import { JobPosting } from '../job-posting/entities/job-posting.entity';
import { EmbeddingService } from '../ai/embedding.service';
import { buildResumeEmbeddingText } from '../resume/utils/build-resume-embedding-text';
import { buildJobEmbeddingText } from '../job-posting/utils/build-job-embedding-text';

@Injectable()
export class PipelineService {
  constructor(
    @InjectRepository(Resume)
    private readonly resumeRepository: Repository<Resume>,
    @InjectRepository(JobPosting)
    private readonly jobPostingRepository: Repository<JobPosting>,
    private readonly dataSource: DataSource,
    private readonly s3Service: S3Service,
    private readonly pdfExtractionService: PdfExtractionService,
    private readonly aiService: AiService,
    private readonly embeddingService: EmbeddingService,
  ) {}

  async extractDocumentText<
    T extends {
      contentType: string;
      s3Key: string;
      fileSize: number;
      rawText: string | null;
    },
  >(
    repository: Repository<T>,
    userId: string,
    entityId: string,
    entityName: string,
  ): Promise<string> {
    const entity = await repository.findOne({
      where: { id: entityId, userId } as any,
    });

    if (!entity) {
      throw new NotFoundException(`${entityName} not found`);
    }

    if (entity.contentType !== 'application/pdf') {
      throw new Error('Only PDF extraction is currently supported');
    }

    const bytes = await this.s3Service.getObjectBytes(entity.s3Key);

    if (bytes.byteLength !== entity.fileSize) {
      throw new Error('Downloaded file size does not match');
    }

    const rawText = await this.pdfExtractionService.extractText(bytes);

    const result = await repository.update(
      { id: entityId, userId } as any,
      { rawText } as any,
    );

    if (result.affected !== 1) {
      throw new NotFoundException(
        `${entityName} was deleted during processing`,
      );
    }

    return rawText;
  }

  async claimNextJob(): Promise<ProcessingJob | null> {
    return this.dataSource.transaction(async (manager) => {
      const job = await manager.findOne(ProcessingJob, {
        where: {
          type: In(['RESUME_PROCESSING', 'JOB_PROCESSING']),
          status: 'PENDING',
        },
        order: {
          createdAt: 'ASC',
          id: 'ASC',
        },
        lock: {
          mode: 'pessimistic_write',
          onLocked: 'skip_locked',
        },
      });

      if (!job) {
        return null;
      }

      job.status = 'IN_PROGRESS';
      return manager.save(job);
    });
  }

  private async processResumeJob(job: ProcessingJob): Promise<void> {
    try {
      if (!job.targetId) {
        throw new Error('Processing job has no target resume');
      }

      const rawText = await this.extractDocumentText(
        this.resumeRepository,
        job.userId,
        job.targetId,
        'Resume',
      );
      const parsedProfile = await this.aiService.parseResume(rawText);
      const embeddingText = buildResumeEmbeddingText(parsedProfile);
      const embedding = await this.embeddingService.embed(
        embeddingText,
        'RETRIEVAL_DOCUMENT',
      );

      await this.resumeRepository.manager.transaction(async (manager) => {
        const result = await manager.update(
          Resume,
          { id: job.targetId, userId: job.userId },
          { status: 'READY', parsedProfile, embedding },
        );

        if (result.affected !== 1) {
          throw new Error('Resume was deleted during processing');
        }

        await manager.update(
          ProcessingJob,
          { id: job.id },
          { status: 'COMPLETED' },
        );
      });
    } catch (error: unknown) {
      await this.handleJobFailure(job, error, Resume);
    }
  }

  private async processJobPostingJob(job: ProcessingJob): Promise<void> {
    try {
      if (!job.targetId) {
        throw new Error('Processing job has no target job posting');
      }

      const rawText = await this.extractDocumentText(
        this.jobPostingRepository,
        job.userId,
        job.targetId,
        'JobPosting',
      );
      const parsedData = await this.aiService.parseJobPosting(rawText);
      const embeddingText = buildJobEmbeddingText(parsedData);
      const embedding = await this.embeddingService.embed(
        embeddingText,
        'RETRIEVAL_DOCUMENT',
      );

      await this.jobPostingRepository.manager.transaction(async (manager) => {
        const result = await manager.update(
          JobPosting,
          { id: job.targetId, userId: job.userId },
          { status: 'READY', parsedData, embedding },
        );

        if (result.affected !== 1) {
          throw new Error('Job posting was deleted during processing');
        }

        await manager.update(
          ProcessingJob,
          { id: job.id },
          { status: 'COMPLETED' },
        );
      });
    } catch (error: unknown) {
      await this.handleJobFailure(job, error, JobPosting);
    }
  }

  async runNextJob(): Promise<boolean> {
    const job = await this.claimNextJob();

    if (!job) {
      return false;
    }

    if (job.type === 'RESUME_PROCESSING') {
      await this.processResumeJob(job);
    } else if (job.type === 'JOB_PROCESSING') {
      await this.processJobPostingJob(job);
    } else {
      await this.handleJobFailure(
        job,
        new Error(`Unknown job type: ${job.type}`),
        null,
      );
    }

    return true;
  }

  private async handleJobFailure(
    job: ProcessingJob,
    error: unknown,
    EntityType: ObjectType<Resume> | ObjectType<JobPosting> | null,
  ): Promise<void> {
    const errorMessage =
      error instanceof Error ? error.message : 'Processing failed';

    await this.dataSource.transaction(async (manager) => {
      await manager.update(
        ProcessingJob,
        { id: job.id },
        { status: 'FAILED', errorMessage },
      );

      if (job.targetId && EntityType) {
        await manager.update(
          EntityType,
          { id: job.targetId, userId: job.userId },
          { status: 'FAILED' },
        );
      }
    });
  }
}
