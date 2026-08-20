'use client';

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import estilos from './Toast.module.css';

const DURACAO_MS = 3000;

const ToastContext = createContext<((mensagem: string) => void) | null>(null);

export function useToast() {
  const mostrar = useContext(ToastContext);
  if (!mostrar) throw new Error('useToast precisa estar dentro de ToastProvider.');
  return mostrar;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [mensagem, setMensagem] = useState<string | null>(null);
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);

  const mostrar = useCallback((texto: string) => {
    if (temporizador.current) clearTimeout(temporizador.current);
    setMensagem(texto);
    temporizador.current = setTimeout(() => setMensagem(null), DURACAO_MS);
  }, []);

  return (
    <ToastContext.Provider value={mostrar}>
      {children}
      {mensagem && (
        <div className={estilos.toast} role="status">
          {mensagem}
        </div>
      )}
    </ToastContext.Provider>
  );
}
