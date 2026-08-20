'use client';

import { useRef, useState, type KeyboardEvent } from 'react';
import { validarImagem, processarAvatar, type AvatarProcessado } from '@/lib/imagem';
import { Avatar } from '@/components/ui/Avatar';
import estilos from './SeletorFoto.module.css';

type Props = {
  nome: string;
  onSelecionar: (dados: AvatarProcessado) => void;
  onErro: (mensagem: string) => void;
};

export function SeletorFoto({ nome, onSelecionar, onErro }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  async function lidarComArquivo(arquivo: File | undefined) {
    if (!arquivo) return;

    const erro = validarImagem(arquivo);
    if (erro) {
      onErro(erro);
      return;
    }

    try {
      const processado = await processarAvatar(arquivo);
      onErro('');
      setPreview((anterior) => {
        if (anterior) URL.revokeObjectURL(anterior);
        return URL.createObjectURL(processado.avatar);
      });
      onSelecionar(processado);
    } catch {
      onErro('Não foi possível processar essa imagem. Tente outra.');
    }
  }

  function abrirSeletor() {
    inputRef.current?.click();
  }

  function lidarComTeclado(evento: KeyboardEvent<HTMLDivElement>) {
    if (evento.key === 'Enter' || evento.key === ' ') {
      evento.preventDefault();
      abrirSeletor();
    }
  }

  return (
    <div
      className={estilos.zona}
      role="button"
      tabIndex={0}
      onClick={abrirSeletor}
      onKeyDown={lidarComTeclado}
    >
      <Avatar nome={nome || '?'} src={preview ?? undefined} tamanho={64} animar={true} />
      <span className={estilos.texto}>{preview ? 'Trocar foto' : 'Escolher foto'}</span>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        className={estilos.entrada}
        onChange={(evento) => lidarComArquivo(evento.target.files?.[0])}
      />
    </div>
  );
}
