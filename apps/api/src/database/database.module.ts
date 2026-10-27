import { Global, Logger, Module, type OnModuleDestroy } from '@nestjs/common';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { config } from '../config.js';
import { closeDatabase, DATABASE, openDatabase } from './database.js';

/** Provides a single Drizzle/SQLite connection to the whole app. */
@Global()
@Module({
  providers: [
    {
      provide: DATABASE,
      useFactory: () => {
        mkdirSync(path.dirname(config.databaseFile), { recursive: true });
        const db = openDatabase(config.databaseFile);
        new Logger('Database').log(`Using ${config.databaseFile}`);
        return db;
      },
    },
  ],
  exports: [DATABASE],
})
export class DatabaseModule implements OnModuleDestroy {
  onModuleDestroy() {
    closeDatabase();
  }
}
