import { eq, desc, or } from 'drizzle-orm';
import { db } from './client';
import { participantes, mensagens, salas, type Participante, type Sala } from './schema';
import { SALA_PADRAO } from '../constantes';

export type MensagemComAutor = {
  id: number;
  salaId: string;
  participanteId: string;
  corpo: string;
  criadaEm: Date;
  autorNome: string;
  autorVistoEm: Date;
};

export function buscarParticipantePorId(id: string): Participante | undefined {
  return db.select().from(participantes).where(eq(participantes.id, id)).get();
}

export function buscarAvatarPorId(
  id: string,
): Pick<Participante, 'avatar' | 'avatarMime' | 'avatarEstatico' | 'vistoEm'> | undefined {
  return db
    .select({
      avatar: participantes.avatar,
      avatarMime: participantes.avatarMime,
      avatarEstatico: participantes.avatarEstatico,
      vistoEm: participantes.vistoEm,
    })
    .from(participantes)
    .where(eq(participantes.id, id))
    .get();
}

export function criarOuAtualizarParticipante(dados: {
  id: string;
  nome: string;
  avatar: Buffer;
  avatarMime: string;
  avatarEstatico: Buffer | null;
}): Participante {
  const agora = new Date();
  const existente = buscarParticipantePorId(dados.id);

  if (existente) {
    db.update(participantes)
      .set({
        nome: dados.nome,
        avatar: dados.avatar,
        avatarMime: dados.avatarMime,
        avatarEstatico: dados.avatarEstatico,
        vistoEm: agora,
      })
      .where(eq(participantes.id, dados.id))
      .run();
  } else {
    db.insert(participantes)
      .values({ ...dados, criadoEm: agora, vistoEm: agora })
      .run();
  }

  return buscarParticipantePorId(dados.id)!;
}

export function resolverSala(slugOuId: string): Sala | undefined {
  return db
    .select()
    .from(salas)
    .where(or(eq(salas.id, slugOuId), eq(salas.slug, slugOuId)))
    .get();
}

export function buscarOuCriarSalaPadrao(): Sala {
  let sala = db.select().from(salas).where(eq(salas.slug, SALA_PADRAO)).get();
  if (!sala) {
    const id = crypto.randomUUID();
    db.insert(salas)
      .values({
        id,
        slug: SALA_PADRAO,
        nome: 'Geral',
        criadaEm: new Date(),
      })
      .run();
    sala = db.select().from(salas).where(eq(salas.id, id)).get()!;
  }
  return sala;
}

export function inserirMensagem(dados: {
  salaId: string;
  participanteId: string;
  corpo: string;
}): MensagemComAutor | undefined {
  const sala = resolverSala(dados.salaId);
  if (!sala) return undefined;

  const agora = new Date();
  const resultado = db
    .insert(mensagens)
    .values({
      salaId: sala.id,
      participanteId: dados.participanteId,
      corpo: dados.corpo,
      criadaEm: agora,
    })
    .returning()
    .get();

  const autor = buscarParticipantePorId(dados.participanteId);

  return {
    id: resultado.id,
    salaId: sala.slug,
    participanteId: resultado.participanteId,
    corpo: resultado.corpo,
    criadaEm: resultado.criadaEm,
    autorNome: autor?.nome ?? 'Desconhecido',
    autorVistoEm: autor?.vistoEm ?? agora,
  };
}

export function buscarUltimasMensagens(sala: Sala, limite = 200): MensagemComAutor[] {
  const registros = db
    .select({
      id: mensagens.id,
      salaId: salas.slug,
      participanteId: mensagens.participanteId,
      corpo: mensagens.corpo,
      criadaEm: mensagens.criadaEm,
      autorNome: participantes.nome,
      autorVistoEm: participantes.vistoEm,
    })
    .from(mensagens)
    .innerJoin(participantes, eq(mensagens.participanteId, participantes.id))
    .innerJoin(salas, eq(mensagens.salaId, salas.id))
    .where(eq(mensagens.salaId, sala.id))
    .orderBy(desc(mensagens.criadaEm))
    .limit(limite)
    .all();

  return registros.reverse();
}
