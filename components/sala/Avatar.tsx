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

  return (
    <div className={estilos.item}>
      <div className={classes} style={{ width: tamanho, height: tamanho }}>
        <AvatarBase
          nome={participant.name || '?'}
          src={`/api/participantes/${participant.identity}/avatar`}
          tamanho={tamanho}
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
