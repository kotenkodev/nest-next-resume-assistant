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
    @Param('id') id: string,
  ): Promise<Resume | null> {
    return this.resumeService.getResume(session.user.id, id);
  }

  @Delete(':id')
  deleteResume(
    @Session() session: UserSession,
    @Param('id') id: string,
  ): Promise<void> {
    return this.resumeService.deleteResume(session.user.id, id);
  }
}
