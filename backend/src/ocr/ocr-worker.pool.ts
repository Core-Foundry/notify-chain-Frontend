import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { createWorker, Worker } from 'tesseract.js';

@Injectable()
export class OcrWorkerPool implements OnModuleInit {
  private readonly logger = new Logger(OcrWorkerPool.name);
  private workers: Worker[] = [];
  private busy = new Set<Worker>();
  private failedWorkers = 0;
  private total: number;

  async onModuleInit() {
    this.total = parseInt(process.env.MAX_WORKERS ?? '4', 10);
    // During tests we avoid initializing real tesseract workers to keep tests fast
    // and not require native dependencies.
    if (process.env.NODE_ENV === 'test') {
      this.logger.log(`OCR pool test mode: total=${this.total}`);
      return;
    }

    await Promise.all(
      Array.from({ length: this.total }, () => this.initWorker()),
    );
    this.logger.log(
      `OCR pool ready: ${this.workers.length} available, ${this.failedWorkers} failed`,
    );
  }

  private async initWorker() {
    try {
      const w = await createWorker('eng');
      this.workers.push(w);
    } catch (err) {
      this.failedWorkers++;
      this.logger.error('Failed to init Tesseract worker', err);
    }
  }

  async acquire(): Promise<Worker | null> {
    const w = this.workers.find((w) => !this.busy.has(w));
    if (!w) return null;
    this.busy.add(w);
    return w;
  }

  release(worker: Worker) {
    this.busy.delete(worker);
  }

  getHealthStatus(): { total: number; available: number; failed: number } {
    return {
      total: this.total,
      available: this.workers.length - this.busy.size,
      failed: this.failedWorkers,
    };
  }
}
