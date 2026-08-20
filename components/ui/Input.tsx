import type { InputHTMLAttributes } from 'react';

type Props = InputHTMLAttributes<HTMLInputElement> & {
  erro?: boolean;
};

export function Input({ erro, className, ...props }: Props) {
  const classes = ['input', erro && 'input-erro', className].filter(Boolean).join(' ');
  return <input className={classes} {...props} />;
}
