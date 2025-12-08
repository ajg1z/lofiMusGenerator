import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { PageContent } from './entities/page-content.entity';
import { ContentItem, TextItem, ImgItem, PageContentItem } from './entities/content-item.entity';
import { Topic } from '../topic/entities/topic.entity';

@Injectable()
export class PageContentService {
  constructor(
    @InjectRepository(PageContent)
    private readonly pageContentRepository: Repository<PageContent>,
    @InjectRepository(ContentItem)
    private readonly contentItemRepository: Repository<ContentItem>,
    @InjectRepository(Topic)
    private readonly topicRepository: Repository<Topic>,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    topicId: string,
    userId: string,
    title: string,
    content: Array<
      | { type: 'text'; value: string }
      | { type: 'img'; path: string }
      | { type: 'pageContent'; id: string }
    >,
  ): Promise<PageContent> {
    const topic = await this.topicRepository.findOne({ where: { id: topicId } });

    if (!topic) {
      throw new NotFoundException('Topic not found');
    }

    if (topic.userId !== userId) {
      throw new ForbiddenException('You can only add page content to your own topics');
    }

    const pageContent = this.pageContentRepository.create({
      topicId,
      title,
    });

    const savedPageContent = await this.pageContentRepository.save(pageContent);

    const contentItems: ContentItem[] = [];

    for (const item of content) {
      if (item.type === 'text') {
        const textItem = this.dataSource.getRepository(TextItem).create({
          pageContentId: savedPageContent.id,
          value: item.value,
        });
        contentItems.push(textItem);
      } else if (item.type === 'img') {
        const imgItem = this.dataSource.getRepository(ImgItem).create({
          pageContentId: savedPageContent.id,
          path: item.path,
        });
        contentItems.push(imgItem);
      } else if (item.type === 'pageContent') {
        const nestedPageContent = await this.pageContentRepository.findOne({
          where: { id: item.id },
        });
        if (!nestedPageContent) {
          throw new NotFoundException(`Nested page content with id ${item.id} not found`);
        }
        const pageContentItem = this.dataSource.getRepository(PageContentItem).create({
          pageContentId: savedPageContent.id,
          nestedPageContentId: item.id,
        });
        contentItems.push(pageContentItem);
      }
    }

    await this.contentItemRepository.save(contentItems);

    return await this.findOne(savedPageContent.id);
  }

  async findAll(topicId?: string): Promise<PageContent[]> {
    const where = topicId ? { topicId } : {};
    return await this.pageContentRepository.find({
      where,
      relations: ['topic', 'contentItems'],
    });
  }

  async findOne(id: string): Promise<PageContent> {
    const pageContent = await this.pageContentRepository.findOne({
      where: { id },
      relations: ['topic', 'contentItems'],
    });

    if (!pageContent) {
      throw new NotFoundException('Page content not found');
    }

    return pageContent;
  }

  async findByTopicId(topicId: string): Promise<PageContent | null> {
    return await this.pageContentRepository.findOne({
      where: { topicId },
      relations: ['topic', 'contentItems'],
    });
  }

  async update(
    id: string,
    userId: string,
    title?: string,
    content?: Array<
      | { type: 'text'; value: string }
      | { type: 'img'; path: string }
      | { type: 'pageContent'; id: string }
    >,
  ): Promise<PageContent> {
    const pageContent = await this.findOne(id);

    const topic = await this.topicRepository.findOne({ where: { id: pageContent.topicId } });
    if (!topic || topic.userId !== userId) {
      throw new ForbiddenException('You can only update page content in your own topics');
    }

    if (title !== undefined) {
      pageContent.title = title;
      await this.pageContentRepository.save(pageContent);
    }

    if (content !== undefined) {
      // Удаляем старые content items
      if (pageContent.contentItems && pageContent.contentItems.length > 0) {
        await this.contentItemRepository.remove(pageContent.contentItems);
      }

      // Создаем новые content items
      const contentItems: ContentItem[] = [];

      for (const item of content) {
        if (item.type === 'text') {
          const textItem = this.dataSource.getRepository(TextItem).create({
            pageContentId: pageContent.id,
            value: item.value,
          });
          contentItems.push(textItem);
        } else if (item.type === 'img') {
          const imgItem = this.dataSource.getRepository(ImgItem).create({
            pageContentId: pageContent.id,
            path: item.path,
          });
          contentItems.push(imgItem);
        } else if (item.type === 'pageContent') {
          const nestedPageContent = await this.pageContentRepository.findOne({
            where: { id: item.id },
          });
          if (!nestedPageContent) {
            throw new NotFoundException(`Nested page content with id ${item.id} not found`);
          }
          const pageContentItem = this.dataSource.getRepository(PageContentItem).create({
            pageContentId: pageContent.id,
            nestedPageContentId: item.id,
          });
          contentItems.push(pageContentItem);
        }
      }

      await this.contentItemRepository.save(contentItems);
    }

    return await this.findOne(id);
  }

  async remove(id: string, userId: string): Promise<void> {
    const pageContent = await this.findOne(id);

    const topic = await this.topicRepository.findOne({ where: { id: pageContent.topicId } });
    if (!topic || topic.userId !== userId) {
      throw new ForbiddenException('You can only delete page content from your own topics');
    }

    await this.pageContentRepository.remove(pageContent);
  }
}
