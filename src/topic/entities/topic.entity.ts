import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user';
import { PageContent } from '../../page-content/entities/page-content.entity';
import { Repetition } from '../../repetition/entities/repetition.entity';

@Entity('topics')
export class Topic {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ name: 'userId' })
  userId: string;

  @Column()
  title: string;

  @OneToOne(() => PageContent, (pageContent) => pageContent.topic)
  pageContent: PageContent;

  @OneToOne(() => Repetition, (repetition) => repetition.topic)
  repetition: Repetition;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
