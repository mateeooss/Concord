import { NextRequest, NextResponse } from 'next/server';
import { buscarParticipantePorId } from '@/lib/db/queries';
import { ehHost } from '@/lib/host';

export async function GET(request: NextRequest) {
  const deviceId = request.nextUrl.searchParams.get('deviceId');
  if (!deviceId) {
    return NextResponse.json({ erro: 'deviceId obrigatório.' }, { status: 400 });
  }

  const participante = buscarParticipantePorId(deviceId);
  if (!participante) {
    return NextResponse.json({ erro: 'Participante não encontrado.' }, { status: 404 });
  }

  return NextResponse.json({
    id: participante.id,
    nome: participante.nome,
    ehHost: ehHost(request),
  });
}
