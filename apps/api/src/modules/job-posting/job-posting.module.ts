import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobPostingService } from './job-posting.service';
import { JobPostingController } from './job-posting.controller';
import { JobPosting } from './entities/job-posting.entity';
import { S3Module } from '../storage/s3.module';
import { Resume } from '../resume/entities/resume.entity';

@Module({
  imports: [TypeOrmModule.forFeature([JobPosting, Resume]), S3Module],
  providers: [JobPostingService],
  controllers: [JobPostingController],
  exports: [JobPostingService, TypeOrmModule],
})
export class JobPostingModule {}
