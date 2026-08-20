export type RespostaNgrok =
  | { estado: 'ativo'; url: string; ehHost?: boolean }
  | { estado: 'ausente'; ehHost?: boolean };


export async function obterStatusNgrok(): Promise<RespostaNgrok> {
  try {
    const resposta = await fetch('http://127.0.0.1:4040/api/tunnels', {
      signal: AbortSignal.timeout(1000),
      cache: 'no-store',
    });

    if (!resposta.ok) {
      return { estado: 'ausente' };
    }

    const dados = await resposta.json();
    const tunel =
      dados.tunnels?.find((t: { proto?: string; public_url?: string }) => t.proto === 'https') ??
      dados.tunnels?.[0];

    if (tunel?.public_url) {
      return { estado: 'ativo', url: tunel.public_url };
    }

    return { estado: 'ausente' };
  } catch {
    return { estado: 'ausente' };
  }
}
