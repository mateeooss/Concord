# ARCHITECTURE — Concord

Decisões técnicas e o porquê de cada uma. Se uma decisão aqui for revertida,
este arquivo muda junto — ele é a fonte única de arquitetura.

---

## 1. Stack

| Camada | Escolha | Motivo |
|---|---|---|
| App | Next.js 15, App Router, TypeScript | Front e rotas de API num projeto só |
| Mídia | LiveKit Server (Go, Apache-2.0), self-hosted | SFU pronto, simulcast, TURN embutido |
| Cliente de mídia | `livekit-client` + hooks de `@livekit/components-react` | Lógica pronta, UI nossa |
| Banco | SQLite via `better-sqlite3` | Local, arquivo único, síncrono, zero config |
| ORM / schema | Drizzle | Schema em TS vira migration **e** tipos |
| Estilo | CSS Modules + tokens | Sem Tailwind, ver `DESIGN-SYSTEM.md` |
| Túnel | ngrok | Processo à parte, descoberto via API local |

### Por que não os componentes visuais do LiveKit

`@livekit/components-react` exporta duas coisas: hooks e componentes
estilizados. Usamos os **hooks** (`useParticipants`, `useIsSpeaking`,
`useTrackToggle`, `useMediaDeviceSelect`, `useRoomContext`) e o
`RoomAudioRenderer`, que não tem visual e cuida de reproduzir o áudio de todos.

Os componentes visuais (`GridLayout`, `ParticipantTile`, `VideoConference`)
são construídos em torno de tiles de vídeo. O Concord é avatar-first, sem
vídeo de câmera. Adaptar o tile custaria mais CSS de sobrescrita do que montar
o círculo do zero.

### Por que não mesh

Em mesh cada pessoa sobe uma cópia do stream para cada outra. Com 5 na sala,
quem compartilha tela subiria ~40 Mbps e manteria 4 encoders. Com SFU, sobe
uma cópia só, independente de quantos estão na sala. E simulcast — mandar
resoluções diferentes para quem tem banda diferente — só existe com SFU.

O custo do SFU é banda de saída em **uma** máquina em vez de em todas. Na v1
essa máquina é a do host, o que é aceitável para 3–5 pessoas. Se crescer,
move o container para uma VPS mudando só `LIVEKIT_URL`.

---

## 2. Processos

Três processos em terminais separados. Nenhum inicia o outro.

```
next dev            :3000   app + rotas de API
livekit-server      :7880   SFU (WS) + :7881/udp (mídia)
ngrok http 3000             túnel público
```

Há um `docker-compose.yml` com o LiveKit para quem preferir, e um
`livekit.yaml` de desenvolvimento versionado.

**O ngrok expõe só a porta 3000.** A mídia WebRTC é UDP e vai por fora do
túnel, direto para o LiveKit. Isso significa que a porta UDP do LiveKit precisa
estar acessível para os convidados — em rede doméstica, port forwarding no
roteador. Se algum amigo estiver em CGNAT e não conectar, ligue o TURN
embutido do LiveKit (`turn:` no `livekit.yaml`). Está no `ROADMAP.md` como
item condicional.

---

## 3. Estrutura de pastas

```
concord/
├─ app/
│  ├─ layout.tsx              tokens, tema, providers
│  ├─ page.tsx                decide: perfil ou sala
│  ├─ sala/page.tsx
│  ├─ perfil/page.tsx
│  └─ api/
│     ├─ sessao/route.ts              GET  perfil por device-id
│     ├─ participantes/route.ts       POST cria/atualiza perfil
│     ├─ participantes/[id]/avatar/route.ts
│     ├─ token/route.ts               POST emite JWT do LiveKit
│     ├─ mensagens/route.ts           GET histórico · POST envia
│     ├─ ngrok/route.ts               GET URL pública
│     └─ moderacao/route.ts           POST mutar · remover (só host)
├─ components/
│  ├─ sala/  Grid, Avatar, BarraControles, SeletorMicrofone, TelaCompartilhada
│  ├─ chat/  Painel, Mensagem, Composer
│  └─ ui/    Botao, Input, Dropdown, Toast, EstadoVazio
├─ lib/
│  ├─ db/    schema.ts · client.ts · queries.ts
│  ├─ livekit/  token.ts · admin.ts
│  ├─ host.ts       detecção de host
│  ├─ ngrok.ts      descoberta do túnel
│  └─ imagem.ts     redimensionamento do avatar
├─ styles/  tokens.css · globals.css
├─ drizzle/ migrations geradas
├─ data/    concord.db  (gitignored)
├─ SPEC.md · ARCHITECTURE.md · ROADMAP.md · DESIGN-SYSTEM.md
```

Regra de camada: **componente não fala com o banco.** Componente chama rota de
API, rota chama `lib/db/queries.ts`, e só esse arquivo conhece o Drizzle.

---

## 4. Banco

### Schema

`lib/db/schema.ts` é a fonte única. Dele saem as migrations (`drizzle-kit
generate`) **e** os tipos TypeScript (`$inferSelect`). Nenhuma interface
`Participante` é escrita à mão em lugar nenhum.

