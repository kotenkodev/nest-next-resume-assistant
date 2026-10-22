import { Module } from '@nestjs/common';
import { PipelineService } from './pipeline.service';

@Module({
  providers: [PipelineService]
})
export class PipelineModule {}
