import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const updateRepetitionSchema = z.object({
  repeatCount: z.number().int().min(0, 'Repeat count must be 0 or greater').optional(),
  interval: z.number().int().min(1, 'Interval must be at least 1ms').optional(),
  isActive: z.boolean().optional(),
});

export class UpdateRepetitionDto extends createZodDto(updateRepetitionSchema) {}
