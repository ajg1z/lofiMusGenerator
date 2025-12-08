import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const loginSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  password: z.string().min(1, 'Password is required'),
});

export class LoginDto extends createZodDto(loginSchema) {}
