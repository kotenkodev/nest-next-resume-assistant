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

export interface ParsedProfile {
  name?: string;
  email?: string;
  phone?: string;
  summary?: string;
  skills: {
    languages: string[];
    frameworks: string[];
    tools: string[];
    softSkills: string[];
  };
  experience: Array<{
    title: string;
    company: string;
    startDate?: string;
    endDate?: string;
    highlights: string[];
  }>;
  education: Array<{
    institution: string;
    degree: string;
    year?: string;
  }>;
}

@Entity('resume')
export class Resume {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('text')
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column('text', { nullable: true })
  title?: string;

  @Column('text')
  fileName!: string;

  @Column('int', { nullable: true })
  fileSize?: number;

  @Column('text')
  rawText!: string;

  @Column('jsonb', { nullable: true })
  parsedProfile?: ParsedProfile;

  @Column('vector', { length: 1536, nullable: true })
  embedding?: number[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
