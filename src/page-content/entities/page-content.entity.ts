import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Topic } from '../../topic/entities/topic.entity';
import { ContentItem } from './content-item.entity';

@Entity('page_contents')
export class PageContent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @OneToOne(() => Topic, (topic) => topic.pageContent, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'topicId' })
  topic: Topic;

  @Column({ name: 'topicId', unique: true })
  topicId: string;

  @OneToMany(() => ContentItem, (item) => item.pageContent, { cascade: true, eager: false })
  contentItems: ContentItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
