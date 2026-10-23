import { Injectable } from '@nestjs/common';
import { JobPosting } from './entities/job-posting.entity';
import { InjectRepository } from '@nestjs/typeorm/dist/common/typeorm.decorators';
import { Repository } from 'typeorm/repository/Repository';
import { S3Service } from '../storage/s3.service';
import { FileUploadDto } from '../storage/dto/file-upload.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class JobPostingService {
  constructor(
    @InjectRepository(JobPosting)
    private readonly jobPostingRepository: Repository<JobPosting>,
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
}
