import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { RepetitionService } from './repetition.service';
import { RepetitionController } from './repetition.controller';
import { Repetition } from './entities/repetition.entity';
import { Topic } from '../topic/entities/topic.entity';
import { UserModule } from '../user/user.module';
import { DefaultRepetitionHandler } from './handlers/default-repetition.handler';
import { EmailService } from '../services/email.service';

@Module({
  imports: [ScheduleModule.forRoot(), TypeOrmModule.forFeature([Repetition, Topic]), UserModule],
  controllers: [RepetitionController],
  providers: [
    RepetitionService,
    DefaultRepetitionHandler,
    EmailService,
    {
      provide: 'REPETITION_HANDLER',
      useClass: DefaultRepetitionHandler,
    },
  ],
  exports: [RepetitionService, EmailService],
})
export class RepetitionModule implements OnModuleInit {
  constructor(
    private readonly repetitionService: RepetitionService,
    private readonly emailService: EmailService,
  ) {}

  async onModuleInit() {
    // Проверяем SMTP соединение при старте
    await this.emailService.verifyConnection();
    await this.repetitionService.initializeActiveRepetitions();
  }
}
