# ROADMAP — Concord

Fora da v1. Ordenado por relação entre valor e esforço, não por prioridade
fixa. Nada aqui é compromisso.

Regra: item que sair daqui vira spec no `SPEC.md` antes de virar código.

---

## Condicional — só se doer

### TURN para CGNAT

Se algum amigo não conseguir conectar, o motivo mais provável é NAT simétrico
(comum em CGNAT de operadora, principalmente internet móvel). O furo de NAT
falha e a chamada nunca completa.

O LiveKit tem TURN embutido: liga na seção `turn:` do `livekit.yaml`, com um
certificado. Custa banda — o TURN relaya 100% do tráfego dessa pessoa.

Só implementar quando acontecer. Diagnóstico: `iceConnectionState` fica em
`failed` só para ela, enquanto os outros conectam.

### SFU em VPS

Se o grupo passar de ~5 pessoas com compartilhamento de tela, o upload da casa
do host vira gargalo (ele redistribui o stream para todos).

Migração: subir o mesmo container numa VPS (~$8/mês) e trocar `LIVEKIT_URL`.
Nenhuma linha de front muda. É por isso que a arquitetura é SFU desde o começo.

---

## Curto prazo

### Canal de eventos em tempo real (SSE)

Peça compartilhada pelos dois itens abaixo — sem ela, nenhum dos dois tem
como saber "quem está online" ou "chegou mensagem nova" fora de uma conexão
LiveKit específica (que só existe pra quem já está numa chamada).

- Uma conexão `EventSource` por aba, aberta no **shell geral do app** —
  acima de `Sala`/`LiveKitRoom`, nunca dentro do painel de chat nem da sala
  de voz. Fica de pé com o painel fechado e sem nenhuma chamada ativa.
- Identificação via `deviceId` na query string (`GET
  /api/eventos?deviceId=...`) — mesmo padrão já usado em `GET /api/sessao`.
  `EventSource` só aceita URL, não dá pra mandar header custom.
- **Presença** por ciclo de vida da conexão: `Map<deviceId, conexão>` em
  memória no servidor — abriu é online, fechou (`req.on('close')`) é
  offline. Sem heartbeat; entra depois, condicional, só se o problema do
  "fantasma" (desconexão abrupta que demora a cair) doer de verdade — mesmo
  espírito do item TURN acima.
- **Escrita continua só por `POST /api/mensagens`**, como já é hoje — o SSE
  nunca escreve, só notifica quem está com a conexão aberta. Mesma regra de
  fonte única da Fase 7 do `PLAN.md`.
- Um broadcast só alcança todo mundo conectado, não por sala: o cliente
  filtra por `salaId` — atualiza o painel se for o canal aberto, incrementa
  o contador de não lidas se for outro.

### Múltiplas salas e Sidebar de canais (estilo Discord)

Evolução do layout para barra lateral fixa (~220px) com lista de canais categorizados:

- **Canais de Texto:** Operam de forma independente da voz — mensagens entregues via o canal de eventos acima, não pelo LiveKit. Permite ler e enviar mensagens em qualquer canal de texto enquanto conversa em qualquer canal de voz.
- **Canais de Voz:** Mostram a lista de quem está conectado e falando diretamente na árvore da sidebar.
- **Rota `/sala/[slug]`:** Navegação entre canais sem recarregar a página.
- **Gestão de Salas:** Criar, renomear e apagar canais com controle restrito ao Host.
- **Card de Estado da Voz:** No rodapé da sidebar, com ícone de status (cor `--ok`, sem emoji — ver `DESIGN-SYSTEM.md` §9), canal ativo, indicador de qualidade de conexão e botão de desconectar.

Em aberto: `salas` hoje não distingue tipo — cada linha é voz e texto
grudados na mesma entidade (`lib/db/schema.ts`). Pra ter canal de texto sem
voz associada (ou vice-versa) precisa de uma coluna `tipo` nova (`'texto' |
'voz'`, ou parecido) em `salas` antes disso virar spec.

### Entrar/sair da chamada de voz sob demanda

Hoje `Sala.tsx` conecta ao LiveKit e já entra na chamada de voz imediatamente ao carregar a tela (`<LiveKitRoom connect audio={OPCOES_AUDIO}>`).

