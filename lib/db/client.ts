import { existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';

const CAMINHO_DB = 'data/concord.db';

const pasta = dirname(CAMINHO_DB);
if (!existsSync(pasta)) {
  mkdirSync(pasta, { recursive: true });
}

const sqlite = new Database(CAMINHO_DB);
sqlite.pragma('journal_mode = WAL');

export const db = drizzle(sqlite, { schema });
