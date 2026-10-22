import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { JobStep } from './job-step.entity';

export type JobType = 'RESUME_PROCESSING' | 'JOB_PROCESSING' | 'FIT_ANALYSIS';
export type JobStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';

@Entity('processing_job')
export class ProcessingJob {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('text')
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column('text')
  type!: JobType;

  @Column('text', { default: 'PENDING' })
  status!: JobStatus;

  @Column('int', { default: 0 })
  currentStepIndex!: number;

  @Column('text', { nullable: true })
  targetId?: string;

  @Column('jsonb', { nullable: true })
  metadata?: Record<string, unknown>;

  @Column('text', { nullable: true })
  errorMessage?: string;

  @OneToMany(() => JobStep, (step) => step.job, { cascade: true })
  steps!: JobStep[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
