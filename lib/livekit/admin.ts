import { RoomServiceClient, TrackSource } from 'livekit-server-sdk';

function obterRoomServiceClient(): RoomServiceClient {
  const url = process.env.LIVEKIT_URL || 'http://127.0.0.1:7880';
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error('LIVEKIT_API_KEY e LIVEKIT_API_SECRET devem estar configurados no ambiente.');
  }

  return new RoomServiceClient(url, apiKey, apiSecret);
}

export async function mutarParticipante(sala: string, identity: string): Promise<void> {
  const svc = obterRoomServiceClient();
  const participante = await svc.getParticipant(sala, identity);
  if (!participante || !participante.tracks) return;

  const faixaAudio = participante.tracks.find(
    (faixa) => faixa.source === TrackSource.MICROPHONE || faixa.type === 0,
  );

  if (faixaAudio && faixaAudio.sid) {
    await svc.mutePublishedTrack(sala, identity, faixaAudio.sid, true);
  }
}

export async function removerParticipante(sala: string, identity: string): Promise<void> {
  const svc = obterRoomServiceClient();
  await svc.removeParticipant(sala, identity);
}
