'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sala } from '@/components/sala/Sala';
import { obterDeviceId } from '@/lib/dispositivo';

type SessaoLiveKit = { token: string; url: string; ehHost: boolean };

export default function PaginaSala() {
  const router = useRouter();
  const [sessao, setSessao] = useState<SessaoLiveKit | null>(null);

  useEffect(() => {
    let cancelado = false;
    const deviceId = obterDeviceId();

    async function carregar() {
      const respostaSessao = await fetch(`/api/sessao?deviceId=${deviceId}`);
      if (!respostaSessao.ok) {
        if (!cancelado) router.replace('/perfil');
        return;
      }

      const dadosSessao = await respostaSessao.json();
      const ehHost = Boolean(dadosSessao.ehHost);

      const respostaToken = await fetch('/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId }),
      });
      if (!respostaToken.ok) {
        if (!cancelado) router.replace('/perfil');
        return;
      }

      const { token, url } = await respostaToken.json();
      if (!cancelado) {
        setSessao({ token, url, ehHost });
      }
    }

    carregar().catch(() => {
      if (!cancelado) router.replace('/perfil');
    });

    return () => {
      cancelado = true;
    };
  }, [router]);

  if (!sessao) return null;

  return <Sala token={sessao.token} url={sessao.url} ehHost={sessao.ehHost} />;
}
