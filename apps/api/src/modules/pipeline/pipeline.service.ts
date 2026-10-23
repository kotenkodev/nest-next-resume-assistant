import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resume } from '../resume/entities/resume.entity';
import { S3Service } from '../storage/s3.service';
import { PdfExtractionService } from './pdf-extraction.service';
import { ProcessingJob } from './entities/processing-job.entity';
import { AiService } from '../ai/ai.service';

@Injectable()
export class PipelineService {
  constructor(
    @InjectRepository(Resume)
    private readonly resumeRepository: Repository<Resume>,
    private readonly s3Service: S3Service,
    private readonly pdfExtractionService: PdfExtractionService,
    private readonly aiService: AiService,
  ) {}

  async extractResumeText(userId: string, resumeId: string): Promise<string> {
    const resume = await this.resumeRepository.findOne({
      where: { id: resumeId, userId },
    });

    if (!resume) {
      throw new NotFoundException('Resume not found');
    }

    if (resume.contentType !== 'application/pdf') {
      throw new Error('Only PDF extraction is currently supported');
    }

    const bytes = await this.s3Service.getObjectBytes(resume.s3Key);

    if (bytes.byteLength !== resume.fileSize) {
      throw new Error('Downloaded file size does not match');
    }

    const rawText = await this.pdfExtractionService.extractText(bytes);

    const result = await this.resumeRepository.update(
      { id: resumeId, userId },
      { rawText },
    );

    if (result.affected !== 1) {
      throw new NotFoundException('Resume was deleted during processing');
    }

    return rawText;
  }

  async claimNextResumeJob(): Promise<ProcessingJob | null> {
    return this.resumeRepository.manager.transaction(async (manager) => {
      const job = await manager.findOne(ProcessingJob, {
        where: {
          type: 'RESUME_PROCESSING',
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

  async runNextResumeJob(): Promise<boolean> {
    const job = await this.claimNextResumeJob();

    if (!job) {
      return false;
    }

    try {
      const resumeId = job.targetId;

      if (!resumeId) {
        throw new Error('Processing job has no target resume');
      }

      const rawText = await this.extractResumeText(job.userId, resumeId);
      const parsedProfile = await this.aiService.parseResume(rawText);

      await this.resumeRepository.manager.transaction(async (manager) => {
        const result = await manager.update(
          Resume,
          { id: resumeId, userId: job.userId },
          { status: 'READY', parsedProfile },
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
      const errorMessage =
        error instanceof Error ? error.message : 'Resume processing failed';

      await this.resumeRepository.manager.transaction(async (manager) => {
        await manager.update(
          ProcessingJob,
          { id: job.id },
          { status: 'FAILED', errorMessage },
        );

        if (job.targetId) {
          await manager.update(
            Resume,
            { id: job.targetId, userId: job.userId },
            { status: 'FAILED' },
          );
        }
      });
    }

    return true;
  }
}
