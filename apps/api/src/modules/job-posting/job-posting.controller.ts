import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Query,
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
  uploadJob(
    @Session() session: UserSession,
    @Body() dto: FileUploadDto,
  ): Promise<{ id: string; uploadUrl: string }> {
    return this.jobService.initiateUpload(session.user.id, dto);
  }

  @Get('match')
  findMatchingJobs(
    @Session() session: UserSession,
    @Query('resumeId', new ParseUUIDPipe({ version: '4' })) resumeId: string,
    @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number,
  ): Promise<Array<{ job: JobPosting; similarityScore: number }>> {
    return this.jobService.findMatchingJobs(session.user.id, resumeId, limit);
  }

  @Get(':id')
  getJob(
    @Session() session: UserSession,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<JobPosting | null> {
    return this.jobService.getJob(session.user.id, id);
  }

  @Delete(':id')
  deleteJob(
    @Session() session: UserSession,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<void> {
    return this.jobService.deleteJob(session.user.id, id);
  }

  @Post(':id/complete')
  @HttpCode(200)
  completeUpload(
    @Session() session: UserSession,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<{ id: string; processingJobId: string }> {
    return this.jobService.completeUpload(session.user.id, id);
  }
}
