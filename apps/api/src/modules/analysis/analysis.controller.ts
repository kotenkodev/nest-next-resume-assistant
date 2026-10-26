import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Session,
} from '@nestjs/common';
import { UserSession } from '@thallesp/nestjs-better-auth';
import { AnalysisService } from './analysis.service';
import { RunAnalysisDto } from './dto/run-analysis.dto';
import { FitAnalysis } from './entities/fit-analysis.entity';

@Controller('analysis')
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Post()
  runAnalysis(
    @Session() session: UserSession,
    @Body() dto: RunAnalysisDto,
  ): Promise<FitAnalysis> {
    return this.analysisService.runFitAnalysis(
      session.user.id,
      dto.resumeId,
      dto.jobPostingId,
    );
  }

  @Get()
  getAnalysis(
    @Session() session: UserSession,
    @Query('resumeId', new ParseUUIDPipe({ version: '4' })) resumeId: string,
    @Query('jobPostingId', new ParseUUIDPipe({ version: '4' }))
    jobPostingId: string,
  ): Promise<FitAnalysis | null> {
    return this.analysisService.getAnalysis(
      session.user.id,
      resumeId,
      jobPostingId,
    );
  }

  @Get('resume/:resumeId')
  getAnalysesForResume(
    @Session() session: UserSession,
    @Param('resumeId', new ParseUUIDPipe({ version: '4' })) resumeId: string,
  ): Promise<FitAnalysis[]> {
    return this.analysisService.getAnalysesForResume(session.user.id, resumeId);
  }
}
