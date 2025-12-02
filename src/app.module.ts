import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './health/health.module';
import { QaModule } from './qa/qa.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      cache: true,
      ignoreEnvFile: false,
    }),
    HealthModule,
    QaModule,
  ],
})
export class AppModule {}
