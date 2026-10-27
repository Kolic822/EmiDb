import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** apps/api, whether running from src (tests) or dist (runtime). */
export const API_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const config = {
  port: Number(process.env.PORT ?? 3210),
  dataDir: process.env.DATA_DIR ?? path.join(API_ROOT, 'data'),
  get databaseFile() {
    return process.env.DATABASE_FILE ?? path.join(this.dataDir, 'emidb.db');
  },
  get uploadsDir() {
    return path.join(this.dataDir, 'uploads');
  },
  /** When set, the whole API needs this password (shared by everyone who uses the workshop database). */
  get appPassword() {
    // Pasting into a hosting dashboard often adds a trailing space/newline or quotes; ignore those.
    return (process.env.APP_PASSWORD ?? '').trim().replace(/^(["'])(.*)\1$/, '$2');
  },
  /** Signs session cookies; derived from the password unless given, so a new password signs everyone out. */
  get sessionSecret() {
    return process.env.SESSION_SECRET ?? createHash('sha256').update(`emidb-session:${this.appPassword}`).digest('hex');
  },
  get trustProxy() {
    return process.env.TRUST_PROXY === 'true' || !!process.env.RAILWAY_ENVIRONMENT || !!process.env.RENDER;
  },
  /**
   * Whether the data folder survives a redeploy. Only Railway tells us (it sets the volume's mount
   * path when one is attached); elsewhere this is null because the folder is simply on the local disk.
   */
  get persistent(): boolean | null {
    if (!process.env.RAILWAY_ENVIRONMENT) return null;
    const mount = process.env.RAILWAY_VOLUME_MOUNT_PATH;
    return !!mount && path.resolve(this.dataDir).startsWith(path.resolve(mount));
  },
  migrationsDir: path.join(API_ROOT, 'drizzle'),
  /** Built Angular app, served by the API in production when present. */
  webDist: process.env.WEB_DIST ?? path.resolve(API_ROOT, '..', 'web', 'dist', 'web', 'browser'),
  get serveWeb() {
    return existsSync(this.webDist);
  },
  /** Per-file upload limit; total storage is only bounded by the disk behind DATA_DIR. */
  /** Largest backup zip accepted by Restore. */
  maxRestoreBytes: Number(process.env.MAX_RESTORE_MB ?? 4096) * 1024 * 1024,
  maxUploadBytes: Number(process.env.MAX_UPLOAD_MB ?? 25) * 1024 * 1024,
};
