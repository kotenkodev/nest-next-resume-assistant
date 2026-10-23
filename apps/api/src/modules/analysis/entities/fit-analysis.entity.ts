import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Resume } from '../../resume/entities/resume.entity';
import { JobPosting } from '../../job-posting/entities/job-posting.entity';

export interface SkillGapResult {
  matchedSkills: string[];
  missingRequired: string[];
  missingPreferred: string[];
}

export interface ExperienceAlignmentResult {
  score: number;
  strengths: string[];
  concerns: string[];
  mapping: Array<{
    jobRequirement: string;
    matchingExperience: string;
    fitLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  }>;
}

export interface InterviewPrepResult {
  technicalQuestions: Array<{
    question: string;
    targetGap: string;
    talkingPoints: string[];
  }>;
  behavioralQuestions: Array<{
    question: string;
    starGuidance: string;
  }>;
}

@Entity('fit_analysis')
@Index(['resumeId', 'jobPostingId'], { unique: true })
export class FitAnalysis {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('text')
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column('uuid')
  resumeId!: string;

  @ManyToOne(() => Resume, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'resumeId' })
  resume!: Resume;

  @Column('uuid')
  jobPostingId!: string;

  @ManyToOne(() => JobPosting, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'jobPostingId' })
  jobPosting!: JobPosting;

  @Column('int')
  matchScore!: number;

  @Column('jsonb')
  skillGaps!: SkillGapResult;

  @Column('jsonb')
  experienceAlignment!: ExperienceAlignmentResult;

  @Column('jsonb')
  interviewPrep!: InterviewPrepResult;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}

