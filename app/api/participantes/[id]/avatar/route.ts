import { NextRequest, NextResponse } from 'next/server';
import { buscarAvatarPorId } from '@/lib/db/queries';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const registro = buscarAvatarPorId(id);

  if (!registro) {
    return NextResponse.json({ erro: 'Participante não encontrado.' }, { status: 404 });
  }

  const variante = request.nextUrl.searchParams.get('variante') === 'animado' ? 'animado' : 'estatico';
  const usarEstaticoDedicado = variante === 'estatico' && registro.avatarEstatico;
  const corpo = usarEstaticoDedicado ? registro.avatarEstatico! : registro.avatar;
  const mime = usarEstaticoDedicado ? 'image/webp' : registro.avatarMime;

  const etag = `"${id}-${variante}-${registro.vistoEm.getTime()}"`;
  if (request.headers.get('if-none-match') === etag) {
    return new NextResponse(null, {
      status: 304,
      headers: {
        'Cache-Control': 'no-cache, must-revalidate',
        ETag: etag,
      },
    });
  }

  return new NextResponse(new Uint8Array(corpo), {
    headers: {
      'Content-Type': mime,
      'Cache-Control': 'no-cache, must-revalidate',
      ETag: etag,
    },
  });
}
