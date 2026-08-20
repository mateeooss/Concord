import { NextRequest, NextResponse } from 'next/server';
import { obterStatusNgrok } from '@/lib/ngrok';
import { ehHost } from '@/lib/host';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const status = await obterStatusNgrok();
  const host = ehHost(request);
  return NextResponse.json({ ...status, ehHost: host });
}

