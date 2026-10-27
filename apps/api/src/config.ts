import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** apps/api, whether running from src (tests) or dist (runtime). */
export const API_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const config = {
  port: Number(process.env.PORT ?? 3000),
  dataDir: process.env.DATA_DIR ?? path.join(API_ROOT, 'data'),
  get databaseFile() {
    return process.env.DATABASE_FILE ?? path.join(this.dataDir, 'emidb.db');
  },
  get uploadsDir() {
    return path.join(this.dataDir, 'uploads');
  },
  migrationsDir: path.join(API_ROOT, 'drizzle'),
  /** Built Angular app, served by the API in production when present. */
  webDist: process.env.WEB_DIST ?? path.resolve(API_ROOT, '..', 'web', 'dist', 'web', 'browser'),
  get serveWeb() {
    return existsSync(this.webDist);
  },
  maxUploadBytes: 25 * 1024 * 1024,
};
