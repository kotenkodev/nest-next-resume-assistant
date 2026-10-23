import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Session,
} from '@nestjs/common';
import { UserSession } from '@thallesp/nestjs-better-auth';
import { FileUploadDto } from '../storage/dto/file-upload.dto';
import { JobPostingService } from './job-posting.service';
import { JobPosting } from './entities/job-posting.entity';

@Controller('jobs')
export class JobPostingController {
  constructor(private readonly jobService: JobPostingService) {}

  @Get()
  getJobs(@Session() session: UserSession): Promise<JobPosting[]> {
    return this.jobService.getJobs(session.user.id);
  }

  @Post()
  uploadResume(
    @Session() session: UserSession,
    @Body() dto: FileUploadDto,
  ): Promise<{ id: string; uploadUrl: string }> {
    return this.jobService.initiateUpload(session.user.id, dto);
  }

  @Get(':id')
  getJob(
    @Session() session: UserSession,
    @Param('id') id: string,
  ): Promise<JobPosting | null> {
    return this.jobService.getJob(session.user.id, id);
  }

  @Delete(':id')
  deleteJob(
    @Session() session: UserSession,
    @Param('id') id: string,
  ): Promise<void> {
    return this.jobService.deleteJob(session.user.id, id);
  }
}
