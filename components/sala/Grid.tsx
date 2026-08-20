'use client';

import { useParticipants } from '@livekit/components-react';
import { Avatar } from './Avatar';
import estilos from './Grid.module.css';

export function Grid() {
  const participantes = useParticipants();

  return (
    <div className={estilos.grid}>
      {participantes.map((participante) => (
        <Avatar key={participante.identity} participant={participante} tamanho={96} />
      ))}
    </div>
  );
}
