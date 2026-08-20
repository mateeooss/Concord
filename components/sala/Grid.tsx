'use client';

import { useParticipants } from '@livekit/components-react';
import { Avatar } from './Avatar';
import estilos from './Grid.module.css';

type Props = {
  ehHost?: boolean;
};

export function Grid({ ehHost = false }: Props) {
  const participantes = useParticipants();

  return (
    <div className={estilos.container}>
      <div className={estilos.grid}>
        {participantes.map((participante) => (
          <Avatar
            key={participante.identity}
            participant={participante}
            tamanho={96}
            ehHost={ehHost}
          />
        ))}
      </div>
      {participantes.length <= 1 && (
        <p className={estilos.dicaSozinho}>
          Você é a única pessoa na chamada por enquanto.
        </p>
      )}
    </div>
  );
}
