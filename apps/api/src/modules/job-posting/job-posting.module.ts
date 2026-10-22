import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobPostingService } from './job-posting.service';
import { JobPostingController } from './job-posting.controller';
import { JobPosting } from './entities/job-posting.entity';

@Module({
  imports: [TypeOrmModule.forFeature([JobPosting])],
  providers: [JobPostingService],
  controllers: [JobPostingController],
  exports: [JobPostingService, TypeOrmModule],
})
export class JobPostingModule {}
