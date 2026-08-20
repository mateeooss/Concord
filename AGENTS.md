# Concord

App de voz local para um grupo pequeno de amigos. O host roda na própria
máquina e expõe via ngrok. Voz aberta, compartilhamento de tela e chat de
texto persistido.

## Documentos

- `SPEC.md` — o que a v1 faz
- `ARCHITECTURE.md` — decisões técnicas, schema, estrutura de pastas
- `DESIGN-SYSTEM.md` — tokens e componentes visuais
- `PLAN.md` — fases de construção da v1
- `ROADMAP.md` — o que fica para depois da v1

Leia `SPEC.md` e `ARCHITECTURE.md` antes de qualquer tarefa. Leia
`DESIGN-SYSTEM.md` quando a tarefa envolver UI.

Trabalhe uma fase do `PLAN.md` por vez, e só a que foi pedida.

## Stack

Next.js 15 (App Router, TypeScript) · LiveKit self-hosted (SFU) ·
SQLite via `better-sqlite3` · Drizzle · CSS Modules.

Sem Tailwind.

## Regras de código

- **Fonte única.** Cada informação vive num lugar só. A tabela de referência
  está em `ARCHITECTURE.md` seção 9.
- **Camadas.** Componente → rota de API → query. Sem pular etapas. Componente
  nunca fala com o banco.
- **Tipos de domínio** vêm de `lib/db/schema.ts` via `$inferSelect`. Nunca
  escreva uma interface de domínio à mão.
- **Cor, raio, fonte e duração** vêm de `styles/tokens.css`. Nunca hardcode
  um valor visual.
- **Nomes de domínio e classes CSS em português.** Termos técnicos
  consagrados (token, hook, blob) ficam em inglês.
- **Componente acima de ~150 linhas vira dois.**
- **Sem estado derivado.** Se dá para calcular a partir do que já existe, não
  guarde num `useState`.
- **Erro é tratado onde pode ser resolvido.** Rota devolve status e mensagem
  legível; o componente mostra no lugar certo, nunca num `alert`.

## Comandos

```
npm run dev            app em :3000
livekit-server --dev   SFU em :7880
ngrok http 3000        túnel público
```

Os três rodam em terminais separados. Nenhum inicia o outro.

## Não faça

- Não instale Tailwind.
- Não use os componentes visuais de `@livekit/components-react`
  (`GridLayout`, `ParticipantTile`, `VideoConference`). Só os hooks e o
  `RoomAudioRenderer`. O motivo está em `ARCHITECTURE.md` seção 1.
- Não implemente detecção de fala própria com Web Audio. Use `isSpeaking`
  do LiveKit.
- Não commite `data/concord.db`.
- Não adiante fases seguintes do `PLAN.md`.
