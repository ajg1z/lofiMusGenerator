# Email Configuration

## Переменные окружения для SMTP

Добавьте следующие переменные в ваш `.env` файл:

```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=your-email@gmail.com
```

## Примеры для разных провайдеров

### Gmail
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password  # Используйте App Password, не обычный пароль
SMTP_FROM=your-email@gmail.com
```

### Outlook/Office365
```env
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASSWORD=your-password
SMTP_FROM=your-email@outlook.com
```

### Яндекс
```env
SMTP_HOST=smtp.yandex.ru
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-email@yandex.ru
SMTP_PASSWORD=your-password
SMTP_FROM=your-email@yandex.ru
```

### Mail.ru
```env
SMTP_HOST=smtp.mail.ru
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-email@mail.ru
SMTP_PASSWORD=your-password
SMTP_FROM=your-email@mail.ru
```

## Использование EmailRepetitionHandler

Чтобы использовать email handler вместо дефолтного, обновите `RepetitionModule`:

```typescript
{
  provide: 'REPETITION_HANDLER',
  useClass: EmailRepetitionHandler, // Вместо DefaultRepetitionHandler
}
```

