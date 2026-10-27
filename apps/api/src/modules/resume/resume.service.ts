import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FileUploadDto } from '../storage/dto/file-upload.dto';
import { S3Service } from '../storage/s3.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resume } from './entities/resume.entity';
import { S3ServiceException } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import { ProcessingJob } from '../pipeline/entities/processing-job.entity';
import { Conversation } from '../chat/entities/conversation.entity';

@Injectable()
export class ResumeService {
  constructor(
    @InjectRepository(Resume)
    private readonly resumeRepository: Repository<Resume>,
    private readonly s3Service: S3Service,
  ) {}

  getResumes(userId: string): Promise<Resume[]> {
    return this.resumeRepository.find({ where: { userId } });
  }

  getResume(userId: string, id: string): Promise<Resume | null> {
    return this.resumeRepository.findOne({ where: { userId, id } });
  }

  async deleteResume(userId: string, id: string): Promise<void> {
    const resume = await this.resumeRepository.findOne({
      where: { userId, id },
    });

    if (!resume) return;

    await this.resumeRepository.manager.transaction(async (manager) => {
      await manager.delete(ProcessingJob, { targetId: id, userId });
      await manager.delete(Conversation, { resumeId: id, userId });
      await manager.delete(Resume, { id, userId });
    });

    if (resume.s3Key) {
      await this.s3Service.deleteObjectCommand(resume.s3Key).catch(() => {});
    }
  }

  async initiateUpload(
    userId: string,
    dto: FileUploadDto,
  ): Promise<{ id: string; uploadUrl: string }> {
    const id = randomUUID();
    const s3Key = `users/${userId}/resumes/${id}`;

    const uploadUrl = await this.s3Service.createUploadUrl(
      s3Key,
      dto.contentType,
      dto.fileSize,
    );

    const resume = this.resumeRepository.create({
      id,
      userId,
      fileName: dto.fileName,
      fileSize: dto.fileSize,
      contentType: dto.contentType,
      s3Key,
      status: 'PENDING_UPLOAD',
      rawText: null,
    });

    await this.resumeRepository.save(resume);

    return { id: resume.id, uploadUrl };
  }

  async verifyUpload(userId: string, id: string): Promise<Resume> {
    const resume = await this.resumeRepository.findOne({
      where: { id, userId },
    });

    if (!resume) {
      throw new NotFoundException('Resume not found');
    }

    const metadata = await this.s3Service
      .getObjectMetadata(resume.s3Key)
      .catch((error: unknown) => {
        if (
          error instanceof S3ServiceException &&
          error.$metadata.httpStatusCode === 404
        ) {
          throw new BadRequestException('File has not been uploaded yet');
        }

        throw error;
      });

    if (metadata.ContentLength !== resume.fileSize) {
      throw new BadRequestException('Uploaded file size does not match');
    }

    if (metadata.ContentType !== resume.contentType) {
      throw new BadRequestException(
        'Uploaded file content type does not match',
      );
    }

    return resume;
  }

  async completeUpload(
    userId: string,
    id: string,
  ): Promise<{ id: string; processingJobId: string }> {
    await this.verifyUpload(userId, id);

    return this.resumeRepository.manager.transaction(async (manager) => {
      const resume = await manager.findOne(Resume, {
        where: { id, userId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!resume) {
        throw new NotFoundException('Resume not found');
      }

      const existingJob = await manager.findOne(ProcessingJob, {
        where: {
          userId,
          targetId: id,
          type: 'RESUME_PROCESSING',
        },
        order: { createdAt: 'DESC' },
      });

      if (existingJob) {
        return { id, processingJobId: existingJob.id };
      }

      if (resume.status !== 'PENDING_UPLOAD') {
        throw new ConflictException('Resume is not awaiting upload completion');
      }

      const job = manager.create(ProcessingJob, {
        userId,
        targetId: id,
        type: 'RESUME_PROCESSING',
        status: 'PENDING',
        currentStepIndex: 0,
      });

      await manager.save(job);

      resume.status = 'PROCESSING';
      await manager.save(resume);

      return { id, processingJobId: job.id };
    });
  }
}
