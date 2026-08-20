export function ehHost(request: Request): boolean {
  return !request.headers.get('x-forwarded-for');
}
