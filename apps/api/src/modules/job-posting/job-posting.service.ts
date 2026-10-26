import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JobPosting } from './entities/job-posting.entity';
import { S3Service } from '../storage/s3.service';
import { FileUploadDto } from '../storage/dto/file-upload.dto';
import { randomUUID } from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { S3ServiceException } from '@aws-sdk/client-s3';
import { Repository } from 'typeorm';
import { ProcessingJob } from '../pipeline/entities/processing-job.entity';
import { Resume } from '../resume/entities/resume.entity';

@Injectable()
export class JobPostingService {
  constructor(
    @InjectRepository(JobPosting)
    private readonly jobPostingRepository: Repository<JobPosting>,
    @InjectRepository(Resume)
    private readonly resumeRepository: Repository<Resume>,
    private readonly s3Service: S3Service,
  ) {}

  getJobs(userId: string): Promise<JobPosting[]> {
    return this.jobPostingRepository.find({ where: { userId } });
  }

  getJob(userId: string, id: string): Promise<JobPosting | null> {
    return this.jobPostingRepository.findOne({ where: { userId, id } });
  }

  deleteJob(userId: string, id: string): Promise<void> {
    return this.jobPostingRepository.delete({ userId, id }).then(() => {});
  }

  async initiateUpload(
    userId: string,
    dto: FileUploadDto,
  ): Promise<{ id: string; uploadUrl: string }> {
    const id = randomUUID();
    const s3Key = `users/${userId}/jobs/${id}`;

    const uploadUrl = await this.s3Service.createUploadUrl(
      s3Key,
      dto.contentType,
      dto.fileSize,
    );

    const jobPosting = this.jobPostingRepository.create({
      id,
      userId,
      fileName: dto.fileName,
      fileSize: dto.fileSize,
      contentType: dto.contentType,
      s3Key,
      status: 'PENDING_UPLOAD',
      rawText: null,
    });

    await this.jobPostingRepository.save(jobPosting);

    return { id: jobPosting.id, uploadUrl };
  }

  async verifyUpload(userId: string, id: string): Promise<JobPosting> {
    const jobPosting = await this.jobPostingRepository.findOne({
      where: { id, userId },
    });

    if (!jobPosting) {
      throw new NotFoundException('Job posting not found');
    }

    const metadata = await this.s3Service
      .getObjectMetadata(jobPosting.s3Key)
      .catch((error: unknown) => {
        if (
          error instanceof S3ServiceException &&
          error.$metadata.httpStatusCode === 404
        ) {
          throw new BadRequestException('File has not been uploaded yet');
        }

        throw error;
      });

    if (metadata.ContentLength !== jobPosting.fileSize) {
      throw new BadRequestException('Uploaded file size does not match');
    }

    if (metadata.ContentType !== jobPosting.contentType) {
      throw new BadRequestException(
        'Uploaded file content type does not match',
      );
    }

    return jobPosting;
  }

  async completeUpload(
    userId: string,
    id: string,
  ): Promise<{ id: string; processingJobId: string }> {
    await this.verifyUpload(userId, id);

    return this.jobPostingRepository.manager.transaction(async (manager) => {
      const jobPosting = await manager.findOne(JobPosting, {
        where: { id, userId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!jobPosting) {
        throw new NotFoundException('Job posting not found');
      }

      const existingJob = await manager.findOne(ProcessingJob, {
        where: {
          userId,
          targetId: id,
          type: 'JOB_PROCESSING',
        },
        order: { createdAt: 'DESC' },
      });

      if (existingJob) {
        return { id, processingJobId: existingJob.id };
      }

      if (jobPosting.status !== 'PENDING_UPLOAD') {
        throw new ConflictException(
          'Job posting is not awaiting upload completion',
        );
      }

      const job = manager.create(ProcessingJob, {
        userId,
        type: 'JOB_PROCESSING',
        targetId: id,
        status: 'PENDING',
        currentStepIndex: 0,
      });

      await manager.save(job);

      jobPosting.status = 'PROCESSING';
      await manager.save(jobPosting);

      return { id, processingJobId: job.id };
    });
  }

  async findMatchingJobs(
    userId: string,
    resumeId: string,
    limit = 5,
  ): Promise<Array<{ job: JobPosting; similarityScore: number }>> {
    const resume = await this.resumeRepository.findOne({
      where: { id: resumeId, userId },
    });

    if (!resume) {
      throw new NotFoundException('Resume not found');
    }

    if (!resume.embedding) {
      throw new BadRequestException('Resume does not have an embedding yet');
    }

    const vectorString = `[${resume.embedding.join(',')}]`;

    const rawResults = await this.jobPostingRepository
      .createQueryBuilder('job')
      .select([
        'job.id',
        'job.title',
        'job.company',
        'job.fileName',
        'job.status',
        'job.parsedData',
        'job.createdAt',
      ])
      .addSelect('1 - (job.embedding <=> :embedding::vector)', 'similarity')
      .where('job.userId = :userId', { userId })
      .andWhere('job.status = :status', { status: 'READY' })
      .andWhere('job.embedding IS NOT NULL')
      .orderBy('job.embedding <=> :embedding::vector', 'ASC')
      .limit(limit)
      .setParameters({ embedding: vectorString })
      .getRawAndEntities();

    return rawResults.entities.map((job, index) => ({
      job,
      similarityScore: Number(
        Number(rawResults.raw[index]?.similarity ?? 0).toFixed(4),
      ),
    }));
  }
}
