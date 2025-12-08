import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  TableInheritance,
  ChildEntity,
} from 'typeorm';
import { PageContent } from './page-content.entity';

@Entity('content_items')
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export abstract class ContentItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => PageContent, (pageContent) => pageContent.contentItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pageContentId' })
  pageContent: PageContent;

  @Column({ name: 'pageContentId' })
  pageContentId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@ChildEntity()
export class TextItem extends ContentItem {
  @Column('text')
  value: string;
}

@ChildEntity()
export class ImgItem extends ContentItem {
  @Column()
  path: string;
}

@ChildEntity()
export class PageContentItem extends ContentItem {
  @ManyToOne(() => PageContent, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'nestedPageContentId' })
  nestedPageContent: PageContent;

  @Column({ name: 'nestedPageContentId' })
  nestedPageContentId: string;
}
