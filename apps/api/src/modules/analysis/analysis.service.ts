import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FitAnalysis } from './entities/fit-analysis.entity';
import { Resume } from '../resume/entities/resume.entity';
import { JobPosting } from '../job-posting/entities/job-posting.entity';
import { AiService } from '../ai/ai.service';

@Injectable()
export class AnalysisService {
  constructor(
    @InjectRepository(FitAnalysis)
    private readonly fitAnalysisRepository: Repository<FitAnalysis>,
    @InjectRepository(Resume)
    private readonly resumeRepository: Repository<Resume>,
    @InjectRepository(JobPosting)
    private readonly jobPostingRepository: Repository<JobPosting>,
    private readonly aiService: AiService,
  ) {}

  async runFitAnalysis(
    userId: string,
    resumeId: string,
    jobPostingId: string,
  ): Promise<FitAnalysis> {
    const resume = await this.resumeRepository.findOne({
      where: { id: resumeId, userId },
    });

    if (!resume) {
      throw new NotFoundException('Resume not found');
    }

    if (resume.status !== 'READY' || !resume.parsedProfile) {
      throw new BadRequestException(
        'Resume is not ready or has no parsed data',
      );
    }

    const job = await this.jobPostingRepository.findOne({
      where: { id: jobPostingId, userId },
    });

    if (!job) {
      throw new NotFoundException('Job posting not found');
    }

    if (job.status !== 'READY' || !job.parsedData) {
      throw new BadRequestException(
        'Job posting is not ready or has no parsed requirements',
      );
    }

    const output = await this.aiService.analyzeFit(
      resume.parsedProfile,
      job.parsedData,
    );

    let analysis = await this.fitAnalysisRepository.findOne({
      where: { userId, resumeId, jobPostingId },
    });

    if (!analysis) {
      analysis = this.fitAnalysisRepository.create({
        userId,
        resumeId,
        jobPostingId,
        matchScore: output.matchScore,
        skillGaps: output.skillGaps,
        experienceAlignment: output.experienceAlignment,
        interviewPrep: output.interviewPrep,
      });
    } else {
      analysis.matchScore = output.matchScore;
      analysis.skillGaps = output.skillGaps;
      analysis.experienceAlignment = output.experienceAlignment;
      analysis.interviewPrep = output.interviewPrep;
    }

    return this.fitAnalysisRepository.save(analysis);
  }

  async getAnalysis(
    userId: string,
    resumeId: string,
    jobPostingId: string,
  ): Promise<FitAnalysis | null> {
    return this.fitAnalysisRepository.findOne({
      where: {
        userId,
        resume: { id: resumeId },
        jobPosting: { id: jobPostingId },
      },
      relations: {
        resume: true,
        jobPosting: true,
      },
    });
  }

  async getAnalysesForResume(
    userId: string,
    resumeId: string,
  ): Promise<FitAnalysis[]> {
    return this.fitAnalysisRepository.find({
      where: { userId, resumeId },
      relations: {
        jobPosting: true,
      },
      order: { matchScore: 'DESC' },
    });
  }
}
