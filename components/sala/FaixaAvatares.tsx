'use client';

import { Track, type Participant } from 'livekit-client';
import { useParticipants, useIsSpeaking, useTrackMutedIndicator } from '@livekit/components-react';
import { Avatar as AvatarBase } from '@/components/ui/Avatar';
import { IconeMicCortado, IconeRemover } from '@/components/ui/icones';
import { useToast } from '@/components/ui/Toast';
import estilos from './FaixaAvatares.module.css';

function ItemFaixa({ participant, ehHost }: { participant: Participant; ehHost: boolean }) {
  const mostrarToast = useToast();
  const falando = useIsSpeaking(participant);
  const { isMuted } = useTrackMutedIndicator({ participant, source: Track.Source.Microphone });

  const classes = [estilos.avatar, falando && !isMuted && estilos.falando].filter(Boolean).join(' ');

  const base = participant.identity
    ? `/api/participantes/${participant.identity}/avatar?t=${participant.joinedAt?.getTime() ?? 0}`
    : undefined;

  async function mutar() {
    try {
      const resposta = await fetch('/api/moderacao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ acao: 'mutar', participanteId: participant.identity }),
      });
      if (resposta.ok) {
        mostrarToast(`Microfone de ${participant.name || 'participante'} foi mutado.`);
      } else {
        mostrarToast('Não foi possível mutar o participante.');
      }
    } catch {
      mostrarToast('Falha na comunicação com o servidor.');
    }
  }

  async function remover() {
    try {
      const resposta = await fetch('/api/moderacao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ acao: 'remover', participanteId: participant.identity }),
      });
      if (resposta.ok) {
        mostrarToast(`${participant.name || 'Participante'} foi removido da sala.`);
      } else {
        mostrarToast('Não foi possível remover o participante.');
      }
    } catch {
      mostrarToast('Falha na comunicação com o servidor.');
    }
  }

  const podeModerar = ehHost && !participant.isLocal;

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
        {podeModerar && (
          <div className={estilos.acoesModeracao}>
            <button
              type="button"
              className={estilos.botaoModeracao}
              onClick={(e) => {
                e.stopPropagation();
                mutar();
              }}
              aria-label={`Mutar ${participant.name}`}
              title={`Mutar ${participant.name}`}
            >
              <IconeMicCortado />
            </button>
            <button
              type="button"
              className={`${estilos.botaoModeracao} ${estilos.botaoExpulsar}`}
              onClick={(e) => {
                e.stopPropagation();
                remover();
              }}
              aria-label={`Remover ${participant.name}`}
              title={`Remover ${participant.name}`}
            >
              <IconeRemover />
            </button>
          </div>
        )}
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

export function FaixaAvatares({ ehHost = false }: { ehHost?: boolean }) {
  const participantes = useParticipants();

  return (
    <div className={estilos.faixa}>
      {participantes.map((participante) => (
        <ItemFaixa key={participante.identity} participant={participante} ehHost={ehHost} />
      ))}
    </div>
  );
}
