'use client';

import { useEffect, useRef, useState } from 'react';
import type { TrackReference } from '@livekit/components-react';
import { IconeMaximizar, IconeMinimizar } from '@/components/ui/icones';
import estilos from './TelaCompartilhada.module.css';

type Props = {
  trackRef: TrackReference;
};

export function TelaCompartilhada({ trackRef }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [telaCheia, setTelaCheia] = useState(false);

  const track = trackRef.publication?.track;
  const nome = trackRef.participant.name || 'Participante';

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !track) return;

    track.attach(el);
    return () => {
      track.detach(el);
    };
  }, [track]);

  useEffect(() => {
    const aoMudarFullscreen = () => {
      setTelaCheia(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', aoMudarFullscreen);
    return () => {
      document.removeEventListener('fullscreenchange', aoMudarFullscreen);
    };
  }, []);

  const alternarTelaCheia = async () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      await container.requestFullscreen().catch(() => {});
    } else {
      await document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div
      ref={containerRef}
      className={estilos.container}
      onDoubleClick={alternarTelaCheia}
    >
      <video ref={videoRef} className={estilos.video} playsInline autoPlay muted />
      <div className={estilos.pilula}>{nome}</div>
      <button
        type="button"
        className={estilos.botaoTelaCheia}
        onClick={alternarTelaCheia}
        title={telaCheia ? 'Sair da tela cheia' : 'Tela cheia'}
        aria-label={telaCheia ? 'Sair da tela cheia' : 'Tela cheia'}
      >
        {telaCheia ? (
          <IconeMinimizar width={18} height={18} />
        ) : (
          <IconeMaximizar width={18} height={18} />
        )}
      </button>
    </div>
  );
}
