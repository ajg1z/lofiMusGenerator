import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Topic } from '../../topic/entities/topic.entity';

@Entity('repetitions')
export class Repetition {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Topic, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'topicId' })
  topic: Topic;

  @Column({ name: 'topicId', unique: true })
  topicId: string;

  @Column({ type: 'int', default: 0 })
  repeatCount: number;

  @Column({ type: 'int' })
  interval: number;

  @Column({ type: 'int', default: 0 })
  currentCount: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
