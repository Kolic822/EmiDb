import { Controller, Get, Inject } from '@nestjs/common';
import { count, sum } from 'drizzle-orm';
import { existsSync, statSync } from 'node:fs';
import { statfs } from 'node:fs/promises';
import { config } from '../config.js';
import { DATABASE, type Db } from '../database/database.js';
import { attachments } from '../database/schema.js';

export interface StorageInfo {
  fileCount: number;
  filesBytes: number;
  databaseBytes: number;
  /** Free space on the disk holding the data folder; null when the platform cannot say. */
  freeBytes: number | null;
  totalBytes: number | null;
}

/** How much room the database and uploaded files take, and how much is left on the disk. */
@Controller('storage')
export class StorageController {
  constructor(@Inject(DATABASE) private readonly db: Db) {}

  @Get()
  async get(): Promise<StorageInfo> {
    const files = this.db.select({ n: count(), bytes: sum(attachments.size) }).from(attachments).get();
    const disk = await statfs(config.dataDir).catch(() => null);
    return {
      fileCount: files?.n ?? 0,
      filesBytes: Number(files?.bytes ?? 0),
      databaseBytes: ['', '-wal'].reduce((total, suffix) => {
        const file = config.databaseFile + suffix;
        return total + (existsSync(file) ? statSync(file).size : 0);
      }, 0),
      freeBytes: disk ? disk.bavail * disk.bsize : null,
      totalBytes: disk ? disk.blocks * disk.bsize : null,
    };
  }
}
