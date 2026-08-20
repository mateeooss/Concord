'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { obterDeviceId } from '@/lib/dispositivo';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const deviceId = obterDeviceId();
    fetch(`/api/sessao?deviceId=${deviceId}`)
      .then((resposta) => router.replace(resposta.ok ? '/sala' : '/perfil'))
      .catch(() => router.replace('/perfil'));
  }, [router]);

  return null;
}
