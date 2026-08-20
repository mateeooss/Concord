import { sqliteTable, text, integer, blob, index } from 'drizzle-orm/sqlite-core';

export const salas = sqliteTable('salas', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  nome: text('nome').notNull(),
  criadaEm: integer('criada_em', { mode: 'timestamp' }).notNull(),
});

export const participantes = sqliteTable('participantes', {
  id: text('id').primaryKey(), // UUID do dispositivo
  nome: text('nome').notNull(),
  avatar: blob('avatar', { mode: 'buffer' }).notNull(),
  avatarMime: text('avatar_mime').notNull(),
  avatarEstatico: blob('avatar_estatico', { mode: 'buffer' }),
  criadoEm: integer('criado_em', { mode: 'timestamp' }).notNull(),
  vistoEm: integer('visto_em', { mode: 'timestamp' }).notNull(),
});

export const mensagens = sqliteTable('mensagens', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  salaId: text('sala_id').notNull().references(() => salas.id),
  participanteId: text('participante_id').notNull().references(() => participantes.id),
  corpo: text('corpo').notNull(),
  criadaEm: integer('criada_em', { mode: 'timestamp' }).notNull(),
}, (t) => ({
  porSala: index('idx_mensagens_sala').on(t.salaId, t.criadaEm),
}));

export type Sala = typeof salas.$inferSelect;
export type Participante = typeof participantes.$inferSelect;
export type Mensagem = typeof mensagens.$inferSelect;
