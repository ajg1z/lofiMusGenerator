import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { AxiosError, isAxiosError } from 'axios';

const TAVILY_ENDPOINT = 'https://api.tavily.com/search';

@Injectable()
export class TavilyService {
  constructor(
    private readonly http: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async search(query: string, maxResults: number): Promise<Record<string, unknown>> {
    const apiKey = this.configService.get<string>('KNOWLEDGE_COACH_TAVILY_API_KEY');
    if (!apiKey) {
      throw new InternalServerErrorException('Tavily API key is not configured.');
    }

    const depth = this.configService.get<string>('KNOWLEDGE_COACH_TAVILY_SEARCH_DEPTH', 'advanced');

    try {
      const response = await this.http.axiosRef.post(
        TAVILY_ENDPOINT,
        {
          api_key: apiKey,
          query,
          search_depth: depth,
          include_images: false,
          include_answer: false,
          max_results: maxResults,
        },
        {
          timeout: this.requestTimeoutMs(),
        },
      );

      return response.data as Record<string, unknown>;
    } catch (error) {
      throw new InternalServerErrorException(this.formatError(error));
    }
  }

  private requestTimeoutMs(): number {
    const timeoutSeconds = Number(
      this.configService.get<string>('KNOWLEDGE_COACH_REQUEST_TIMEOUT_SECONDS') ?? '30',
    );
    return Math.max(1, Math.round(timeoutSeconds * 1000));
  }

  private formatError(error: unknown): string {
    if (isAxiosError(error)) {
      const axiosError = error as AxiosError;
      const status = axiosError.response?.status;
      const detail = axiosError.response?.data;
      return `Tavily request failed${status ? ` (${status})` : ''}: ${JSON.stringify(detail)}`;
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'Unknown Tavily error';
  }
}
