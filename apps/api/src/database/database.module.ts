import { Global, Logger, Module, type OnModuleDestroy } from '@nestjs/common';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { config } from '../config.js';
import { closeDatabase, DATABASE, openDatabase } from './database.js';
import { seedSampleData } from './sample-data.js';

/** Provides a single Drizzle/SQLite connection to the whole app. */
@Global()
@Module({
  providers: [
    {
      provide: DATABASE,
      useFactory: () => {
        mkdirSync(path.dirname(config.databaseFile), { recursive: true });
        const db = openDatabase(config.databaseFile);
        const logger = new Logger('Database');
        logger.log(`Using ${config.databaseFile}`);
        if (config.persistent === false) {
          logger.error(
            `DATA IS NOT PERSISTENT: ${config.dataDir} is not on a Railway volume (mount path: ${process.env.RAILWAY_VOLUME_MOUNT_PATH ?? 'none'}). Everything is lost on the next deploy.`,
          );
        }
        // Hosted databases start empty; this loads sample data once (until pickups exist).
        if (process.env['SEED_SAMPLE_DATA'] === 'true') {
          logger.log(seedSampleData(db) ?? 'SEED_SAMPLE_DATA is set, but pickups already exist: nothing seeded.');
        }
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
