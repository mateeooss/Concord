import { NextRequest, NextResponse } from 'next/server';
import { ehHost } from '@/lib/host';
import { mutarParticipante, removerParticipante } from '@/lib/livekit/admin';
import { SALA_PADRAO } from '@/lib/constantes';

export async function POST(request: NextRequest) {
  if (!ehHost(request)) {
    return NextResponse.json(
      { erro: 'Apenas o host pode realizar ações de moderação.' },
      { status: 403 },
    );
  }

  try {
    const corpo = await request.json();
    const { acao, participanteId, salaId = SALA_PADRAO } = corpo;

    if (typeof participanteId !== 'string' || !participanteId.trim()) {
      return NextResponse.json(
        { erro: 'participanteId obrigatório.' },
        { status: 400 },
      );
    }

    if (acao !== 'mutar' && acao !== 'remover') {
      return NextResponse.json(
        { erro: 'Ação inválida. Escolha "mutar" ou "remover".' },
        { status: 400 },
      );
    }

    if (acao === 'mutar') {
      await mutarParticipante(salaId, participanteId.trim());
      return NextResponse.json({ ok: true, acao: 'mutar' });
    }

    if (acao === 'remover') {
      await removerParticipante(salaId, participanteId.trim());
      return NextResponse.json({ ok: true, acao: 'remover' });
    }
  } catch (erro) {
    console.error('[API Moderação]', erro);
    return NextResponse.json(
      { erro: 'Falha ao executar ação de moderação.' },
      { status: 500 },
    );
  }
}
