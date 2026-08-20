import estilos from './Avatar.module.css';

type Props = {
  nome: string;
  src?: string;
  tamanho: number;
};

export function Avatar({ nome, src, tamanho }: Props) {
  return (
    <div
      className={estilos.avatar}
      style={{ width: tamanho, height: tamanho, fontSize: tamanho * 0.4 }}
    >
      {src ? (
        <img className={estilos.imagem} src={src} alt="" />
      ) : (
        nome.charAt(0).toUpperCase()
      )}
    </div>
  );
}
