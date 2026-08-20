'use client';

import { Avatar as AvatarBase } from '@/components/ui/Avatar';
import type { MensagemComAutor } from '@/lib/db/queries';
import estilos from './ItemMensagem.module.css';

type Props = {
  mensagem: MensagemComAutor;
  agrupada: boolean;
};

function formatarHora(dataEntrada: Date | string): string {
  const data = typeof dataEntrada === 'string' ? new Date(dataEntrada) : dataEntrada;
  return data.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function ItemMensagem({ mensagem, agrupada }: Props) {
  const horaTexto = formatarHora(mensagem.criadaEm);
  const avatarUrl = `/api/participantes/${mensagem.participanteId}/avatar?variante=estatico`;

  if (agrupada) {
    return (
      <div className={estilos.blocoAgrupado}>
        <span className={estilos.horaFlutuante}>{horaTexto}</span>
        <div className={estilos.conteudo}>
          <p className={estilos.texto}>{mensagem.corpo}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={estilos.bloco}>
      <div className={estilos.avatarContainer}>
        <AvatarBase
          nome={mensagem.autorNome}
          src={avatarUrl}
          tamanho={28}
        />
      </div>
      <div className={estilos.conteudo}>
        <div className={estilos.cabecalho}>
          <span className={estilos.autor}>{mensagem.autorNome}</span>
          <span className={estilos.hora}>{horaTexto}</span>
        </div>
        <p className={estilos.texto}>{mensagem.corpo}</p>
      </div>
    </div>
  );
}
