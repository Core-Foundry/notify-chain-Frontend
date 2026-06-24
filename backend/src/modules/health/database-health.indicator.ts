import { Injectable } from '@nestjs/common';
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';
import { Socket } from 'net';

@Injectable()
export class DatabaseHealthIndicator extends HealthIndicator {
  private readonly timeoutMs = 2_000;

  async check(key: string): Promise<HealthIndicatorResult> {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      return {
        [key]: {
          status: 'unknown',
          details: {
            message: 'DATABASE_URL not configured',
          },
        },
      };
    }

    const parsed = new URL(databaseUrl);
    const host = parsed.hostname;
    const port = Number(parsed.port || this.defaultPort(parsed.protocol));

    try {
      await this.checkTcpConnection(host, port, this.timeoutMs);
      return this.getStatus(key, true, {
        database: parsed.pathname?.replace(/^\//, '') || parsed.protocol,
        host,
        port,
      });
    } catch (error) {
      const status = this.getStatus(key, false, {
        database: parsed.pathname?.replace(/^\//, '') || parsed.protocol,
        host,
        port,
        message: error instanceof Error ? error.message : 'unable to connect',
      });
      throw new HealthCheckError('Database connectivity failed', status);
    }
  }

  private defaultPort(protocol: string): number {
    switch (protocol) {
      case 'postgresql:':
      case 'postgres:':
        return 5432;
      case 'mysql:':
        return 3306;
      case 'mongodb:':
        return 27017;
      default:
        return 0;
    }
  }

  private checkTcpConnection(
    host: string,
    port: number,
    timeoutMs: number,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const socket = new Socket();
      const onError = (err: Error) => {
        cleanup();
        reject(err);
      };
      const onTimeout = () => {
        cleanup();
        reject(new Error('connection timed out'));
      };
      const onConnect = () => {
        cleanup();
        resolve();
      };

      const cleanup = () => {
        socket.off('error', onError);
        socket.off('timeout', onTimeout);
        socket.off('connect', onConnect);
        socket.destroy();
      };

      socket.setTimeout(timeoutMs);
      socket.once('error', onError);
      socket.once('timeout', onTimeout);
      socket.once('connect', onConnect);
      socket.connect(port, host);
    });
  }
}
