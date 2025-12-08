import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const createRepetitionSchema = z.object({
  repeatCount: z.number().int().min(0, 'Repeat count must be 0 or greater'),
  interval: z.number().int().min(1, 'Interval must be at least 1ms'),
});

export class CreateRepetitionDto extends createZodDto(createRepetitionSchema) {}
