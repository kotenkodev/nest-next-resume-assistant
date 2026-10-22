import { Module } from '@nestjs/common';
import { JobPostingService } from './job-posting.service';
import { JobPostingController } from './job-posting.controller';

@Module({
  providers: [JobPostingService],
  controllers: [JobPostingController]
})
export class JobPostingModule {}
