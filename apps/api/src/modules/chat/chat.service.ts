import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Conversation } from './entities/conversation.entity';
import { In, Repository } from 'typeorm';
import { ChatMessage } from './entities/chat-message.entity';
import { Resume } from '../resume/entities/resume.entity';
import { JobPosting } from '../job-posting/entities/job-posting.entity';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { AiService } from '../ai/ai.service';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    @InjectRepository(ChatMessage)
    private readonly chatMessageRepository: Repository<ChatMessage>,
    @InjectRepository(Resume)
    private readonly resumeRepository: Repository<Resume>,
    @InjectRepository(JobPosting)
    private readonly jobPostingRepository: Repository<JobPosting>,
    private readonly aiService: AiService,
  ) {}

  async getConversations(userId: string): Promise<Conversation[]> {
    return this.conversationRepository.find({
      where: { userId },
      order: { updatedAt: 'DESC' },
    });
  }

  async getConversation(
    userId: string,
    conversationId: string,
  ): Promise<Conversation> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId, userId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    conversation.messages = await this.chatMessageRepository.find({
      where: { conversationId },
      order: { createdAt: 'ASC' },
    });

    return conversation;
  }

  async deleteConversation(
    userId: string,
    conversationId: string,
  ): Promise<void> {
    await this.conversationRepository.delete({
      id: conversationId,
      userId,
    });
  }

  async updateConversation(
    userId: string,
    conversationId: string,
    dto: UpdateConversationDto,
  ): Promise<Conversation> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId, userId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (dto.jobPostingIds !== undefined) {
      if (dto.jobPostingIds.length > 0) {
        const jobs = await this.jobPostingRepository.find({
          where: { userId, id: In(dto.jobPostingIds) },
        });
        conversation.jobPostingIds = jobs.map((j) => j.id);
      } else {
        conversation.jobPostingIds = [];
      }
    }

    if (dto.title !== undefined) {
      conversation.title = dto.title;
    }

    return this.conversationRepository.save(conversation);
  }

  async createConversation(
    userId: string,
    dto: CreateConversationDto,
  ): Promise<Conversation> {
    const resume = await this.resumeRepository.findOne({
      where: { id: dto.resumeId, userId },
    });
    if (!resume) {
      throw new NotFoundException('Resume not found');
    }
    if (resume.status !== 'READY') {
      throw new BadRequestException('Resume is not ready yet');
    }
    const jobs = await this.jobPostingRepository.find({
      where: { id: In(dto.jobPostingIds), userId },
    });
    if (jobs.length !== dto.jobPostingIds.length) {
      throw new BadRequestException('One or more job postings were not found');
    }
    const notReady = jobs.find((job) => job.status !== 'READY');
    if (notReady) {
      throw new BadRequestException(
        `Job posting "${notReady.title ?? notReady.fileName}" is not ready yet`,
      );
    }
    const conversation = this.conversationRepository.create({
      userId,
      resumeId: dto.resumeId,
      jobPostingIds: dto.jobPostingIds,
      title: dto.title ?? `Comparison: ${resume.fileName}`,
    });
    return this.conversationRepository.save(conversation);
  }

  buildSystemPrompt(resume: Resume, orderedJobs: JobPosting[]): string {
    let prompt = `You are a Career Intelligence Assistant analyzing a candidate's resume against one or more job postings.\n`;
    prompt += `Answer questions accurately about candidate fit, skill gaps, experience alignment, and interview preparation.\n\n`;
    prompt += `Rules:\n`;
    prompt += `- The jobs are labeled below as "Job #1", "Job #2", etc. Always refer to them by these numbers and titles when answering.\n`;
    prompt += `- Ground your answers strictly in the candidate's profile and the job requirements.\n`;
    prompt += `- Do not invent qualifications or job requirements not present in the documents.\n\n`;
    prompt += `--- CANDIDATE RESUME ---\n`;
    prompt += `File: ${resume.fileName}\n`;
    if (resume.parsedProfile) {
      prompt += `Structured Profile:\n${JSON.stringify(resume.parsedProfile, null, 2)}\n\n`;
    }
    if (resume.rawText) {
      prompt += `Raw Text:\n${resume.rawText}\n\n`;
    }
    prompt += `--- TARGET JOB POSTINGS ---\n`;
    orderedJobs.forEach((job, index) => {
      const jobNum = index + 1;
      prompt += `\n[Job #${jobNum}: ${job.title ?? job.fileName}]\n`;
      if (job.company) {
        prompt += `Company: ${job.company}\n`;
      }
      if (job.parsedData) {
        prompt += `Structured Requirements:\n${JSON.stringify(job.parsedData, null, 2)}\n`;
      }
      if (job.rawText) {
        prompt += `Raw Text:\n${job.rawText}\n`;
      }
    });
    return prompt;
  }

  async *sendMessageStream(
    userId: string,
    conversationId: string,
    dto: SendMessageDto,
  ): AsyncGenerator<string, void, unknown> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId, userId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const resume = await this.resumeRepository.findOne({
      where: { id: conversation.resumeId, userId },
    });

    if (!resume || resume.status !== 'READY') {
      throw new BadRequestException(
        'Associated resume is not available or ready',
      );
    }

    const jobs = await this.jobPostingRepository.find({
      where: { id: In(conversation.jobPostingIds), userId },
    });

    const jobMap = new Map(jobs.map((job) => [job.id, job]));
    const orderedJobs: JobPosting[] = [];

    for (const jobId of conversation.jobPostingIds) {
      const job = jobMap.get(jobId);
      if (!job || job.status !== 'READY') {
        throw new BadRequestException(
          `Job posting ${jobId} is not available or ready`,
        );
      }
      orderedJobs.push(job);
    }

    const userMessage = this.chatMessageRepository.create({
      conversationId,
      userId,
      role: 'user',
      content: dto.message,
    });
    await this.chatMessageRepository.save(userMessage);

    const history = await this.chatMessageRepository.find({
      where: { conversationId },
      order: { createdAt: 'ASC' },
    });

    const systemPrompt = this.buildSystemPrompt(resume, orderedJobs);

    const stream = this.aiService.streamChatReply([
      { role: 'system', content: systemPrompt },
      ...history.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    ]);

    let fullReply = '';

    try {
      for await (const chunk of stream) {
        fullReply += chunk;
        yield chunk;
      }
    } finally {
      if (fullReply.trim().length > 0) {
        const assistantMessage = this.chatMessageRepository.create({
          conversationId,
          userId,
          role: 'assistant',
          content: fullReply,
        });
        await this.chatMessageRepository.save(assistantMessage);

        await this.conversationRepository.update(
          { id: conversationId, userId },
          { updatedAt: new Date() },
        );
      }
    }
  }

  async sendMessage(
    userId: string,
    conversationId: string,
    dto: SendMessageDto,
  ): Promise<{ userMessage: ChatMessage; assistantMessage: ChatMessage }> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId, userId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const resume = await this.resumeRepository.findOne({
      where: { id: conversation.resumeId, userId },
    });

    if (!resume || resume.status !== 'READY') {
      throw new BadRequestException(
        'Associated resume is not available or ready',
      );
    }

    const jobs = await this.jobPostingRepository.find({
      where: { id: In(conversation.jobPostingIds), userId },
    });

    const jobMap = new Map(jobs.map((job) => [job.id, job]));
    const orderedJobs: JobPosting[] = [];

    for (const jobId of conversation.jobPostingIds) {
      const job = jobMap.get(jobId);
      if (!job || job.status !== 'READY') {
        throw new BadRequestException(
          `Job posting ${jobId} is not available or ready`,
        );
      }
      orderedJobs.push(job);
    }

    const userMessage = this.chatMessageRepository.create({
      conversationId,
      userId,
      role: 'user',
      content: dto.message,
    });
    await this.chatMessageRepository.save(userMessage);

    const history = await this.chatMessageRepository.find({
      where: { conversationId },
      order: { createdAt: 'ASC' },
    });

    const systemPrompt = this.buildSystemPrompt(resume, orderedJobs);

    const reply = await this.aiService.generateChatReply([
      { role: 'system', content: systemPrompt },
      ...history.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    ]);

    const assistantMessage = this.chatMessageRepository.create({
      conversationId,
      userId,
      role: 'assistant',
      content: reply,
    });
    await this.chatMessageRepository.save(assistantMessage);

    await this.conversationRepository.update(
      { id: conversationId, userId },
      { updatedAt: new Date() },
    );

    return { userMessage, assistantMessage };
  }
}
