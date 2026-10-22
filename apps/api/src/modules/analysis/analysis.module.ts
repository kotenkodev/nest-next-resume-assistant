import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalysisService } from './analysis.service';
import { FitAnalysis } from './entities/fit-analysis.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FitAnalysis])],
  providers: [AnalysisService],
  exports: [AnalysisService, TypeOrmModule],
})
export class AnalysisModule {}
