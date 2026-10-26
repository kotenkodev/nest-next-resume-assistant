import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalysisService } from './analysis.service';
import { FitAnalysis } from './entities/fit-analysis.entity';
import { Resume } from '../resume/entities/resume.entity';
import { JobPosting } from '../job-posting/entities/job-posting.entity';
import { AiModule } from '../ai/ai.module';
import { AnalysisController } from './analysis.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([FitAnalysis, Resume, JobPosting]),
    AiModule,
  ],
  providers: [AnalysisService],
  exports: [AnalysisService, TypeOrmModule],
  controllers: [AnalysisController],
})
export class AnalysisModule {}
