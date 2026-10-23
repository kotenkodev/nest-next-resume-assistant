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

@Controller('resumes')
export class ResumeController {
  constructor(private readonly resumeService: ResumeService) {}

  @Get()
  getResumes(@Session() session: UserSession): string {
    return 'This is the resume endpoint';
  }

  @Post()
  uploadResume(
    @Session() session: UserSession,
    @Body() dto: FileUploadDto,
  ): Promise<{ id: string; uploadUrl: string }> {
    return this.resumeService.initiateUpload(session.user.id, dto);
  }

  @Get(':id')
  getResume(@Session() session: UserSession, @Param('id') id: string): string {
    return 'This is the resume endpoint';
  }

  @Delete(':id')
  deleteResume(
    @Session() session: UserSession,
    @Param('id') id: string,
  ): string {
    return 'This is the resume endpoint';
  }
}
