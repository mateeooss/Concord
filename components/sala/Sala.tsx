'use client';

import Link from 'next/link';
import { Track, type RoomOptions, type RoomConnectOptions } from 'livekit-client';
import { LiveKitRoom, RoomAudioRenderer, useTracks } from '@livekit/components-react';
import { OPCOES_AUDIO } from '@/lib/constantes';
import { Grid } from './Grid';
import { FaixaAvatares } from './FaixaAvatares';
import { TelaCompartilhada } from './TelaCompartilhada';
import { BarraControles } from './BarraControles';
import estilos from './Sala.module.css';

type Props = {
  token: string;
  url: string;
};

const OPCOES_SALA: RoomOptions = {
  singlePeerConnection: false,
  audioCaptureDefaults: OPCOES_AUDIO,
  stopLocalTrackOnUnpublish: true,
  dynacast: true,
};

const OPCOES_CONEXAO: RoomConnectOptions = {
  autoSubscribe: true,
  peerConnectionTimeout: 30_000,
};

function AreaPrincipal() {
  const faixasTela = useTracks([Track.Source.ScreenShare]);
  const faixaTelaAtiva = faixasTela[0];

  if (faixaTelaAtiva) {
    return (
      <div className={estilos.apresentacao}>
        <FaixaAvatares />
        <TelaCompartilhada trackRef={faixaTelaAtiva} />
      </div>
    );
  }

  return <Grid />;
}

export function Sala({ token, url }: Props) {
  return (
    <LiveKitRoom
      serverUrl={url}
      token={token}
      connect
      audio={OPCOES_AUDIO}
      options={OPCOES_SALA}
      connectOptions={OPCOES_CONEXAO}
      className={estilos.shell}
    >
      <RoomAudioRenderer />
      <AreaPrincipal />
      <BarraControles />
      <Link className={estilos.trocar} href="/perfil">
        Trocar perfil
      </Link>
    </LiveKitRoom>
  );
}
