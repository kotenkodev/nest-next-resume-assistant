import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PipelineService } from './pipeline.service';
import { ProcessingJob } from './entities/processing-job.entity';
import { JobStep } from './entities/job-step.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProcessingJob, JobStep])],
  providers: [PipelineService],
  exports: [PipelineService, TypeOrmModule],
})
export class PipelineModule {}
