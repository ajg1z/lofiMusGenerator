import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ZodValidationPipe } from 'nestjs-zod';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ZodValidationPipe());

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 8000);
  await app.listen(port);
  console.log(`Knowledge Coach API listening on port ${port}`);
}

bootstrap().catch((error) => {
  console.error('Failed to bootstrap NestJS application', error);
  process.exit(1);
});
