'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Avatar } from '@/components/ui/Avatar';
import { obterDeviceId } from '@/lib/dispositivo';
import estilos from './page.module.css';

export default function PaginaSala() {
  const router = useRouter();
  const [participante, setParticipante] = useState<{ id: string; nome: string } | null>(null);

  useEffect(() => {
    const deviceId = obterDeviceId();
    fetch(`/api/sessao?deviceId=${deviceId}`)
      .then((resposta) => (resposta.ok ? resposta.json() : null))
      .then((dados) => {
        if (dados) {
          setParticipante(dados);
        } else {
          router.replace('/perfil');
        }
      })
      .catch(() => router.replace('/perfil'));
  }, [router]);

  if (!participante) return null;

  return (
    <div className={estilos.pagina}>
      <Avatar
        nome={participante.nome}
        src={`/api/participantes/${participante.id}/avatar`}
        tamanho={96}
      />
      <p className={estilos.nome}>{participante.nome}</p>
      <Link className={estilos.trocar} href="/perfil">
        Trocar perfil
      </Link>
    </div>
  );
}
