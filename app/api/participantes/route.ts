import { NextRequest, NextResponse } from 'next/server';
import { criarOuAtualizarParticipante } from '@/lib/db/queries';
import { AVATAR_TAMANHO_MAX_SERVIDOR } from '@/lib/constantes';

const TIPOS_ACEITOS = ['image/png', 'image/jpeg', 'image/webp'];

export async function POST(request: NextRequest) {
  const dados = await request.formData();

  const deviceId = dados.get('deviceId');
  const nome = dados.get('nome');
  const avatar = dados.get('avatar');

  if (typeof deviceId !== 'string' || !deviceId) {
    return NextResponse.json({ erro: 'deviceId obrigatório.' }, { status: 400 });
  }
  if (typeof nome !== 'string' || !nome.trim()) {
    return NextResponse.json({ erro: 'Nome obrigatório.' }, { status: 400 });
  }
  if (!(avatar instanceof File)) {
    return NextResponse.json({ erro: 'Selecione uma foto.' }, { status: 400 });
  }
  if (!TIPOS_ACEITOS.includes(avatar.type)) {
    return NextResponse.json({ erro: 'Formato de imagem não suportado.' }, { status: 400 });
  }
  if (avatar.size > AVATAR_TAMANHO_MAX_SERVIDOR) {
    return NextResponse.json({ erro: 'Imagem inválida. Tente novamente.' }, { status: 400 });
  }

  const buffer = Buffer.from(await avatar.arrayBuffer());
  const participante = criarOuAtualizarParticipante({
    id: deviceId,
    nome: nome.trim(),
    avatar: buffer,
    avatarMime: avatar.type,
  });

  return NextResponse.json({ id: participante.id, nome: participante.nome });
}
