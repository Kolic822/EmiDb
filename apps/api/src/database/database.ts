import Database from 'better-sqlite3';
import { drizzle, type BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { config } from '../config.js';
import * as schema from './schema.js';

export const DATABASE = Symbol('DATABASE');
export type Db = BetterSQLite3Database<typeof schema>;

let sqlite: Database.Database | undefined;

/** Opens (and migrates) the SQLite file. `:memory:` is used by tests. */
export function openDatabase(file: string): Db {
  sqlite = new Database(file);
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');
  const db = drizzle(sqlite, { schema, casing: 'snake_case' });
  migrate(db, { migrationsFolder: config.migrationsDir });
  return db;
}

/** The raw better-sqlite3 handle, for backup and restore which work below the ORM. */
export function getSqlite(): Database.Database {
  if (!sqlite) throw new Error('Database is not open');
  return sqlite;
}

export function closeDatabase(): void {
  sqlite?.close();
  sqlite = undefined;
}

export const now = (): string => new Date().toISOString();
