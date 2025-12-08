import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const textItemSchema = z.object({
  type: z.literal('text'),
  value: z.string().min(1, 'Text value is required'),
});

const imgItemSchema = z.object({
  type: z.literal('img'),
  path: z.string().min(1, 'Image path is required'),
});

const pageContentItemSchema = z.object({
  type: z.literal('pageContent'),
  id: z.string().uuid('Invalid page content ID'),
});

export const createPageContentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z
    .array(z.union([textItemSchema, imgItemSchema, pageContentItemSchema]))
    .min(1, 'Content array cannot be empty'),
});

export class CreatePageContentDto extends createZodDto(createPageContentSchema) {}
