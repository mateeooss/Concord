import {
  AVATAR_DIMENSAO,
  AVATAR_QUALIDADE_WEBP,
  AVATAR_TAMANHO_MAX_CLIENTE,
} from './constantes';

const TIPOS_ACEITOS = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];

export function validarImagem(arquivo: File): string | null {
  if (!TIPOS_ACEITOS.includes(arquivo.type)) {
    return 'Formato não suportado. Escolha uma imagem PNG, JPEG, WebP ou GIF.';
  }
  if (arquivo.size > AVATAR_TAMANHO_MAX_CLIENTE) {
    return 'Imagem acima de 15 MB. Escolha um arquivo menor.';
  }
  return null;
}

export type AvatarProcessado = {
  avatar: Blob;
  avatarEstatico: Blob | null;
};

export async function processarAvatar(arquivo: File): Promise<AvatarProcessado> {
  const estatico = await recortarQuadradoWebp(arquivo);

  if (arquivo.type === 'image/gif') {
    return { avatar: arquivo, avatarEstatico: estatico };
  }

  return { avatar: estatico, avatarEstatico: null };
}

async function recortarQuadradoWebp(arquivo: File): Promise<Blob> {
  const bitmap = await createImageBitmap(arquivo);
  const lado = Math.min(bitmap.width, bitmap.height);
  const origemX = (bitmap.width - lado) / 2;
  const origemY = (bitmap.height - lado) / 2;

  const canvas = document.createElement('canvas');
  canvas.width = AVATAR_DIMENSAO;
  canvas.height = AVATAR_DIMENSAO;
  const contexto = canvas.getContext('2d')!;
  contexto.drawImage(bitmap, origemX, origemY, lado, lado, 0, 0, AVATAR_DIMENSAO, AVATAR_DIMENSAO);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Falha ao processar a imagem.'))),
      'image/webp',
      AVATAR_QUALIDADE_WEBP,
    );
  });
}

