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

export interface ParsedJobRequirements {
  role: string;
  level?: string;
  requiredSkills: string[];
  preferredSkills: string[];
  responsibilities: string[];
  experienceYears?: number;
}

@Entity('job_posting')
export class JobPosting {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('text')
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column('text')
  title!: string;

  @Column('text', { nullable: true })
  company?: string;

  @Column('text')
  rawText!: string;

  @Column('jsonb', { nullable: true })
  parsedData?: ParsedJobRequirements;

  @Column('vector', { length: 1536, nullable: true })
  embedding?: number[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
