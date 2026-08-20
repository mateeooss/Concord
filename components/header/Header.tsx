'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useToast } from '@/components/ui/Toast';
import {
  IconeCopiar,
  IconeCheck,
  IconeSol,
  IconeLua,
  IconeOlho,
  IconeOlhoFechado,
} from '@/components/ui/icones';
import type { RespostaNgrok } from '@/lib/ngrok';
import estilos from './Header.module.css';

const INTERVALO_POLLING_MS = 3000;

export function Header() {
  const mostrarToast = useToast();
  const [statusNgrok, setStatusNgrok] = useState<RespostaNgrok>({ estado: 'ausente' });
  const [copiado, setCopiado] = useState(false);
  const [oculto, setOculto] = useState(false);
  const [tema, setTema] = useState<'claro' | 'escuro'>('escuro');

  useEffect(() => {
    const temaAtual = document.documentElement.dataset.tema as 'claro' | 'escuro';
    if (temaAtual) {
      setTema(temaAtual);
    }
  }, []);

  const buscarNgrok = useCallback(async () => {
    try {
      const resposta = await fetch('/api/ngrok');
      if (resposta.ok) {
        const dados: RespostaNgrok = await resposta.json();
        setStatusNgrok(dados);
      }
    } catch {
      setStatusNgrok({ estado: 'ausente' });
    }
  }, []);

  useEffect(() => {
    buscarNgrok();
    const temporizador = setInterval(buscarNgrok, INTERVALO_POLLING_MS);
    return () => clearInterval(temporizador);
  }, [buscarNgrok]);

  async function copiarLink(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      mostrarToast('Link copiado!');
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      mostrarToast('Não foi possível copiar o link.');
    }
  }

  function alternarTema() {
    const proximoTema = tema === 'claro' ? 'escuro' : 'claro';
    document.documentElement.dataset.tema = proximoTema;
    try {
      localStorage.setItem('concord:tema', proximoTema);
    } catch {}
    setTema(proximoTema);
  }

  const ehHost = statusNgrok.ehHost ?? true;

  return (
    <header className={estilos.header}>
      <Link href="/sala" className={estilos.logo} aria-label="Concord Home">
        CONCORD
      </Link>

      <div className={estilos.blocoNgrok}>
        {ehHost &&
          (statusNgrok.estado === 'ativo' ? (
            oculto ? (
              <div className={estilos.ngrokOculto}>
                <span className={estilos.textoOculto}>Link oculto</span>
                <button
                  type="button"
                  className={estilos.botaoCopiar}
                  onClick={() => setOculto(false)}
                  aria-label="Exibir link do ngrok"
                  title="Exibir link"
                >
                  <IconeOlhoFechado />
                </button>
              </div>
            ) : (
              <div className={estilos.ngrokAtivo}>
                <a
                  href={statusNgrok.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={estilos.linkNgrok}
                  title={statusNgrok.url}
                >
                  {statusNgrok.url}
                </a>
                <button
                  type="button"
                  className={estilos.botaoCopiar}
                  onClick={() => copiarLink(statusNgrok.url)}
                  aria-label="Copiar link do ngrok"
                  title="Copiar link"
                >
                  {copiado ? <IconeCheck /> : <IconeCopiar />}
                </button>
                <span className={estilos.divisor} />
                <button
                  type="button"
                  className={estilos.botaoCopiar}
                  onClick={() => setOculto(true)}
                  aria-label="Ocultar link do ngrok para esta sessão"
                  title="Ocultar link"
                >
                  <IconeOlho />
                </button>
              </div>
            )
          ) : (
            <div className={estilos.ngrokAusente}>
              <span>ngrok não detectado — rode</span>
              <code className={estilos.comando}>ngrok http 3000</code>
              <span>para gerar o link.</span>
            </div>
          ))}
      </div>

      <div className={estilos.acoes}>
        <button
          type="button"
          className={estilos.botaoTema}
          onClick={alternarTema}
          aria-label={tema === 'claro' ? 'Alternar para tema escuro' : 'Alternar para tema claro'}
          title={tema === 'claro' ? 'Tema escuro' : 'Tema claro'}
        >
          {tema === 'claro' ? <IconeLua /> : <IconeSol />}
        </button>
      </div>
    </header>
  );
}

