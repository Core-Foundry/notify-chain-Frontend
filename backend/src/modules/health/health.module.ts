import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { OcrHealthIndicator } from './ocr-health.indicator';
import { DatabaseHealthIndicator } from './database-health.indicator';
import { OcrModule } from '../../ocr/ocr.module';

@Module({
  imports: [TerminusModule, OcrModule],
  controllers: [HealthController],
  providers: [HealthService, OcrHealthIndicator, DatabaseHealthIndicator],
})
export class HealthModule {}
