'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Track,
  RoomEvent,
  DisconnectReason,
  type RoomOptions,
  type RoomConnectOptions,
} from 'livekit-client';
import { LiveKitRoom, RoomAudioRenderer, useTracks, useRoomContext } from '@livekit/components-react';
import { OPCOES_AUDIO, SALA_PADRAO } from '@/lib/constantes';
import { obterDeviceId } from '@/lib/dispositivo';
import type { MensagemComAutor } from '@/lib/db/queries';
import { useToast } from '@/components/ui/Toast';
import { PainelChat } from '@/components/chat/PainelChat';
import { Grid } from './Grid';
import { FaixaAvatares } from './FaixaAvatares';
import { TelaCompartilhada } from './TelaCompartilhada';
import { BarraControles } from './BarraControles';
import estilos from './Sala.module.css';

type Props = {
  token: string;
  url: string;
  ehHost?: boolean;
};

const OPCOES_SALA: RoomOptions = {
  singlePeerConnection: false,
  audioCaptureDefaults: OPCOES_AUDIO,
  stopLocalTrackOnUnpublish: true,
  dynacast: true,
};

const OPCOES_CONEXAO: RoomConnectOptions = {
  autoSubscribe: true,
  peerConnectionTimeout: 30_000,
};

function AreaPrincipal({ ehHost }: { ehHost: boolean }) {
  const faixasTela = useTracks([Track.Source.ScreenShare]);
  const faixaTelaAtiva = faixasTela[0];

  if (faixaTelaAtiva) {
    return (
      <div className={estilos.apresentacao}>
        <FaixaAvatares ehHost={ehHost} />
        <TelaCompartilhada trackRef={faixaTelaAtiva} />
      </div>
    );
  }

  return <Grid ehHost={ehHost} />;
}

function ConteudoSala({ ehHost }: { ehHost: boolean }) {
  const room = useRoomContext();
  const router = useRouter();
  const mostrarToast = useToast();
  const [chatAberto, setChatAberto] = useState(false);
  const [naoLidas, setNaoLidas] = useState(0);
  const [mensagens, setMensagens] = useState<MensagemComAutor[]>([]);
  const [carregandoMensagens, setCarregandoMensagens] = useState(true);

  const chatAbertoRef = useRef(chatAberto);
  chatAbertoRef.current = chatAberto;

  useEffect(() => {
    const lidarComDesconexao = (reason?: DisconnectReason) => {
      if (reason === DisconnectReason.PARTICIPANT_REMOVED) {
        mostrarToast('Você foi removido da sala pelo moderador.');
        router.replace('/perfil');
      }
    };

    room.on(RoomEvent.Disconnected, lidarComDesconexao);
    return () => {
      room.off(RoomEvent.Disconnected, lidarComDesconexao);
    };
  }, [room, router, mostrarToast]);

  useEffect(() => {
    let cancelado = false;

    async function carregarHistorico() {
      try {
        const resposta = await fetch(`/api/mensagens?salaId=${SALA_PADRAO}`);
        if (resposta.ok) {
          const dados: MensagemComAutor[] = await resposta.json();
          if (!cancelado) setMensagens(dados);
        }
      } finally {
        if (!cancelado) setCarregandoMensagens(false);
      }
    }

    carregarHistorico();
    return () => {
      cancelado = true;
    };
  }, []);

  useEffect(() => {
    const lidarComDados = (payload: Uint8Array) => {
      try {
        const decoder = new TextDecoder();
        const texto = decoder.decode(payload);
        const evento = JSON.parse(texto);

        if (evento.tipo === 'nova_mensagem' && evento.mensagem) {
          setMensagens((anteriores) => {
            if (anteriores.some((m) => m.id === evento.mensagem.id)) return anteriores;
            return [...anteriores, evento.mensagem];
          });

          if (!chatAbertoRef.current) {
            setNaoLidas((n) => n + 1);
          }
        }
      } catch {
        // Ignora dados com formato inesperado
      }
    };

    room.on(RoomEvent.DataReceived, lidarComDados);
    return () => {
      room.off(RoomEvent.DataReceived, lidarComDados);
    };
  }, [room]);

  const enviarMensagem = useCallback(
    async (corpo: string) => {
      const deviceId = obterDeviceId();
      const resposta = await fetch('/api/mensagens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ salaId: SALA_PADRAO, deviceId, corpo }),
      });

      if (!resposta.ok) return;

      const mensagemCriada: MensagemComAutor = await resposta.json();
      setMensagens((anteriores) => [...anteriores, mensagemCriada]);

      try {
        const encoder = new TextEncoder();
        const payload = encoder.encode(
          JSON.stringify({ tipo: 'nova_mensagem', mensagem: mensagemCriada }),
        );
        await room.localParticipant.publishData(payload, { reliable: true });
      } catch {
        // Falha na sinalização não impede a persistência no banco
      }
    },
    [room],
  );

  return (
    <div className={estilos.corpo}>
      <div className={estilos.areaCentral}>
        <AreaPrincipal ehHost={ehHost} />
        <BarraControles
          chatAberto={chatAberto}
          onAlternarChat={() => {
            setChatAberto((aberto) => {
              if (!aberto) setNaoLidas(0);
              return !aberto;
            });
          }}
          naoLidas={naoLidas}
        />
        <Link className={estilos.trocar} href="/perfil">
          Trocar perfil
        </Link>
      </div>

      {chatAberto && (
        <PainelChat
          mensagens={mensagens}
          onEnviar={enviarMensagem}
          onFechar={() => setChatAberto(false)}
          carregando={carregandoMensagens}
        />
      )}
    </div>
  );
}

export function Sala({ token, url, ehHost = false }: Props) {
  return (
    <LiveKitRoom
      serverUrl={url}
      token={token}
      connect
      audio={OPCOES_AUDIO}
      options={OPCOES_SALA}
      connectOptions={OPCOES_CONEXAO}
      className={estilos.shell}
    >
      <RoomAudioRenderer />
      <ConteudoSala ehHost={ehHost} />
    </LiveKitRoom>
  );
}
