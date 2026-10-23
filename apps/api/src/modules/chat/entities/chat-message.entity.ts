import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';

@Entity('chat_message')
export class ChatMessage {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('text')
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column('text')
  role!: 'user' | 'assistant' | 'system';

  @Column('text')
  content!: string;

  @Column('uuid', { nullable: true })
  resumeId?: string;

  @Column('uuid', { nullable: true })
  jobPostingId?: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}

