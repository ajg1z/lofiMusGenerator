import { Injectable } from '@nestjs/common';
import { TavilyService } from './tavily.service';
import { LlmService } from './llm.service';
import { QuestionRequestDto } from '../qa/dto/question-request.dto';
import { AnswerResponseDto } from '../qa/dto/answer-response.dto';
import { SourceDto } from '../qa/dto/source.dto';

type TavilyResult = {
  title?: string;
  url?: string;
  content?: string;
};

type TavilyPayload = {
  results?: TavilyResult[];
  [key: string]: unknown;
};

@Injectable()
export class ResearchOrchestrator {
  constructor(
    private readonly tavilyService: TavilyService,
    private readonly llmService: LlmService,
  ) {}

  async answerQuestion(payload: QuestionRequestDto): Promise<AnswerResponseDto> {
    const scopedQuestion = payload.focus
      ? `${payload.question} (Focus: ${payload.focus})`
      : payload.question;

    const searchPayload = (await this.tavilyService.search(
      scopedQuestion,
      payload.maxSearchResults ?? 5,
    )) as TavilyPayload;

    const results = Array.isArray(searchPayload.results) ? searchPayload.results : [];
    const contextSnippets = results.map((item) => item?.content ?? '');
    const answer = await this.llmService.generateAnswer(scopedQuestion, contextSnippets);

    const sources: SourceDto[] = results.map((item) => ({
      title: item?.title ?? undefined,
      url: item?.url ?? undefined,
      snippet: item?.content ?? undefined,
    }));

    const citations = sources
      .map((source) => source.url)
      .filter((url): url is string => Boolean(url));

    return {
      answer,
      sources,
      citations,
      rawSearch: searchPayload,
    };
  }
}
