import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Session,
} from '@nestjs/common';
import { UserSession } from '@thallesp/nestjs-better-auth';
import { FileUploadDto } from '../storage/dto/file-upload.dto';
import { ResumeService } from './resume.service';
import { Resume } from './entities/resume.entity';

@Controller('resumes')
export class ResumeController {
  constructor(private readonly resumeService: ResumeService) {}

  @Get()
  getResumes(@Session() session: UserSession): Promise<Resume[]> {
    return this.resumeService.getResumes(session.user.id);
  }

  @Post()
  uploadResume(
    @Session() session: UserSession,
    @Body() dto: FileUploadDto,
  ): Promise<{ id: string; uploadUrl: string }> {
    return this.resumeService.initiateUpload(session.user.id, dto);
  }

  @Get(':id')
  getResume(
    @Session() session: UserSession,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<Resume | null> {
    return this.resumeService.getResume(session.user.id, id);
  }

  @Delete(':id')
  @HttpCode(204)
  deleteResume(
    @Session() session: UserSession,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<void> {
    return this.resumeService.deleteResume(session.user.id, id);
  }

  @Post(':id/complete')
  @HttpCode(200)
  completeUpload(
    @Session() session: UserSession,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<{ id: string; processingJobId: string }> {
    return this.resumeService.completeUpload(session.user.id, id);
  }
}
