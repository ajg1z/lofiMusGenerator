import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const createTopicSchema = z.object({
  title: z.string().min(1, 'Title is required'),
});

export class CreateTopicDto extends createZodDto(createTopicSchema) {}
