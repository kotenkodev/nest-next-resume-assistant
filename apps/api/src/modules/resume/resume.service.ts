import { Injectable } from '@nestjs/common';
import { FileUploadDto } from '../storage/dto/file-upload.dto';
import { S3Service } from '../storage/s3.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resume } from './entities/resume.entity';
import { randomUUID } from 'crypto';

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

  deleteResume(userId: string, id: string): Promise<void> {
    return this.resumeRepository.delete({ userId, id }).then(() => {});
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
}
