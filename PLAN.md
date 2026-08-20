# PLAN — construção da v1

Ordem de montagem do Concord. Documento temporário: morre quando a v1 fecha.

O que fica **fora** daqui: o que vem depois da v1 (`ROADMAP.md`), o que a v1 é
(`SPEC.md`), como ela é feita (`ARCHITECTURE.md`) e como ela parece
(`DESIGN-SYSTEM.md`).

Cada fase termina com algo verificável. Não comece a próxima com a anterior
quebrada.

---

## Fase 0 — Scaffold

Esqueleto sem funcionalidade nenhuma.

- `create-next-app` com TypeScript e App Router, sem Tailwind, sem ESLint
  padrão do template
- Dependências: `livekit-client`, `@livekit/components-react`,
  `livekit-server-sdk`, `better-sqlite3`, `drizzle-orm`, `drizzle-kit`
- Árvore de pastas conforme `ARCHITECTURE.md` seção 3, com os diretórios
  vazios criados
- `styles/tokens.css` e `styles/globals.css` a partir de `DESIGN-SYSTEM.md`
  seções 2 e 3
- Script inline de tema no `<head>` do root layout, antes da primeira pintura
- `.env.example`, `.gitignore` com `data/` e `data/.gitkeep`
- `README.md` com os três comandos para subir o projeto

**Pronto quando:** `npm run dev` abre uma página em branco no tema certo, e
alternar `prefers-color-scheme` no sistema operacional troca o fundo sem
recarregar.

---

## Fase 1 — Banco

- `lib/db/schema.ts` com as três tabelas
- `lib/db/client.ts` abrindo o SQLite em `data/concord.db`
- Migration gerada com `drizzle-kit generate`
- Seed da sala padrão (`SALA_PADRAO = 'geral'`)
- Aplicação automática das migrations no boot
- `lib/constantes.ts` com sala padrão, limites de imagem e bitrate

**Pronto quando:** apagar `data/concord.db`, rodar `npm run dev`, e o banco
renascer com a sala padrão dentro. Os tipos `Participante` e `Mensagem` já
importáveis.

---

## Fase 2 — Perfil e identidade

Ainda sem áudio. É a primeira tela de verdade.

- `lib/imagem.ts` — validação, corte central, resize 256×256, WebP
- `POST /api/participantes` — cria ou atualiza, revalida no servidor
- `GET /api/participantes/[id]/avatar` — blob com ETag
- `GET /api/sessao` — busca perfil pelo device-id
- Componentes `ui/`: `Botao`, `Input`, `Toast`
- Tela de perfil: seletor de foto com preview, campo de nome, validação
- Geração e persistência do device-id no `localStorage`

**Pronto quando:** você cadastra perfil, dá F5, e a tela de perfil não aparece
mais — cai numa página de sala vazia com seu nome e sua foto.

---

## Fase 3 — Áudio

O coração do projeto.

- `livekit.yaml` de desenvolvimento e `docker-compose.yml`
- `lib/livekit/token.ts` e `POST /api/token`
- `lib/host.ts` com `ehHost`
- Conexão com o LiveKit ao entrar na sala
- `RoomAudioRenderer` montado
- Grid de avatares de 96px com estados de fala via `isSpeaking`
- Botão de microfone com mute
- Captura com `echoCancellation`, `noiseSuppression`, `autoGainControl`

**Pronto quando:** duas abas na mesma máquina entram na sala, você fala, e o
avatar da aba certa ganha o anel roxo. Depois: um amigo pelo ngrok.

Esta é a fase que mais provavelmente trava. Se o áudio conecta local mas não
pelo ngrok, o problema é a porta UDP do LiveKit — ver `ARCHITECTURE.md` seção
2 e o item de TURN no `ROADMAP.md`.

---

## Fase 4 — Header e link do ngrok

- `lib/ngrok.ts` consultando `127.0.0.1:4040/api/tunnels` com timeout de 1s
- `GET /api/ngrok` devolvendo `ativo` ou `ausente`
- Header 52px com logo, bloco do link com botão de copiar, toggle de tema
- Estado sem ngrok mostrando a instrução, não um link quebrado

**Pronto quando:** derrubar o ngrok e o header trocar de link para instrução
sozinho; subir de novo e voltar.

---

## Fase 5 — Compartilhamento de tela

- Publicação com `contentHint: 'detail'`, VP9, teto de 10 Mbps
- Trava de um por vez, com o nome de quem está compartilhando no `title`
- Layout alternativo: faixa de avatares de 24px no topo, vídeo abaixo
- Voltar ao grid ao parar

**Pronto quando:** você compartilha, o amigo vê texto legível, e o botão dele
fica desabilitado explicando o motivo.

---

## Fase 6 — Seletor de microfone

- `useMediaDeviceSelect` para listar entradas de áudio
- Botão dividido: corpo alterna mute, seta abre dropdown
- Troca via `room.switchActiveDevice` sem reconectar
- Preferência salva no `localStorage`

**Pronto quando:** trocar de microfone durante uma conversa e o outro lado não
perceber corte.

---

## Fase 7 — Chat

- `GET /api/mensagens` (últimas 200) e `POST /api/mensagens`
- Tempo real via `publishData` do LiveKit; o SQLite guarda o histórico
- Painel de 320px com Mensagem e Composer
- Agrupamento por autor dentro de 5 minutos
- Contador de não lidas no botão
- Estado vazio

**Pronto quando:** mandar mensagem, reiniciar o servidor, reentrar e o
histórico estar lá.

Atenção à fonte única: a mensagem é gravada **uma vez**, no `POST`. O
`publishData` só notifica os outros clientes — não é um segundo caminho de
escrita.

---

## Fase 8 — Moderação

- `POST /api/moderacao` com `ehHost` validado no servidor
- `lib/livekit/admin.ts` com `mutePublishedTrack` e `removeParticipant`
- Botões no hover do avatar, visíveis só para o host

**Pronto quando:** o host muta e remove; e um convidado chamando a rota pelo
DevTools recebe 403.

---

## Fase 9 — Acabamento (Concluída)

- [x] Percorrer os critérios de aceite do `SPEC.md` seção 11, um a um
- [x] Estados vazios e de erro em todas as telas
- [x] Foco visível por teclado em todo controle
- [x] `prefers-reduced-motion` respeitado
- [x] Responsivo até 380px
- [x] Zero `console.error` no fluxo feliz
- [x] README revisado por alguém que nunca rodou o projeto

**Pronto quando:** um amigo clona o repo e sobe sozinho, só com o README.


---

## Como usar isto com o agente

Uma fase por sessão. No começo de cada uma, dê ao agente:

- `SPEC.md` e `ARCHITECTURE.md` sempre
- `DESIGN-SYSTEM.md` a partir da fase 2, quando aparece UI
- Este arquivo, apontando **qual fase** é a da vez

Jogar os quatro documentos de uma vez em todas as sessões dilui a atenção e
gasta contexto à toa.

Ao fechar uma fase, marque aqui e faça commit. Se o critério de "pronto
quando" não passa, a fase não fechou — não siga.
