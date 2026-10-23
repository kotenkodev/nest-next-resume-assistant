import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PipelineService } from './pipeline.service';
import { ProcessingJob } from './entities/processing-job.entity';
import { JobStep } from './entities/job-step.entity';
import { PdfExtractionService } from './pdf-extraction.service';
import { S3Module } from '../storage/s3.module';
import { Resume } from '../resume/entities/resume.entity';
import { PipelineWorker } from './pipeline.worker';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProcessingJob, JobStep, Resume]),
    S3Module,
    AiModule,
  ],
  providers: [PipelineService, PdfExtractionService, PipelineWorker],
  exports: [PipelineService, TypeOrmModule],
})
export class PipelineModule {}