Com a separação por demanda:
- **Modo Desconectado (Padrão):** O usuário entra no app, navega pelo chat de texto e visualiza quem está online sem abrir microfone nem consumir banda WebRTC — presença vem do canal de eventos acima, não do LiveKit.
- **Clique no Canal de Voz:** Inicia o handshake do LiveKit conectando apenas à sala de voz selecionada.
- **Troca de Canal:** Clicar em outro canal de voz desconecta da sala anterior e conecta na nova sem precisar recarregar o navegador.
- **Botão de Desconectar:** Desliga a chamada de voz mantendo a navegação e o chat de texto ativos.

### Push-to-talk

Tecla configurável, com indicador visual de que está pressionada. Preferência
por participante, salva no `localStorage`. Conviver com voz aberta, não
substituir.

### Vídeo de câmera

O grid vira misto: quem está com câmera mostra vídeo, quem não está mostra
avatar. O anel de fala continua valendo nos dois. Exige repensar o layout do
grid, que hoje assume círculos de tamanho igual.

### Túnel via SDK do ngrok

Trocar o processo separado do ngrok pelo `@ngrok/ngrok`, subindo o túnel de
dentro do Node. Elimina um dos três processos e a consulta a
`127.0.0.1:4040` — a URL vem direto de `ngrok.connect()`.

Só a fase 4 muda; `GET /api/ngrok` continua devolvendo `{ estado, url }`.

Cuidados: o hot reload do Next pode derrubar e recriar o túnel, e a URL
gratuita muda a cada reconexão. Guardar a instância num global e usar
`instrumentation.ts` para garantir execução única.

### Ajuste de volume por participante

Slider individual no hover do avatar. `RemoteAudioTrack.setVolume()`.
Preferência local, não sincronizada.

### Indicador de qualidade de conexão

`ConnectionQuality` do LiveKit já entrega. Ponto discreto no canto do avatar,
só aparece quando cai para `poor`.

---

## Médio prazo

### Contas com login

Hoje a identidade é um UUID no navegador: trocar de navegador cria perfil
novo. Contas resolveriam isso e dariam base para permissões reais.

Implica endurecer a detecção de host, que hoje é heurística de rede
(`ARCHITECTURE.md`, seção 6).

### Múltiplos servidores

O nível acima de salas: instâncias separadas com participantes e permissões
próprios. Só faz sentido depois de contas.

### Versão Angular

Reescrita do front em Angular 19 standalone, consumindo o mesmo backend e o
mesmo `livekit-client`. Sem `@livekit/components-react` — a lógica dos hooks
vira serviços com observables, o que o LiveKit já favorece: o core deles é
baseado em observables justamente para isso.

Duas escolhas a fazer na hora: CSS puro por componente (como o Inari faz) ou
CSS Modules; e se o `DESIGN-SYSTEM.md` passa a ser compartilhado entre as duas
versões — deveria.

### Transportes alternativos, selecionáveis no início

Escolher no primeiro boot como a mídia trafega:

- **LiveKit (SFU)** — o padrão de hoje
- **mediasoup** — SFU em Node, roda no mesmo processo do app, sem binário Go
  separado. Mais leve de instalar, mais código para escrever
- **Mesh P2P** — sem servidor de mídia. Serve para 2–3 pessoas e para quem não
  pode abrir porta UDP. Cai muito rápido com screen share

Exige uma camada de abstração de transporte que a v1 não tem. Só vale se a
instalação do LiveKit se mostrar um obstáculo real para alguém.

---

## Longo prazo / talvez nunca

- Gravação da sala (LiveKit Egress)
- Markdown e anexos no chat
- Reações rápidas sobre o avatar
- Compartilhamento de tela por mais de uma pessoa ao mesmo tempo
- Bot de música
- Criptografia ponta a ponta (o LiveKit suporta; exige distribuir chave)
- Cliente desktop com Electron ou Tauri

---

## Explicitamente fora

- Federação com Discord, Matrix ou qualquer outro
- Aplicativo mobile nativo
- Hospedagem multi-tenant para terceiros
- Moderação automática de conteúdo

O Concord é para um grupo de amigos numa máquina local. Cada item desta lista
o transformaria em outro produto.
