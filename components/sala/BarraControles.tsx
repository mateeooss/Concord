'use client';

import { Track } from 'livekit-client';
import { useTrackToggle } from '@livekit/components-react';
import { OPCOES_AUDIO } from '@/lib/constantes';
import { IconeMic, IconeMicCortado } from '@/components/ui/icones';
import estilos from './BarraControles.module.css';

export function BarraControles() {
  const { toggle, enabled, pending } = useTrackToggle({
    source: Track.Source.Microphone,
    captureOptions: OPCOES_AUDIO,
  });

  const classes = [estilos.botaoMic, !enabled && estilos.mutado].filter(Boolean).join(' ');

  return (
    <div className={estilos.barra}>
      <button
        type="button"
        className={classes}
        onClick={() => toggle()}
        disabled={pending}
        aria-label={enabled ? 'Mutar microfone' : 'Ativar microfone'}
      >
        {enabled ? <IconeMic /> : <IconeMicCortado />}
      </button>
    </div>
  );
}
