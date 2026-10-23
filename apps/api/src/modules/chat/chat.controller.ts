import { Controller, Get, Post, Query, Session } from '@nestjs/common';
import { UserSession } from '@thallesp/nestjs-better-auth';

@Controller('chat')
export class ChatController {
  @Get(':id')
  getMessages(
    @Session() session: UserSession,
    @Query('resumeId') resumeId: string,
    @Query('jobId') jobId: string,
  ): string {
    return 'This is the resume endpoint';
  }

  @Post()
  sendMessage(@Session() session: UserSession): string {
    return 'This is the resume endpoint';
  }
}
