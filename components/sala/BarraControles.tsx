'use client';

import { Track } from 'livekit-client';
import { useTrackToggle, useTracks } from '@livekit/components-react';
import {
  OPCOES_AUDIO,
  COMPARTILHAMENTO_SCREEN_CAPTURE,
  COMPARTILHAMENTO_PUBLISH_OPTIONS,
} from '@/lib/constantes';
import { IconeMic, IconeMicCortado, IconeTela } from '@/components/ui/icones';
import estilos from './BarraControles.module.css';

export function BarraControles() {
  const {
    toggle: alternarMic,
    enabled: micAtivo,
    pending: micPendente,
  } = useTrackToggle({
    source: Track.Source.Microphone,
    captureOptions: OPCOES_AUDIO,
  });

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

  const classesMic = [
    estilos.botaoControle,
    micAtivo ? estilos.botaoMicAtivo : estilos.botaoMicMutado,
  ].join(' ');

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
      <button
        type="button"
        className={classesMic}
        onClick={() => alternarMic()}
        disabled={micPendente}
        aria-label={micAtivo ? 'Mutar microfone' : 'Ativar microfone'}
        title={micAtivo ? 'Mutar microfone' : 'Ativar microfone'}
      >
        {micAtivo ? <IconeMic /> : <IconeMicCortado />}
      </button>

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
