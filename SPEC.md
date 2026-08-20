# SPEC — Concord v1

Sala de voz local, self-hosted, para um grupo pequeno de amigos. O host roda o
app na própria máquina, expõe via ngrok e compartilha o link.

---

## 1. Objetivo

Uma sala de voz sempre disponível enquanto o host estiver com o app ligado,
com compartilhamento de tela em boa qualidade e chat de texto persistido.
Sem cadastro, sem servidor externo, sem dependência de serviço pago.

## 2. Fora do escopo da v1

Estão no `ROADMAP.md`: múltiplas salas, múltiplos servidores, contas com
login, vídeo de câmera, gravação, push-to-talk, versão Angular, transportes
alternativos.

O schema e o roteamento **já nascem preparados para múltiplas salas** (ver
`ARCHITECTURE.md`, seção 4). A v1 fixa uma sala única por escopo e economia de
processamento, não por limitação estrutural.

---

## 3. Papéis

**Host** — quem roda o app na própria máquina. Identificado pela origem da
requisição (ver `ARCHITECTURE.md`, seção 6), não por senha. Só existe um.

**Convidado** — qualquer pessoa que abra o link do ngrok.

---

## 4. Fluxos

### 4.1 Host

1. Sobe o app (`npm run dev`) e o ngrok (`ngrok http 3000`) em terminais
   separados.
2. Abre `localhost:3000`. O app reconhece que é o host e entra direto na sala,
   se já tiver perfil salvo.
3. No topo, uma barra fina mostra a URL pública do ngrok com botão de copiar.
4. Sem ngrok rodando, a barra mostra o estado em vez do link:
   "ngrok não detectado — rode `ngrok http 3000` para gerar o link."

### 4.2 Convidado, primeiro acesso

1. Abre a URL do ngrok e cai na **tela de perfil**.
2. Escolhe uma foto e digita um nome. Ambos obrigatórios.
3. Vê o preview do próprio avatar como vai aparecer na sala.
4. Clica em "Entrar na sala".

### 4.3 Convidado, acessos seguintes

Volta direto para a sala com nome e foto preenchidos. O reconhecimento usa um
identificador salvo no navegador, não o IP (ver seção 7).

Link discreto "Trocar perfil" no rodapé da sala para refazer.

---

## 5. Sala

### 5.1 Grid de participantes

Avatares circulares de 96px centralizados, `auto-fill`, com o nome abaixo.
Sem barra lateral de navegação.

O estado de fala vem da detecção nativa do LiveKit (`isSpeaking`), não de uma
implementação própria de Web Audio — uma fonte só.

| Estado | Avatar | Anel |
|---|---|---|
| Falando | opacidade 1, `scale(1.04)` | anel roxo de 3px |
| Em silêncio | opacidade 0.55, `scale(1)` | sem anel |
| Mic mutado | opacidade 0.55 + ícone de mic cortado | sem anel |

Transições e comportamento sob `prefers-reduced-motion` estão em
`DESIGN-SYSTEM.md`, seções 5 e 7.

### 5.2 Barra de controles

Fixa no rodapé, centralizada:

- **Microfone** — botão dividido: o corpo alterna o mute, a seta abre a lista
  de entradas de áudio para trocar de microfone sem sair da sala.
- **Compartilhar tela** — inicia/para. Ativo fica roxo.
- **Chat** — abre/fecha o painel. Mostra contagem de não lidas.
- **Sair** — volta para a tela de perfil.

### 5.3 Compartilhamento de tela

Só uma pessoa por vez. Se alguém já estiver compartilhando, o botão fica
desabilitado com o motivo no `title`: "Fulano está compartilhando a tela."

Ao iniciar, o grid encolhe para uma faixa no topo e o vídeo ocupa o resto.
Ao parar, volta ao grid.

> **2026-08-20** — adicionado botão de tela cheia no vídeo compartilhado
> (clique ou duplo-clique), com atalho de teclado nativo (`Esc`) para sair.
> Fora do escopo original desta seção, pedido pelo usuário durante a Fase 5.

Qualidade: `contentHint: 'detail'`, resolução preservada até 1440p, bitrate
máximo de 10 Mbps, VP9 com fallback automático para VP8.

> **2026-08-20** — fallback para VP8 removido (`backupCodec` retirado de
> `lib/constantes.ts`). Causava `ConnectionError` no Firefox ao negociar dois
> codecs simultâneos para a mesma faixa. Hoje a publicação é só VP9; um
> participante em navegador sem suporte a decodificar VP9 (ex.: Safari/iOS
> antigo) não vê a tela compartilhada, sem aviso na tela. Decisão pendente de
> confirmação — ver conversa no `agy.md` item 6.

### 5.4 Áudio

Voz aberta, sem push-to-talk. Captura com `echoCancellation`,
`noiseSuppression` e `autoGainControl` ligados — nativos do navegador, sem
dependência extra.

