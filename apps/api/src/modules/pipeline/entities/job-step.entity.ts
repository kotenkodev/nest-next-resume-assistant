import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProcessingJob } from './processing-job.entity';

export type StepStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';

@Entity('job_step')
export class JobStep {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  jobId!: string;

  @ManyToOne(() => ProcessingJob, (job) => job.steps, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'jobId' })
  job!: ProcessingJob;

  @Column('text')
  stepKey!: string;

  @Column('text')
  name!: string;

  @Column('int')
  stepOrder!: number;

  @Column('text', { default: 'PENDING' })
  status!: StepStatus;

  @Column('jsonb', { nullable: true })
  inputPayload?: Record<string, unknown>;

  @Column('jsonb', { nullable: true })
  outputPayload?: Record<string, unknown>;

  @Column('text', { nullable: true })
  errorMessage?: string;

  @Column('int', { default: 0 })
  attempts!: number;

  @Column('timestamptz', { nullable: true })
  startedAt?: Date;

  @Column('timestamptz', { nullable: true })
  completedAt?: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}

