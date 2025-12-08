import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Topic } from './entities/topic.entity';

@Injectable()
export class TopicService {
  constructor(
    @InjectRepository(Topic)
    private readonly topicRepository: Repository<Topic>,
  ) {}

  async create(userId: string, title: string): Promise<Topic> {
    const topic = this.topicRepository.create({
      userId,
      title,
    });

    return await this.topicRepository.save(topic);
  }

  async findAll(): Promise<Topic[]> {
    return await this.topicRepository.find({
      relations: ['user', 'pageContent', 'pageContent.contentItems'],
    });
  }

  async findOne(id: string): Promise<Topic> {
    const topic = await this.topicRepository.findOne({
      where: { id },
      relations: ['user', 'pageContent', 'pageContent.contentItems'],
    });

    if (!topic) {
      throw new NotFoundException('Topic not found');
    }

    return topic;
  }

  async findByUserId(userId: string): Promise<Topic | null> {
    return await this.topicRepository.findOne({
      where: { userId },
      relations: ['user', 'pageContent', 'pageContent.contentItems'],
    });
  }

  async update(id: string, userId: string, title?: string): Promise<Topic> {
    const topic = await this.findOne(id);

    if (topic.userId !== userId) {
      throw new ForbiddenException('You can only update your own topics');
    }

    if (title !== undefined) {
      topic.title = title;
    }

    return await this.topicRepository.save(topic);
  }

  async remove(id: string, userId: string): Promise<void> {
    const topic = await this.findOne(id);

    if (topic.userId !== userId) {
      throw new ForbiddenException('You can only delete your own topics');
    }

    await this.topicRepository.remove(topic);
  }
}
