import { Body, Controller, Post } from '@nestjs/common';
import { ResearchOrchestrator } from '../services/orchestrator.service';
import { QuestionRequestDto } from './dto/question-request.dto';
import { AnswerResponseDto } from './dto/answer-response.dto';

@Controller('v1')
export class QaController {
  constructor(private readonly orchestrator: ResearchOrchestrator) {}

  @Post('qa')
  async askQuestion(@Body() payload: QuestionRequestDto): Promise<AnswerResponseDto> {
    return this.orchestrator.answerQuestion(payload);
  }
}
