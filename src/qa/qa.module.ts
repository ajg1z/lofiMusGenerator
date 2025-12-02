import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { QaController } from './qa.controller';
import { TavilyService } from '../services/tavily.service';
import { LlmService } from '../services/llm.service';
import { ResearchOrchestrator } from '../services/orchestrator.service';

@Module({
  imports: [
    HttpModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const timeoutSeconds = Number(
          config.get<string>('KNOWLEDGE_COACH_REQUEST_TIMEOUT_SECONDS') ?? '30',
        );
        return {
          timeout: Math.max(1, Math.round(timeoutSeconds * 1000)),
          maxRedirects: 3,
        };
      },
    }),
  ],
  controllers: [QaController],
  providers: [TavilyService, LlmService, ResearchOrchestrator],
})
export class QaModule {}
