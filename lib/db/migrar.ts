import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { db } from './client';
import { buscarOuCriarSalaPadrao } from './queries';

migrate(db, { migrationsFolder: './drizzle' });

buscarOuCriarSalaPadrao();
