import { eq } from 'drizzle-orm';
import { db } from './client';
import { participantes, type Participante } from './schema';

export function buscarParticipantePorId(id: string): Participante | undefined {
  return db.select().from(participantes).where(eq(participantes.id, id)).get();
}

export function buscarAvatarPorId(
  id: string,
): Pick<Participante, 'avatar' | 'avatarMime' | 'vistoEm'> | undefined {
  return db
    .select({
      avatar: participantes.avatar,
      avatarMime: participantes.avatarMime,
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
}): Participante {
  const agora = new Date();
  const existente = buscarParticipantePorId(dados.id);

  if (existente) {
    db.update(participantes)
      .set({ nome: dados.nome, avatar: dados.avatar, avatarMime: dados.avatarMime, vistoEm: agora })
      .where(eq(participantes.id, dados.id))
      .run();
  } else {
    db.insert(participantes)
      .values({ ...dados, criadoEm: agora, vistoEm: agora })
      .run();
  }

  return buscarParticipantePorId(dados.id)!;
}
