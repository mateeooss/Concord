import type { ButtonHTMLAttributes } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: 'primario' | 'secundario' | 'fantasma' | 'perigo';
};

export function Botao({ variante = 'primario', className, ...props }: Props) {
  const classes = ['btn', `btn-${variante}`, className].filter(Boolean).join(' ');
  return <button className={classes} {...props} />;
}
