import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common';
import { ZipArchive } from 'archiver';
import Database from 'better-sqlite3';
import { count } from 'drizzle-orm';
import { existsSync, mkdirSync, mkdtempSync, renameSync, rmSync } from 'node:fs';
import path from 'node:path';
import { config } from '../config.js';
import { DATABASE, type Db, getSqlite } from '../database/database.js';
import { attachments, pickups } from '../database/schema.js';
import { extractBackup } from './zip.js';

export interface RestoreResult {
  pickups: number;
  files: number;
}

const MIGRATIONS_TABLE = '__drizzle_migrations';

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);
  private restoring = false;

  constructor(@Inject(DATABASE) private readonly db: Db) {}

  /** A zip with a consistent copy of the database and every uploaded file. Streams while it is built. */
  async createBackup(): Promise<ZipArchive> {
    mkdirSync(config.dataDir, { recursive: true });
    const work = mkdtempSync(path.join(config.dataDir, 'backup-'));
    const cleanup = () => rmSync(work, { recursive: true, force: true });
    try {
      const copy = path.join(work, 'emidb.db');
      await getSqlite().backup(copy);

      const archive = new ZipArchive({ zlib: { level: 1 } });
      archive.on('error', (error) => this.logger.error(`Backup failed: ${error.message}`));
      archive.on('close', cleanup);
      archive.file(copy, { name: 'emidb.db' });
      archive.append(JSON.stringify(this.manifest(), null, 2), { name: 'manifest.json' });
      if (existsSync(config.uploadsDir)) archive.directory(config.uploadsDir, 'uploads');
      void archive.finalize();
      return archive;
    } catch (error) {
      cleanup();
      throw error;
    }
  }

  /** Replaces all data with the contents of a backup zip. Nothing changes if the backup is not usable. */
  async restore(zipFile: string): Promise<RestoreResult> {
    if (this.restoring) throw new BadRequestException('A restore is already running');
    this.restoring = true;
    mkdirSync(config.dataDir, { recursive: true });
    const work = mkdtempSync(path.join(config.dataDir, 'restore-'));
    try {
      const extracted = await extractBackup(zipFile, work).catch((error: Error) => {
        throw new BadRequestException(error.message);
      });
      if (!extracted.database) throw new BadRequestException('This zip is not an emidb backup (emidb.db is missing)');

      const restoredDb = path.join(work, 'emidb.db');
      this.copyDatabase(restoredDb);
      this.swapUploads(path.join(work, 'uploads'));
      const result = {
        pickups: this.db.select({ n: count() }).from(pickups).get()?.n ?? 0,
        files: this.db.select({ n: count() }).from(attachments).get()?.n ?? 0,
      };
      this.logger.log(`Restored backup: ${result.pickups} pickups, ${result.files} files`);
      return result;
    } finally {
      rmSync(work, { recursive: true, force: true });
      this.restoring = false;
    }
  }

  private manifest() {
    return {
      app: 'emidb',
      createdAt: new Date().toISOString(),
      schemaVersion: this.migrationCount(getSqlite()),
      pickups: this.db.select({ n: count() }).from(pickups).get()?.n ?? 0,
      files: this.db.select({ n: count() }).from(attachments).get()?.n ?? 0,
    };
  }

  private migrationCount(sqlite: Database.Database): number {
    const exists = sqlite.prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ?").get(MIGRATIONS_TABLE);
    return exists ? (sqlite.prepare(`SELECT count(*) AS n FROM ${MIGRATIONS_TABLE}`).get() as { n: number }).n : 0;
  }

  /**
   * Copies every table from the backup into the live database in one transaction, so a bad backup
   * leaves the current data untouched. Only columns present on both sides are copied, which lets
   * a backup from an older version of the app be restored.
   */
  private copyDatabase(file: string): void {
    const sqlite = getSqlite();

    const candidate = new Database(file);
    try {
      if (candidate.pragma('integrity_check', { simple: true }) !== 'ok') {
        throw new BadRequestException('The backup database is damaged');
      }
      if (this.migrationCount(candidate) > this.migrationCount(sqlite)) {
        throw new BadRequestException('This backup comes from a newer version of emidb. Update the app first.');
      }
      if (!candidate.prepare("SELECT 1 FROM sqlite_master WHERE name = 'pickups'").get()) {
        throw new BadRequestException('This zip is not an emidb backup');
      }
    } finally {
      candidate.close();
    }

    const tables = (
      sqlite
        .prepare(`SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' AND name <> ?`)
        .all(MIGRATIONS_TABLE) as { name: string }[]
    ).map((row) => row.name);

    sqlite.pragma('foreign_keys = OFF'); // order of deletes and inserts is irrelevant; checked before commit
    sqlite.prepare('ATTACH DATABASE ? AS restore').run(file);
    try {
      sqlite.transaction(() => {
        for (const table of tables) {
          const quoted = `"${table}"`;
          sqlite.exec(`DELETE FROM main.${quoted}`);
          const theirs = new Set(
            (sqlite.prepare(`PRAGMA restore.table_info(${quoted})`).all() as { name: string }[]).map((c) => c.name),
          );
          const shared = (sqlite.prepare(`PRAGMA main.table_info(${quoted})`).all() as { name: string }[])
            .map((c) => c.name)
            .filter((name) => theirs.has(name))
            .map((name) => `"${name}"`);
          if (!shared.length) continue;
          const columns = shared.join(', ');
          sqlite.exec(`INSERT INTO main.${quoted} (${columns}) SELECT ${columns} FROM restore.${quoted}`);
        }
        if ((sqlite.pragma('foreign_key_check') as unknown[]).length) {
          throw new BadRequestException('The backup is inconsistent (broken links between entries)');
        }
      })();
    } finally {
      sqlite.exec('DETACH DATABASE restore');
      sqlite.pragma('foreign_keys = ON');
    }
  }

  /** Puts the restored files in place of the current ones. */
  private swapUploads(incoming: string): void {
    mkdirSync(incoming, { recursive: true });
    const previous = `${config.uploadsDir}.previous`;
    rmSync(previous, { recursive: true, force: true });
    if (existsSync(config.uploadsDir)) renameSync(config.uploadsDir, previous);
    renameSync(incoming, config.uploadsDir);
    rmSync(previous, { recursive: true, force: true });
  }
}
