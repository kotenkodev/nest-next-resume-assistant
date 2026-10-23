import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResumeService } from './resume.service';
import { ResumeController } from './resume.controller';
import { Resume } from './entities/resume.entity';
import { S3Module } from '../storage/s3.module';

@Module({
  imports: [TypeOrmModule.forFeature([Resume]), S3Module],
  providers: [ResumeService],
  controllers: [ResumeController],
  exports: [ResumeService, TypeOrmModule],
})
export class ResumeModule {}