### 5.5 Chat

Painel lateral de 320px. Mensagens persistidas no SQLite, últimas 200
carregadas ao entrar. Avatar pequeno, nome, texto e hora; mensagens seguidas
do mesmo autor agrupam.

Sem edição, deleção, anexos ou markdown na v1.

---

## 6. Autoridade do host

Ao passar o mouse sobre um avatar, o host vê dois botões:

- **Mutar** — força o mute do microfone da pessoa. Ela pode religar.
- **Remover** — desconecta e devolve à tela de perfil.

Ambos usam a API de servidor do LiveKit. A checagem de permissão é no
servidor, não só na UI.

---

## 7. Identidade

No primeiro acesso o cliente gera um UUID v4 e guarda em `localStorage` sob
`concord:device-id`. Toda entrada envia esse UUID.

O servidor procura o participante por esse ID. Achou, devolve nome e avatar e
pula a tela de perfil. Não achou, é primeiro acesso.

**Não usar IP.** IP muda entre sessões, e vários amigos atrás do mesmo NAT
compartilham o mesmo endereço — daria falso positivo.

Limpar o `localStorage` ou trocar de navegador cria um perfil novo. É o
comportamento esperado na v1.

---

## 8. Avatar

- Aceita `image/png`, `image/jpeg`, `image/webp`.
- Rejeita acima de **5 MB** antes do upload, com mensagem no campo.
- Redimensiona no cliente para **256×256**, corte central, WebP qualidade
  0.85. Resultado típico: 15–25 KB.
- Rejeita no servidor qualquer blob acima de **64 KB** — o cliente pode ser
  contornado, o servidor não confia nele.
- Guardado como blob no SQLite, servido por
  `GET /api/participants/[id]/avatar` com `ETag` e `Cache-Control` longo.

> **2026-08-20** — pedido do usuário: suporte a `image/gif` como avatar
> animado (anima ao falar, congela no frame parado). GIF não passa pelo
> pipeline de corte/WebP acima — vai para o banco como veio, sem re-encode.
> Para acomodar isso o limite de entrada subiu de **5 MB** para **15 MB**,
> no cliente (`lib/imagem.ts`) e no servidor (`lib/constantes.ts`,
> `AVATAR_TAMANHO_MAX_*`).
>
> Resolvido: junto do upload, o cliente também extrai um frame estático do
> GIF (mesmo pipeline de corte/WebP 256×256) e envia os dois — o original
> (`avatar`) e o estático (`avatarEstatico`, coluna nova em `participantes`).
> O teto de **64 KB** original virou `AVATAR_PROCESSADO_TAMANHO_MAX` (256 KB,
> folga sobre o típico 15–25 KB) e vale pros dois: o `avatar` quando não é
> GIF, e o `avatarEstatico` sempre que existe. Só o GIF original fica sujeito
> ao teto de 15 MB — ele nunca é comprimido, é a peça que anima.
>
> Leitura: `GET /api/participantes/[id]/avatar?variante=estatico|animado`.
> `estatico` (padrão) devolve `avatarEstatico` se existir, senão `avatar`
> direto. `animado` sempre devolve `avatar`. O cliente busca `estatico` de
> cara e só busca `animado` na primeira vez que a pessoa fala — depois disso
> fica em cache, sem nova requisição enquanto a aba não recarrega.

Nenhum arquivo de imagem em disco. O banco é a fonte única.

---

## 9. Persistência

SQLite local, arquivo único em `data/concord.db`, criado no primeiro boot pela
migration. O `.db` **não é commitado** — o schema é.

Sobrevivem ao restart: perfis e histórico de chat. Não sobrevive: quem está
conectado agora, que é estado do LiveKit.

---

## 10. Visual

Segue `DESIGN-SYSTEM.md`, que é a fonte única de tokens, tipografia e
componentes. Nenhuma cor, raio ou tamanho de fonte é declarado neste
documento nem repetido no código.

Temas claro e escuro, com toggle no header e default vindo de
`prefers-color-scheme`.

---

## 11. Critérios de aceite

- [ ] Host abre `localhost:3000` e vê o link do ngrok no topo.
- [ ] Convidado abre o link, cadastra nome e foto, entra na sala.
- [ ] Convidado fecha a aba, reabre e cai direto na sala com o perfil dele.
- [ ] Avatar anima ao falar e escurece ao parar, para todos na sala.
- [ ] Trocar de microfone pela barra funciona sem reconectar.
- [ ] Compartilhar tela funciona e trava para os demais enquanto ativo.
- [ ] Chat persiste depois de reiniciar o servidor.
- [ ] Host consegue mutar e remover; convidado não vê os controles e recebe
      403 se chamar a API na mão.
- [ ] Alternar tema não pisca no carregamento.
- [ ] Nenhum `console.error` no fluxo feliz.
