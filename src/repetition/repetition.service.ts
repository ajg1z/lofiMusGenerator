import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
  Optional,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SchedulerRegistry } from '@nestjs/schedule';
import { Repetition } from './entities/repetition.entity';
import { Topic } from '../topic/entities/topic.entity';
import { UserService } from '../user/user.service';
import { RepetitionHandler } from './interfaces/repetition-handler.interface';

@Injectable()
export class RepetitionService {
  private readonly logger = new Logger(RepetitionService.name);

  constructor(
    @InjectRepository(Repetition)
    private readonly repetitionRepository: Repository<Repetition>,
    @InjectRepository(Topic)
    private readonly topicRepository: Repository<Topic>,
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly userService: UserService,
    @Optional()
    @Inject('REPETITION_HANDLER')
    private readonly repetitionHandler?: RepetitionHandler,
  ) {}

  async create(
    topicId: string,
    userId: string,
    repeatCount: number,
    interval: number,
  ): Promise<Repetition> {
    const topic = await this.topicRepository.findOne({ where: { id: topicId } });

    if (!topic) {
      throw new NotFoundException('Topic not found');
    }

    if (topic.userId !== userId) {
      throw new ForbiddenException('You can only create repetitions for your own topics');
    }

    const existingRepetition = await this.repetitionRepository.findOne({ where: { topicId } });
    if (existingRepetition) {
      throw new ForbiddenException('Repetition already exists for this topic');
    }

    const repetition = this.repetitionRepository.create({
      topicId,
      repeatCount,
      interval,
      currentCount: 0,
      isActive: true,
    });

    const savedRepetition = await this.repetitionRepository.save(repetition);

    this.startRepetition(savedRepetition);

    return savedRepetition;
  }

  async findAll(userId?: string): Promise<Repetition[]> {
    const queryBuilder = this.repetitionRepository
      .createQueryBuilder('repetition')
      .leftJoinAndSelect('repetition.topic', 'topic');

    if (userId) {
      queryBuilder.where('topic.userId = :userId', { userId });
    }

    return queryBuilder.getMany();
  }

  async findOne(id: string): Promise<Repetition> {
    const repetition = await this.repetitionRepository.findOne({
      where: { id },
      relations: ['topic'],
    });

    if (!repetition) {
      throw new NotFoundException('Repetition not found');
    }

    return repetition;
  }

  async findByTopicId(topicId: string): Promise<Repetition | null> {
    return await this.repetitionRepository.findOne({
      where: { topicId },
      relations: ['topic'],
    });
  }

  async update(
    id: string,
    userId: string,
    updateData: { repeatCount?: number; interval?: number; isActive?: boolean },
  ): Promise<Repetition> {
    const repetition = await this.findOne(id);

    const topic = await this.topicRepository.findOne({ where: { id: repetition.topicId } });
    if (!topic || topic.userId !== userId) {
      throw new ForbiddenException('You can only update your own repetitions');
    }

    const jobName = `repetition-${repetition.id}`;

    if (updateData.isActive !== undefined) {
      repetition.isActive = updateData.isActive;
      if (updateData.isActive) {
        this.startRepetition(repetition);
      } else {
        this.stopRepetition(jobName);
      }
    }

    if (updateData.repeatCount !== undefined) {
      repetition.repeatCount = updateData.repeatCount;
    }

    if (updateData.interval !== undefined) {
      repetition.interval = updateData.interval;
      if (repetition.isActive) {
        this.stopRepetition(jobName);
        this.startRepetition(repetition);
      }
    }

    const updatedRepetition = await this.repetitionRepository.save(repetition);

    return updatedRepetition;
  }

  async remove(id: string, userId: string): Promise<void> {
    const repetition = await this.findOne(id);

    const topic = await this.topicRepository.findOne({ where: { id: repetition.topicId } });
    if (!topic || topic.userId !== userId) {
      throw new ForbiddenException('You can only delete your own repetitions');
    }

    const jobName = `repetition-${repetition.id}`;
    this.stopRepetition(jobName);

    await this.repetitionRepository.remove(repetition);
  }

  private startRepetition(repetition: Repetition): void {
    const jobName = `repetition-${repetition.id}`;

    if (this.schedulerRegistry.doesExist('interval', jobName)) {
      this.stopRepetition(jobName);
    }

    const interval = setInterval(() => {
      void this.executeRepetition(repetition.id);
    }, repetition.interval);

    this.schedulerRegistry.addInterval(jobName, interval);
    this.logger.log(`Started repetition ${repetition.id} with interval ${repetition.interval}ms`);
  }

  private stopRepetition(jobName: string): void {
    if (this.schedulerRegistry.doesExist('interval', jobName)) {
      const interval = this.schedulerRegistry.getInterval(jobName);
      clearInterval(interval);
      this.schedulerRegistry.deleteInterval(jobName);
      this.logger.log(`Stopped repetition ${jobName}`);
    }
  }

  private async executeRepetition(repetitionId: string): Promise<void> {
    const repetition = await this.repetitionRepository.findOne({
      where: { id: repetitionId },
      relations: ['topic', 'topic.user'],
    });

    if (!repetition || !repetition.isActive) {
      return;
    }

    const isInfinity = repetition.repeatCount === 0;

    const shouldContinue = isInfinity || repetition.currentCount < repetition.repeatCount;

    if (!shouldContinue) {
      this.logger.log(`Repetition ${repetitionId} reached max count, stopping`);
      repetition.isActive = false;
      await this.repetitionRepository.save(repetition);
      this.stopRepetition(`repetition-${repetition.id}`);
      return;
    }

    repetition.currentCount += 1;
    await this.repetitionRepository.save(repetition);

    this.logger.log(
      `Executing repetition ${repetitionId} (${repetition.currentCount}/${repetition.repeatCount || '∞'})`,
    );

    if (this.repetitionHandler) {
      await this.repetitionHandler.handle(repetition);
    }
  }

  async initializeActiveRepetitions(): Promise<void> {
    const activeRepetitions = await this.repetitionRepository.find({
      where: { isActive: true },
    });

    this.logger.log(`Initializing ${activeRepetitions.length} active repetitions`);

    for (const repetition of activeRepetitions) {
      this.startRepetition(repetition);
    }
  }
}
