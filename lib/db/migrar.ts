import { eq } from 'drizzle-orm';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { db } from './client';
import { salas } from './schema';
import { SALA_PADRAO } from '../constantes';

migrate(db, { migrationsFolder: './drizzle' });

const existente = db.select().from(salas).where(eq(salas.slug, SALA_PADRAO)).get();
if (!existente) {
  db.insert(salas).values({
    id: crypto.randomUUID(),
    slug: SALA_PADRAO,
    nome: 'Geral',
    criadaEm: new Date(),
  }).run();
}
