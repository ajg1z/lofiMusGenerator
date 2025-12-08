import { Injectable, Logger } from '@nestjs/common';
import { RepetitionHandler } from '../interfaces/repetition-handler.interface';
import { Repetition } from '../entities/repetition.entity';
import { UserService } from '../../user/user.service';

@Injectable()
export class DefaultRepetitionHandler implements RepetitionHandler {
  private readonly logger = new Logger(DefaultRepetitionHandler.name);

  constructor(private readonly userService: UserService) {}

  async handle(repetition: Repetition): Promise<void> {
    const topic = repetition.topic;
    const user = await this.userService.findOne(topic.userId);

    this.logger.log(`Sending notification for topic "${topic.title}" to user ${user.email}`);

    // Дефолтная реализация
    console.log(
      `📧 [Notification] Topic: "${topic.title}", User: ${user.email}, Count: ${repetition.currentCount}`,
    );
  }
}
