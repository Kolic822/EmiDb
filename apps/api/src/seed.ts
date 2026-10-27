/**
 * Seeds the database with sample data so the UI has something to show.
 * Safe to run repeatedly: it only seeds a database without pickups.
 *
 *   npm run build -w api && npm run seed -w api
 */
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { config } from './config.js';
import { closeDatabase, openDatabase } from './database/database.js';
import { seedSampleData } from './database/sample-data.js';

mkdirSync(path.dirname(config.databaseFile), { recursive: true });
const db = openDatabase(config.databaseFile);
console.log(seedSampleData(db) ?? 'Database already has data, nothing to do.');
closeDatabase();
