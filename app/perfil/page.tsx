'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Botao } from '@/components/ui/Botao';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { SeletorFoto } from '@/components/perfil/SeletorFoto';
import { obterDeviceId } from '@/lib/dispositivo';
import estilos from './page.module.css';

export default function PaginaPerfil() {
  const router = useRouter();
  const mostrarToast = useToast();

  const [nome, setNome] = useState('');
  const [avatar, setAvatar] = useState<Blob | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar(evento: FormEvent) {
    evento.preventDefault();

    if (!nome.trim()) {
      setErro('Nome obrigatório.');
      return;
    }
    if (!avatar) {
      setErro('Escolha uma foto.');
      return;
    }

    setErro(null);
    setEnviando(true);

    const dados = new FormData();
    dados.set('deviceId', obterDeviceId());
    dados.set('nome', nome.trim());
    const nomeArquivo = avatar.type === 'image/gif' ? 'avatar.gif' : 'avatar.webp';
    dados.set('avatar', avatar, nomeArquivo);

    try {
      const resposta = await fetch('/api/participantes', { method: 'POST', body: dados });
      if (!resposta.ok) {
        const corpo = await resposta.json().catch(() => null);
        const msgErro = corpo?.erro ?? 'Não foi possível salvar o perfil. Tente de novo.';
        setErro(msgErro);
        mostrarToast(msgErro);
        return;
      }
      router.replace('/sala');
    } catch {
      mostrarToast('Não foi possível conectar. Tente de novo.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className={estilos.pagina}>
      <form className={`card ${estilos.cartao}`} onSubmit={enviar}>
        <h1 className={estilos.titulo}>Seu perfil</h1>

        <SeletorFoto
          nome={nome}
          onSelecionar={(blob) => {
            setAvatar(blob);
            setErro(null);
          }}
          onErro={(msg) => setErro(msg || null)}
        />

        <div className={estilos.campo}>
          <label className={estilos.rotulo} htmlFor="nome">
            Nome
          </label>
          <Input
            id="nome"
            value={nome}
            onChange={(evento) => setNome(evento.target.value)}
            placeholder="Como te chamam"
          />
        </div>

        {erro && <p className="caixa-erro">{erro}</p>}

        <Botao type="submit" disabled={enviando}>
          {enviando ? 'Entrando...' : 'Entrar na sala'}
        </Botao>
      </form>
    </div>
  );
}
