'use client';

import { useState, useRef, type FormEvent, type KeyboardEvent } from 'react';
import { IconeEnviar } from '@/components/ui/icones';
import estilos from './ComposerChat.module.css';

type Props = {
  onEnviar: (texto: string) => Promise<void>;
  desabilitado?: boolean;
};

export function ComposerChat({ onEnviar, desabilitado = false }: Props) {
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  async function submeter(evento?: FormEvent) {
    if (evento) evento.preventDefault();

    const conteudo = texto.trim();
    if (!conteudo || enviando || desabilitado) return;

    setEnviando(true);
    try {
      await onEnviar(conteudo);
      setTexto('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } finally {
      setEnviando(false);
    }
  }

  function lidarComTeclado(evento: KeyboardEvent<HTMLTextAreaElement>) {
    if (evento.key === 'Enter' && !evento.shiftKey) {
      evento.preventDefault();
      submeter();
    }
  }

  function redimensionarTextarea() {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${Math.min(el.scrollHeight, 100)}px`;
    }
  }

  return (
    <form className={estilos.container} onSubmit={submeter}>
      <textarea
        ref={textareaRef}
        rows={1}
        className={estilos.entrada}
        value={texto}
        placeholder="Conversar no chat..."
        disabled={desabilitado || enviando}
        onChange={(evento) => {
          setTexto(evento.target.value);
          redimensionarTextarea();
        }}
        onKeyDown={lidarComTeclado}
      />
      <button
        type="submit"
        className={estilos.botaoEnviar}
        disabled={!texto.trim() || enviando || desabilitado}
        aria-label="Enviar mensagem"
        title="Enviar mensagem"
      >
        <IconeEnviar />
      </button>
    </form>
  );
}
