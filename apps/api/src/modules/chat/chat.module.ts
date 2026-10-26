import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatMessage } from './entities/chat-message.entity';
import { Conversation } from './entities/conversation.entity';
import { Resume } from '../resume/entities/resume.entity';
import { JobPosting } from '../job-posting/entities/job-posting.entity';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Conversation, ChatMessage, Resume, JobPosting]),
    AiModule,
  ],
  providers: [ChatService],
  controllers: [ChatController],
  exports: [ChatService, TypeOrmModule],
})
export class ChatModule {}
