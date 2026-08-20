import { NextRequest, NextResponse } from 'next/server';
import { buscarUltimasMensagens, inserirMensagem, buscarParticipantePorId, resolverSala } from '@/lib/db/queries';
import { SALA_PADRAO } from '@/lib/constantes';

export async function GET(request: NextRequest) {
  const salaId = request.nextUrl.searchParams.get('salaId') || SALA_PADRAO;
  const sala = resolverSala(salaId);

  if (!sala) {
    return NextResponse.json({ erro: 'Sala não encontrada.' }, { status: 404 });
  }

  const mensagens = buscarUltimasMensagens(sala, 200);
  return NextResponse.json(mensagens);
}

export async function POST(request: NextRequest) {
  try {
    const corpoRequisicao = await request.json();
    const { deviceId, corpo, salaId = SALA_PADRAO } = corpoRequisicao;

    if (typeof deviceId !== 'string' || !deviceId.trim()) {
      return NextResponse.json({ erro: 'deviceId obrigatório.' }, { status: 400 });
    }

    if (typeof corpo !== 'string' || !corpo.trim()) {
      return NextResponse.json({ erro: 'Mensagem não pode ser vazia.' }, { status: 400 });
    }

    if (corpo.length > 2000) {
      return NextResponse.json({ erro: 'Mensagem excede o limite de 2000 caracteres.' }, { status: 400 });
    }

    const participante = buscarParticipantePorId(deviceId);
    if (!participante) {
      return NextResponse.json({ erro: 'Participante não encontrado.' }, { status: 404 });
    }

    const mensagemCriada = inserirMensagem({
      salaId,
      participanteId: deviceId,
      corpo: corpo.trim(),
    });

    if (!mensagemCriada) {
      return NextResponse.json({ erro: 'Sala não encontrada.' }, { status: 404 });
    }

    return NextResponse.json(mensagemCriada, { status: 201 });
  } catch (erro) {
    console.error('[API Mensagens]', erro);
    return NextResponse.json({ erro: 'Erro ao processar mensagem.' }, { status: 500 });
  }
}
