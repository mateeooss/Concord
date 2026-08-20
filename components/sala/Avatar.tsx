'use client';

import { Track, type Participant } from 'livekit-client';
import { useIsSpeaking, useTrackMutedIndicator } from '@livekit/components-react';
import { Avatar as AvatarBase } from '@/components/ui/Avatar';
import { IconeMicCortado } from '@/components/ui/icones';
import estilos from './Avatar.module.css';

type Props = {
  participant: Participant;
  tamanho: number;
};

export function Avatar({ participant, tamanho }: Props) {
  const falando = useIsSpeaking(participant);
  const { isMuted } = useTrackMutedIndicator({ participant, source: Track.Source.Microphone });

  const classes = [estilos.avatar, falando && !isMuted && estilos.falando].filter(Boolean).join(' ');

  const base = participant.identity
    ? `/api/participantes/${participant.identity}/avatar?t=${participant.joinedAt?.getTime() ?? 0}`
    : undefined;

  return (
    <div className={estilos.item}>
      <div className={classes} style={{ width: tamanho, height: tamanho }}>
        <AvatarBase
          nome={participant.name || '?'}
          src={base ? `${base}&variante=estatico` : undefined}
          srcAnimado={base ? `${base}&variante=animado` : undefined}
          tamanho={tamanho}
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
