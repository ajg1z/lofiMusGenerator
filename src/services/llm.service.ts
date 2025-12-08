import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class LlmService {
  private client?: OpenAI;

  constructor(private readonly configService: ConfigService) {}

  async generateAnswer(question: string, context: string[]): Promise<string> {
    const client = this.ensureClient();
    const model = this.configService.get<string>('KNOWLEDGE_COACH_LLM_MODEL', 'gpt-4o-mini');
    const temperature = this.getNumber('KNOWLEDGE_COACH_LLM_TEMPERATURE', 0.2);
    const maxTokens = this.getNumber('KNOWLEDGE_COACH_MAX_LLM_TOKENS', 800);

    const systemPrompt =
      'You are Knowledge Coach, a meticulous research assistant. Use the provided context snippets and cite concrete facts.';
    const contextBlock = context
      .map((chunk, idx) => `Snippet ${idx + 1}: ${chunk}`)
      .filter(Boolean)
      .join('\n\n');

    const userPrompt = [
      `Question: ${question}`,
      'Context (verbatim, may be redundant):',
      contextBlock,
      '',
      'Craft a thorough yet concise answer (<= 6 paragraphs) with bullet points where helpful. Always mention when information is missing.',
    ].join('\n');

    const response = await client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature,
      max_tokens: maxTokens,
    });

    return response.choices[0]?.message?.content ?? '';
  }

  private ensureClient(): OpenAI {
    if (!this.client) {
      const apiKey = this.configService.get<string>('KNOWLEDGE_COACH_LLM_API_KEY');
      if (!apiKey) {
        throw new InternalServerErrorException('OpenAI API key is not configured.');
      }

      this.client = new OpenAI({ apiKey });
    }

    return this.client;
  }

  private getNumber(key: string, fallback: number): number {
    const value = this.configService.get<string>(key);
    if (value === undefined || value === null) {
      return fallback;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
}
