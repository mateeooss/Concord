'use client';

import { useEffect, useRef, useState } from 'react';
import estilos from './Avatar.module.css';

type Props = {
  nome: string;
  src?: string;
  srcAnimado?: string;
  tamanho: number;
  animar?: boolean;
};

export function Avatar({ nome, src, srcAnimado, tamanho, animar = false }: Props) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [cicloAnimacao, setCicloAnimacao] = useState(0);
  const baixandoRef = useRef(false);

  useEffect(() => {
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [blobUrl]);

  useEffect(() => {
    if (blobUrl) {
      URL.revokeObjectURL(blobUrl);
      setBlobUrl(null);
    }
    baixandoRef.current = false;
  }, [srcAnimado]);

  useEffect(() => {
    if (!animar || !srcAnimado) return;

    setCicloAnimacao((c) => c + 1);

    if (!blobUrl && !baixandoRef.current) {
      baixandoRef.current = true;
      fetch(srcAnimado)
        .then((res) => (res.ok ? res.blob() : null))
        .then((blob) => {
          if (blob) {
            setBlobUrl(URL.createObjectURL(blob));
          }
        })
        .catch(() => {})
        .finally(() => {
          baixandoRef.current = false;
        });
    }
  }, [animar, srcAnimado, blobUrl]);

  const urlParaAnimar = blobUrl || srcAnimado;
  const mostrarAnimado = animar && Boolean(urlParaAnimar);

  return (
    <div
      className={estilos.avatar}
      style={{ width: tamanho, height: tamanho, fontSize: tamanho * 0.4 }}
    >
      {!src ? (
        nome.charAt(0).toUpperCase()
      ) : !srcAnimado ? (
        <img className={estilos.imagem} src={src} alt="" />
      ) : (
        <>
          <img
            className={`${estilos.imagem} ${mostrarAnimado ? estilos.oculto : estilos.visivel}`}
            src={src}
            alt=""
          />
          {mostrarAnimado && (
            <img
              key={cicloAnimacao}
              className={`${estilos.imagem} ${estilos.visivel}`}
              src={urlParaAnimar}
              alt=""
            />
          )}
        </>
      )}
    </div>
  );
}
