'use client';

import Link from 'next/link';
import { LiveKitRoom, RoomAudioRenderer } from '@livekit/components-react';
import { OPCOES_AUDIO } from '@/lib/constantes';
import { Grid } from './Grid';
import { BarraControles } from './BarraControles';
import estilos from './Sala.module.css';

type Props = {
  token: string;
  url: string;
};

export function Sala({ token, url }: Props) {
  return (
    <LiveKitRoom
      serverUrl={url}
      token={token}
      connect
      audio={OPCOES_AUDIO}
      className={estilos.shell}
    >
      <RoomAudioRenderer />
      <Grid />
      <BarraControles />
      <Link className={estilos.trocar} href="/perfil">
        Trocar perfil
      </Link>
    </LiveKitRoom>
  );
}
