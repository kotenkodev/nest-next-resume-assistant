import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import type { DocumentStatus } from '../../storage/document-status';
import type { ParsedJobRequirements } from '../schemas/parsed-job-requirements.schema';

@Entity('job_posting')
export class JobPosting {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('text')
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column('text', { nullable: true })
  title!: string | null;

  @Column('text', { nullable: true })
  company?: string;

  @Column('text')
  fileName!: string;

  @Column('int')
  fileSize!: number;

  @Column('text', { unique: true })
  s3Key!: string;

  @Column('text')
  contentType!: string;

  @Column('text', { default: 'PENDING_UPLOAD' })
  status!: DocumentStatus;

  @Column('text', { nullable: true })
  rawText!: string | null;

  @Column('jsonb', { nullable: true })
  parsedData?: ParsedJobRequirements;

  @Column('vector', { length: 1536, nullable: true })
  embedding?: number[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
