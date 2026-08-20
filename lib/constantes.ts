export const SALA_PADRAO = 'geral';

export const AVATAR_TAMANHO_MAX_CLIENTE = 15 * 1024 * 1024; // 15 MB, antes do upload
export const AVATAR_TAMANHO_MAX_SERVIDOR = 15 * 1024 * 1024; // 15 MB, revalidado no servidor (suporta GIFs)
export const AVATAR_DIMENSAO = 256; // px, corte central quadrado
export const AVATAR_QUALIDADE_WEBP = 0.85;



export const COMPARTILHAMENTO_BITRATE_MAX = 10_000_000; // 10 Mbps

export const OPCOES_AUDIO = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
} as const;

export const COMPARTILHAMENTO_SCREEN_CAPTURE = {
  contentHint: 'detail',
  resolution: { width: 2560, height: 1440, frameRate: 30 },
} as const;

export const COMPARTILHAMENTO_PUBLISH_OPTIONS = {
  videoCodec: 'vp9',
  videoEncoding: {
    maxBitrate: COMPARTILHAMENTO_BITRATE_MAX, // 10 Mbps
    maxFramerate: 30,
  },
  simulcast: false,
} as const;


