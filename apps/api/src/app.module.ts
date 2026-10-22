import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { resolve } from 'node:path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseOptions } from './database/database-options';
import { createAuth } from './modules/auth/auth';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { DataSource } from 'typeorm';
import { validateEnv } from './config/env.validate';
import { ResumeModule } from './modules/resume/resume.module';
import { JobPostingModule } from './modules/job-posting/job-posting.module';
import { PipelineModule } from './modules/pipeline/pipeline.module';
import { AiModule } from './modules/ai/ai.module';
import { AnalysisModule } from './modules/analysis/analysis.module';
import { ChatModule } from './modules/chat/chat.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: resolve(__dirname, '../../../.env'),
      validate: validateEnv,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => getDatabaseOptions(),
    }),
    AuthModule.forRootAsync({
      inject: [DataSource],
      useFactory: (dataSource: DataSource) => ({
        auth: createAuth(dataSource),
      }),
    }),
    ResumeModule,
    JobPostingModule,
    PipelineModule,
    AiModule,
    AnalysisModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
