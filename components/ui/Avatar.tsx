'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import estilos from './Avatar.module.css';

type Props = {
  nome: string;
  src?: string;
  tamanho: number;
  animar?: boolean;
};

export function Avatar({ nome, src, tamanho, animar = false }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [carregada, setCarregada] = useState(false);

  const desenharPrimeiroFrame = useCallback(() => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas || !img.naturalWidth) return;

    canvas.width = tamanho;
    canvas.height = tamanho;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const lado = Math.min(img.naturalWidth, img.naturalHeight);
      const sx = (img.naturalWidth - lado) / 2;
      const sy = (img.naturalHeight - lado) / 2;
      ctx.drawImage(img, sx, sy, lado, lado, 0, 0, tamanho, tamanho);
      setCarregada(true);
    }
  }, [tamanho]);

  useEffect(() => {
    setCarregada(false);
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth > 0) {
      desenharPrimeiroFrame();
    }
  }, [src, desenharPrimeiroFrame]);

  return (
    <div
      className={estilos.avatar}
      style={{ width: tamanho, height: tamanho, fontSize: tamanho * 0.4 }}
    >
      {src ? (
        <>
          <img
            ref={imgRef}
            className={`${estilos.imagem} ${animar || !carregada ? estilos.visivel : estilos.oculto}`}
            src={src}
            alt=""
            onLoad={desenharPrimeiroFrame}
          />
          <canvas
            ref={canvasRef}
            className={`${estilos.canvas} ${!animar && carregada ? estilos.visivel : estilos.oculto}`}
            style={{ width: tamanho, height: tamanho }}
          />
        </>
      ) : (
        nome.charAt(0).toUpperCase()
      )}
    </div>
  );
}
