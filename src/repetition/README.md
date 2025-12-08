# Repetition Module - Custom Handler Usage

## Как использовать кастомный handler извне модуля

### Вариант 1: Переопределить в другом модуле

```typescript
// В вашем модуле (например, notification.module.ts)
import { Module } from '@nestjs/common';
import { RepetitionModule } from '../repetition/repetition.module';
import { EmailRepetitionHandler } from '../repetition/handlers/email-repetition.handler';

@Module({
  imports: [RepetitionModule],
  providers: [
    EmailRepetitionHandler,
    {
      provide: 'REPETITION_HANDLER',
      useClass: EmailRepetitionHandler, // Переопределяем handler
    },
  ],
})
export class NotificationModule {}
```

### Вариант 2: Создать свой handler в любом месте

```typescript
// src/notifications/custom-repetition.handler.ts
import { Injectable } from '@nestjs/common';
import { RepetitionHandler } from '../repetition/interfaces/repetition-handler.interface';
import { Repetition } from '../repetition/entities/repetition.entity';

@Injectable()
export class CustomRepetitionHandler implements RepetitionHandler {
  async handle(repetition: Repetition): Promise<void> {
    // Ваша кастомная логика
    console.log('Custom handler executed!', repetition);
  }
}
```

Затем подключить в `app.module.ts`:

```typescript
@Module({
  providers: [
    {
      provide: 'REPETITION_HANDLER',
      useClass: CustomRepetitionHandler,
    },
  ],
})
export class AppModule {}
```

