const CHAVE_DEVICE_ID = 'concord:device-id';

export function obterDeviceId(): string {
  const salvo = localStorage.getItem(CHAVE_DEVICE_ID);
  if (salvo) return salvo;

  const novo = crypto.randomUUID();
  localStorage.setItem(CHAVE_DEVICE_ID, novo);
  return novo;
}
