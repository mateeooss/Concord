import { NextRequest, NextResponse } from 'next/server';
import { buscarAvatarPorId } from '@/lib/db/queries';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const registro = buscarAvatarPorId(id);

  if (!registro) {
    return NextResponse.json({ erro: 'Participante não encontrado.' }, { status: 404 });
  }

  const etag = `"${id}-${registro.vistoEm.getTime()}"`;
  if (request.headers.get('if-none-match') === etag) {
    return new NextResponse(null, { status: 304, headers: { ETag: etag } });
  }

  return new NextResponse(new Uint8Array(registro.avatar), {
    headers: {
      'Content-Type': registro.avatarMime,
      'Cache-Control': 'private, max-age=31536000, must-revalidate',
      ETag: etag,
    },
  });
}
