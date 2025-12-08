import { Injectable, Logger } from '@nestjs/common';
import { RepetitionHandler } from '../interfaces/repetition-handler.interface';
import { Repetition } from '../entities/repetition.entity';
import { UserService } from '../../user/user.service';
import { EmailService } from '../../services/email.service';

/**
 * Handler для отправки email уведомлений через SMTP
 */
@Injectable()
export class EmailRepetitionHandler implements RepetitionHandler {
  private readonly logger = new Logger(EmailRepetitionHandler.name);

  constructor(
    private readonly userService: UserService,
    private readonly emailService: EmailService,
  ) {}

  async handle(repetition: Repetition): Promise<void> {
    const topic = repetition.topic;
    const user = await this.userService.findOne(topic.userId);

    this.logger.log(`[Email Handler] Sending email to ${user.email} for topic "${topic.title}"`);

    const subject = `Reminder: ${topic.title}`;
    const isInfinity = repetition.repeatCount === 0;
    const countText = isInfinity
      ? `${repetition.currentCount}`
      : `${repetition.currentCount} of ${repetition.repeatCount}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: #4CAF50;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 5px 5px 0 0;
            }
            .content {
              background-color: #f9f9f9;
              padding: 20px;
              border-radius: 0 0 5px 5px;
            }
            .topic-title {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .info {
              background-color: #e7f3ff;
              padding: 15px;
              border-left: 4px solid #2196F3;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📚 Topic Reminder</h1>
            </div>
            <div class="content">
              <div class="topic-title">${topic.title}</div>
              <p>This is a reminder for your topic.</p>
              <div class="info">
                <strong>Reminder Count:</strong> ${countText}<br>
                <strong>Topic ID:</strong> ${topic.id}<br>
                <strong>Date:</strong> ${new Date().toLocaleString()}
              </div>
              <p>Don't forget to review your topic content!</p>
            </div>
            <div class="footer">
              <p>This is an automated reminder from your Knowledge Coach API.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `Reminder: ${topic.title}\n\nThis is reminder #${countText} for your topic: ${topic.title}.\n\nDon't forget to review your topic content!`;

    try {
      await this.emailService.sendEmail(user.email, subject, html, text);
      this.logger.log(`✅ Email sent successfully to ${user.email}`);
    } catch (error) {
      this.logger.error(`❌ Failed to send email to ${user.email}:`, error);
      // Не бросаем ошибку, чтобы не прерывать выполнение повторения
    }
  }
}
