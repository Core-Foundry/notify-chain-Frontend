import { Controller, Post, HttpCode, ServiceUnavailableException } from '@nestjs/common';
import { OcrWorkerPool } from './ocr-worker.pool';

@Controller('api/v1/ocr')
export class OcrController {
  constructor(private readonly pool: OcrWorkerPool) {}

  @Post()
  @HttpCode(202)
  async enqueue() {
    const { available } = this.pool.getHealthStatus();
    if (available === 0) {
      throw new ServiceUnavailableException('No OCR workers available');
    }
    return { status: 'queued' };
  }
}
