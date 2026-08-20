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

### Múltiplas salas

O schema já suporta (`salas` + `mensagens.salaId`). Falta:

- Rota `/sala/[slug]`
- Lista de salas na UI, com contagem de gente em cada
- Criar e apagar sala (só host)
- Trocar de sala sem recarregar a página

### Push-to-talk

Tecla configurável, com indicador visual de que está pressionada. Preferência
por participante, salva no `localStorage`. Conviver com voz aberta, não
substituir.

### Vídeo de câmera

O grid vira misto: quem está com câmera mostra vídeo, quem não está mostra
avatar. O anel de fala continua valendo nos dois. Exige repensar o layout do
grid, que hoje assume círculos de tamanho igual.

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
