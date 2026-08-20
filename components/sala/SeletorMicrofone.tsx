'use client';

import { useEffect, useRef, useState } from 'react';
import { Track } from 'livekit-client';
import { useMediaDeviceSelect, useTrackToggle } from '@livekit/components-react';
import { OPCOES_AUDIO } from '@/lib/constantes';
import {
  IconeMic,
  IconeMicCortado,
  IconeChevronCima,
  IconeChevronBaixo,
  IconeCheck,
} from '@/components/ui/icones';
import estilos from './SeletorMicrofone.module.css';

const CHAVE_STORAGE_MIC = 'concord:mic';

export function SeletorMicrofone() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [menuAberto, setMenuAberto] = useState(false);

  const {
    toggle: alternarMic,
    enabled: micAtivo,
    pending: micPendente,
  } = useTrackToggle({
    source: Track.Source.Microphone,
    captureOptions: OPCOES_AUDIO,
  });

  const { devices, activeDeviceId, setActiveMediaDevice } = useMediaDeviceSelect({
    kind: 'audioinput',
    requestPermissions: true,
  });

  useEffect(() => {
    const micSalvo = localStorage.getItem(CHAVE_STORAGE_MIC);
    if (micSalvo && devices.some((d) => d.deviceId === micSalvo)) {
      if (activeDeviceId !== micSalvo) {
        setActiveMediaDevice(micSalvo).catch(() => {});
      }
    }
  }, [devices, activeDeviceId, setActiveMediaDevice]);

  useEffect(() => {
    if (!menuAberto) return;

    const aoClicarFora = (evento: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(evento.target as Node)) {
        setMenuAberto(false);
      }
    };

    const aoPressionarTecla = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') {
        setMenuAberto(false);
      }
    };

    document.addEventListener('mousedown', aoClicarFora);
    document.addEventListener('keydown', aoPressionarTecla);
    return () => {
      document.removeEventListener('mousedown', aoClicarFora);
      document.removeEventListener('keydown', aoPressionarTecla);
    };
  }, [menuAberto]);

  const selecionarDispositivo = async (deviceId: string) => {
    try {
      await setActiveMediaDevice(deviceId);
      localStorage.setItem(CHAVE_STORAGE_MIC, deviceId);
    } catch {
      // Mantém integridade do estado em falhas
    } finally {
      setMenuAberto(false);
    }
  };

  const classesGrupo = [
    estilos.grupo,
    micAtivo ? estilos.micAtivo : estilos.micMutado,
  ].join(' ');

  return (
    <div ref={containerRef} className={classesGrupo}>
      <button
        type="button"
        className={estilos.botaoCorpo}
        onClick={() => alternarMic()}
        disabled={micPendente}
        aria-label={micAtivo ? 'Mutar microfone' : 'Ativar microfone'}
        title={micAtivo ? 'Mutar microfone' : 'Ativar microfone'}
      >
        {micAtivo ? <IconeMic /> : <IconeMicCortado />}
      </button>

      <button
        type="button"
        className={estilos.botaoSeta}
        onClick={() => setMenuAberto((anterior) => !anterior)}
        aria-haspopup="listbox"
        aria-expanded={menuAberto}
        aria-label="Selecionar microfone"
        title="Selecionar microfone"
      >
        {menuAberto ? <IconeChevronCima /> : <IconeChevronBaixo />}
      </button>

      {menuAberto && (
        <div className={estilos.dropdown} role="listbox" aria-label="Microfones disponíveis">
          <div className={estilos.tituloMenu}>Microfone</div>
          {devices.length === 0 ? (
            <div className={estilos.vazio}>Nenhum microfone detectado</div>
          ) : (
            devices.map((dispositivo, index) => {
              const ativo = dispositivo.deviceId === activeDeviceId;
              const rotulo = dispositivo.label || `Microfone ${index + 1}`;
              const classesItem = [
                estilos.item,
                ativo && estilos.itemAtivo,
              ].filter(Boolean).join(' ');

              return (
                <button
                  key={dispositivo.deviceId || index}
                  type="button"
                  role="option"
                  aria-selected={ativo}
                  className={classesItem}
                  onClick={() => selecionarDispositivo(dispositivo.deviceId)}
                >
                  <span className={estilos.rotuloItem}>{rotulo}</span>
                  {ativo && <IconeCheck className={estilos.iconeCheck} />}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
