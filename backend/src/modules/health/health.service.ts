import { Injectable } from '@nestjs/common';
import { HealthCheckService, HealthCheck } from '@nestjs/terminus';
import { OcrHealthIndicator } from './ocr-health.indicator';
import { DatabaseHealthIndicator } from './database-health.indicator';

@Injectable()
export class HealthService {
  constructor(
    private readonly health: HealthCheckService,
    private readonly ocrIndicator: OcrHealthIndicator,
    private readonly databaseIndicator: DatabaseHealthIndicator,
  ) {}

  @HealthCheck()
  check() {
    return this.health.check([
      () => this.ocrIndicator.check('ocr'),
      () => this.databaseIndicator.check('database'),
    ]);
  }
}
