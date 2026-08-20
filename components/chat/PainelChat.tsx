'use client';

import { useEffect, useRef } from 'react';
import type { MensagemComAutor } from '@/lib/db/queries';
import { IconeFechar } from '@/components/ui/icones';
import { ItemMensagem } from './ItemMensagem';
import { ComposerChat } from './ComposerChat';
import estilos from './PainelChat.module.css';

type Props = {
  mensagens: MensagemComAutor[];
  onEnviar: (texto: string) => Promise<void>;
  onFechar: () => void;
  carregando?: boolean;
};

export function PainelChat({ mensagens, onEnviar, onFechar, carregando = false }: Props) {
  const fimScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fimScrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens.length]);

  return (
    <aside className={estilos.painel} aria-label="Painel de chat">
      <header className={estilos.cabecalho}>
        <h2 className={estilos.titulo}>Chat</h2>
        <button
          type="button"
          className={estilos.botaoFechar}
          onClick={onFechar}
          aria-label="Fechar chat"
          title="Fechar chat"
        >
          <IconeFechar />
        </button>
      </header>

      <div className={estilos.lista}>
        {mensagens.length === 0 ? (
          <div className={estilos.vazio}>
            {carregando
              ? 'Carregando mensagens...'
              : 'Nenhuma mensagem por aqui ainda. Diga um oi para a galera!'}
          </div>
        ) : (
          mensagens.map((msg, index) => {
            const anterior = index > 0 ? mensagens[index - 1] : null;
            const mesmoAutor = anterior && anterior.participanteId === msg.participanteId;
            const diferencaMinutos = anterior
              ? (new Date(msg.criadaEm).getTime() - new Date(anterior.criadaEm).getTime()) /
                (1000 * 60)
              : 999;
            const agrupada = Boolean(mesmoAutor && diferencaMinutos <= 5);

            return (
              <ItemMensagem
                key={msg.id}
                mensagem={msg}
                agrupada={agrupada}
              />
            );
          })
        )}
        <div ref={fimScrollRef} />
      </div>

      <ComposerChat onEnviar={onEnviar} desabilitado={carregando} />
    </aside>
  );
}
