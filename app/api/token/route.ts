import { NextRequest, NextResponse } from 'next/server';
import { buscarParticipantePorId } from '@/lib/db/queries';
import { criarToken } from '@/lib/livekit/token';
import { SALA_PADRAO } from '@/lib/constantes';

export async function POST(request: NextRequest) {
  const { deviceId } = await request.json();

  if (typeof deviceId !== 'string' || !deviceId) {
    return NextResponse.json({ erro: 'deviceId obrigatório.' }, { status: 400 });
  }

  const participante = buscarParticipantePorId(deviceId);
  if (!participante) {
    return NextResponse.json({ erro: 'Participante não encontrado.' }, { status: 401 });
  }

  const token = await criarToken({
    identity: participante.id,
    nome: participante.nome,
    sala: SALA_PADRAO,
  });

  return NextResponse.json({ token, url: process.env.LIVEKIT_URL });
}
