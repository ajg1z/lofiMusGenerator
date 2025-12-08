import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthModule } from './health/health.module';
import { QaModule } from './qa/qa.module';
import { User } from './user/entities/user.entity';
import { Topic } from './topic/entities/topic.entity';
import { PageContent } from './page-content/entities/page-content.entity';
import { ContentItem } from './page-content/entities/content-item.entity';
import { Repetition } from './repetition/entities/repetition.entity';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { TopicModule } from './topic/topic.module';
import { PageContentModule } from './page-content/page-content.module';
import { RepetitionModule } from './repetition/repetition.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      cache: true,
      ignoreEnvFile: false,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USERNAME', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', 'postgres'),
        database: configService.get<string>('DB_DATABASE', 'lofimus'),
        entities: [User, Topic, PageContent, ContentItem, Repetition],
        synchronize: configService.get<boolean>('DB_SYNCHRONIZE', true),
        logging: configService.get<boolean>('DB_LOGGING', false),
      }),
    }),
    HealthModule,
    QaModule,
    AuthModule,
    UserModule,
    TopicModule,
    PageContentModule,
    RepetitionModule,
  ],
})
export class AppModule {}
