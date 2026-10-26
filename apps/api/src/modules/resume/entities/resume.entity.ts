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
import type { DocumentStatus, ParsedProfile } from '@repo/shared';

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
  parsedProfile?: ParsedProfile;

  @Column('vector', { length: 1536, nullable: true })
  embedding?: number[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
