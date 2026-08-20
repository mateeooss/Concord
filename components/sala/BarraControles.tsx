'use client';

import { Track } from 'livekit-client';
import { useTrackToggle, useTracks } from '@livekit/components-react';
import {
  COMPARTILHAMENTO_SCREEN_CAPTURE,
  COMPARTILHAMENTO_PUBLISH_OPTIONS,
} from '@/lib/constantes';
import { IconeTela } from '@/components/ui/icones';
import { SeletorMicrofone } from './SeletorMicrofone';
import estilos from './BarraControles.module.css';

export function BarraControles() {
  const {
    toggle: alternarTela,
    enabled: telaAtiva,
    pending: telaPendente,
  } = useTrackToggle({
    source: Track.Source.ScreenShare,
    captureOptions: COMPARTILHAMENTO_SCREEN_CAPTURE,
    publishOptions: COMPARTILHAMENTO_PUBLISH_OPTIONS,
  });

  const faixasTela = useTracks([Track.Source.ScreenShare]);
  const faixaAtiva = faixasTela[0];
  const outroCompartilhando = Boolean(faixaAtiva && !faixaAtiva.participant.isLocal);
  const nomeApresentador = faixaAtiva?.participant.name || 'Outro participante';

  const classesTela = [
    estilos.botaoControle,
    telaAtiva && estilos.botaoTelaAtivo,
  ].filter(Boolean).join(' ');

  const tituloTela = outroCompartilhando
    ? `${nomeApresentador} está compartilhando a tela.`
    : telaAtiva
    ? 'Parar compartilhamento de tela'
    : 'Compartilhar tela';

  return (
    <div className={estilos.barra}>
      <SeletorMicrofone />

      <button
        type="button"
        className={classesTela}
        onClick={() => alternarTela()}
        disabled={telaPendente || outroCompartilhando}
        aria-label={tituloTela}
        title={tituloTela}
      >
        <IconeTela />
      </button>
    </div>
  );
}
