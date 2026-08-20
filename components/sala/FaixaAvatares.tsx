'use client';

import { Track, type Participant } from 'livekit-client';
import { useParticipants, useIsSpeaking, useTrackMutedIndicator } from '@livekit/components-react';
import { Avatar as AvatarBase } from '@/components/ui/Avatar';
import { IconeMicCortado } from '@/components/ui/icones';
import estilos from './FaixaAvatares.module.css';

function ItemFaixa({ participant }: { participant: Participant }) {
  const falando = useIsSpeaking(participant);
  const { isMuted } = useTrackMutedIndicator({ participant, source: Track.Source.Microphone });

  const classes = [estilos.avatar, falando && !isMuted && estilos.falando].filter(Boolean).join(' ');

  const base = participant.identity
    ? `/api/participantes/${participant.identity}/avatar?t=${participant.joinedAt?.getTime() ?? 0}`
    : undefined;

  return (
    <div className={estilos.item}>
      <div className={classes} style={{ width: 24, height: 24 }}>
        <AvatarBase
          nome={participant.name || '?'}
          src={base ? `${base}&variante=estatico` : undefined}
          srcAnimado={base ? `${base}&variante=animado` : undefined}
          tamanho={24}
          animar={falando && !isMuted}
        />
        {isMuted && (
          <span className={estilos.iconeMutado} aria-hidden="true">
            <IconeMicCortado />
          </span>
        )}
      </div>
      <span className={estilos.nome}>{participant.name}</span>
    </div>
  );
}

export function FaixaAvatares() {
  const participantes = useParticipants();

  return (
    <div className={estilos.faixa}>
      {participantes.map((participante) => (
        <ItemFaixa key={participante.identity} participant={participante} />
      ))}
    </div>
  );
}