```ts
export const salas = sqliteTable('salas', {
  id:        text('id').primaryKey(),
  slug:      text('slug').notNull().unique(),
  nome:      text('nome').notNull(),
  criadaEm:  integer('criada_em', { mode: 'timestamp' }).notNull(),
});

export const participantes = sqliteTable('participantes', {
  id:          text('id').primaryKey(),        // UUID do dispositivo
  nome:        text('nome').notNull(),
  avatar:      blob('avatar', { mode: 'buffer' }).notNull(),
  avatarMime:  text('avatar_mime').notNull(),
  criadoEm:    integer('criado_em', { mode: 'timestamp' }).notNull(),
  vistoEm:     integer('visto_em', { mode: 'timestamp' }).notNull(),
});

export const mensagens = sqliteTable('mensagens', {
  id:             integer('id').primaryKey({ autoIncrement: true }),
  salaId:         text('sala_id').notNull().references(() => salas.id),
  participanteId: text('participante_id').notNull().references(() => participantes.id),
  corpo:          text('corpo').notNull(),
  criadaEm:       integer('criada_em', { mode: 'timestamp' }).notNull(),
}, (t) => ({
  porSala: index('idx_mensagens_sala').on(t.salaId, t.criadaEm),
}));

export type Participante = typeof participantes.$inferSelect;
export type Mensagem     = typeof mensagens.$inferSelect;
```

### Preparado para múltiplas salas

A tabela `salas` existe desde o primeiro commit e `mensagens.salaId` é uma FK
real. A v1 usa uma constante `SALA_PADRAO = 'geral'`, semeada pela migration.

Quando múltiplas salas entrarem, o que muda é rota (`/sala/[slug]`) e UI de
navegação. **O schema não muda.** É por isso que ele já nasce assim.

### Por que o `.db` não é commitado

Binário em git gera conflito a cada escrita e incha o histórico. A migration
já entrega o mesmo resultado: quem clona roda `npm run db:migrate` (ou só
`npm run dev`, que aplica no boot) e ganha o banco com a sala padrão criada.

`data/` fica no `.gitignore` com um `.gitkeep`.

---

## 5. Autenticação no LiveKit

Não há login. O que existe é emissão de token.

1. Cliente manda o `device-id` para `POST /api/token`.
2. Servidor busca o participante. Não existe → 401.
3. Servidor monta um `AccessToken` com `identity = device-id`,
   `name = nome`, `room = SALA_PADRAO`, e as permissões
   `canPublish`, `canSubscribe`, `canPublishData`.
4. Token válido por 6 horas.
5. Cliente conecta no LiveKit com ele.

O `LIVEKIT_API_SECRET` vive só em `.env.local` e nunca chega ao cliente.
Há um `.env.example` versionado.

---

## 6. Detecção de host

O host é quem acessa direto pela máquina local. Requisição vinda do ngrok
sempre carrega `x-forwarded-for`; acesso local a `localhost:3000` não.

```ts
export function ehHost(req: Request): boolean {
  return !req.headers.get('x-forwarded-for');
}
```

Simples e suficiente para o modelo de ameaça (grupo de amigos, link privado).
Não é uma fronteira de segurança forte — está registrado no `ROADMAP.md` como
item a endurecer se o app um dia sair de casa.

Toda ação de moderação chama `ehHost` **no servidor**. A UI esconder o botão é
conveniência, não controle.

---

## 7. Descoberta do ngrok

O ngrok publica um painel local em `http://127.0.0.1:4040`, com
`GET /api/tunnels` devolvendo os túneis ativos.

`GET /api/ngrok` consulta esse endpoint com timeout de 1s e devolve:

```ts
{ estado: 'ativo', url: 'https://xxxx.ngrok-free.app' }
{ estado: 'ausente' }   // ngrok não está rodando
```

O header renderiza a partir desse estado. Sem heurística, sem campo manual.

---

## 8. Fluxo do avatar

1. Cliente valida tipo e tamanho (5 MB).
2. Desenha num `<canvas>` 256×256 com corte central.
3. `canvas.toBlob('image/webp', 0.85)`.
4. Envia como `multipart/form-data` para `POST /api/participantes`.
5. Servidor revalida tipo e rejeita acima de 64 KB.
6. Grava o buffer no SQLite.

A leitura (`GET /api/participantes/[id]/avatar`) devolve o blob com `ETag`
derivado de `vistoEm` e `Cache-Control: private, max-age=31536000,
must-revalidate`.

---

## 9. Regras de código

**Fonte única.** Uma informação vive num lugar só:

| Informação | Único lugar |
|---|---|
| Tokens visuais | `styles/tokens.css`, descrito em `DESIGN-SYSTEM.md` |
| Tipos de domínio | `lib/db/schema.ts`, via `$inferSelect` |
| Constantes (sala padrão, limites, bitrate) | `lib/constantes.ts` |
| Acesso a banco | `lib/db/queries.ts` |
| Estado de fala | `isSpeaking` do LiveKit |
| Quem está na sala | LiveKit, nunca duplicado no SQLite |

**Camadas.** Componente → rota de API → query. Sem pular etapas.

**Nomes em português** nos arquivos de domínio e classes CSS, seguindo o
padrão do design system. Termos técnicos consagrados (token, hook, blob)
ficam como estão.

**Componente pequeno.** Um componente que passa de ~150 linhas vira dois.

**Sem estado derivado.** Se dá para calcular a partir do que já existe, não
guarde. `estaFalando` não é `useState`, é o valor do hook.

**Erro é tratado onde pode ser resolvido.** Rota de API devolve status e
mensagem legível; o componente mostra no lugar certo, não num `alert`.
