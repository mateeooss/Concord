import { AccessToken } from 'livekit-server-sdk';

export async function criarToken({
  identity,
  nome,
  sala,
}: {
  identity: string;
  nome: string;
  sala: string;
}): Promise<string> {
  const token = new AccessToken(process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET, {
    identity,
    name: nome,
    ttl: '6h',
  });

  token.addGrant({
    room: sala,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  });

  return token.toJwt();
}
