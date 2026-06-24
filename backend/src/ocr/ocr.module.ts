import { Module } from '@nestjs/common';
import { OcrWorkerPool } from './ocr-worker.pool';
import { OcrService } from './ocr.service';
import { OcrController } from './ocr.controller';

@Module({
  providers: [OcrWorkerPool, OcrService],
  controllers: [OcrController],
  exports: [OcrWorkerPool],
})
export class OcrModule {}
