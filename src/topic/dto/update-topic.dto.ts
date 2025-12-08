import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const updateTopicSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
});

export class UpdateTopicDto extends createZodDto(updateTopicSchema) {}
