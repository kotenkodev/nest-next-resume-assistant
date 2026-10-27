import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Res,
  Session,
} from '@nestjs/common';
import type { ServerResponse } from 'node:http';
import { UserSession } from '@thallesp/nestjs-better-auth';
import { ChatService } from './chat.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { Conversation } from './entities/conversation.entity';
import { ChatMessage } from './entities/chat-message.entity';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  getConversations(@Session() session: UserSession): Promise<Conversation[]> {
    return this.chatService.getConversations(session.user.id);
  }

  @Post()
  createConversation(
    @Session() session: UserSession,
    @Body() dto: CreateConversationDto,
  ): Promise<Conversation> {
    return this.chatService.createConversation(session.user.id, dto);
  }

  @Get(':id')
  getConversation(
    @Session() session: UserSession,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<Conversation> {
    return this.chatService.getConversation(session.user.id, id);
  }

  @Patch(':id')
  updateConversation(
    @Session() session: UserSession,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdateConversationDto,
  ): Promise<Conversation> {
    return this.chatService.updateConversation(session.user.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  deleteConversation(
    @Session() session: UserSession,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<void> {
    return this.chatService.deleteConversation(session.user.id, id);
  }

  @Post(':id/messages')
  sendMessage(
    @Session() session: UserSession,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: SendMessageDto,
  ): Promise<{ userMessage: ChatMessage; assistantMessage: ChatMessage }> {
    return this.chatService.sendMessage(session.user.id, id, dto);
  }

  @Post(':id/messages/stream')
  async sendMessageStream(
    @Session() session: UserSession,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: SendMessageDto,
    @Res() res: ServerResponse,
  ): Promise<void> {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
      for await (const chunk of this.chatService.sendMessageStream(
        session.user.id,
        id,
        dto,
      )) {
        res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
      }
      res.write('data: [DONE]\n\n');
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Streaming failed';
      res.write(`data: ${JSON.stringify({ error: errorMessage })}\n\n`);
    } finally {
      res.end();
    }
  }
}
