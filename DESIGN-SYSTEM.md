# Design System — Concord

Fonte única de tokens e componentes visuais do Concord. Nada de cor, raio,
tamanho de fonte ou duração de transição é declarado fora deste documento e do
`styles/tokens.css` que ele descreve.

Derivado da linguagem visual do Inari, mas é outro produto: o que veio de lá é
o *sistema* (roxo único, hierarquia por borda, chapado, denso), não as telas.

Resumo em uma linha: **claro ou escuro, roxo, denso e chapado** — um único roxo
de marca, bordas de 1px, raios de 8–12px, corpo em 13px, zero gradiente, sombra
quase inexistente, transições de 120ms.

---

## 1. Como o CSS é escrito

- Next.js App Router. **CSS Modules** por componente, sem Tailwind.
  (O Inari tinha Tailwind instalado e não usado; aqui ele simplesmente não
  entra.)
- Tokens globais em `styles/tokens.css`, importado uma vez no root layout.
- Classes utilitárias compartilhadas (`.btn`, `.input`, `.card`) em
  `styles/globals.css` — **não duplicadas por componente**. Essa era a
  pendência nº 9 do Inari e nasce resolvida aqui.
- Nomes de classe em português, semânticos: `.avatar`, `.avatar.falando`,
  `.barra-controles`, `.btn-primario`.

---

## 2. Tokens

`styles/tokens.css`:

```css
:root {
  /* Marca */
  --roxo:            #7c5cbf;
  --roxo-hover:      #6b4daa;
  --roxo-suave:      #f0ecf6;
  --roxo-suave-2:    #f8f6fc;
  --roxo-borda:      #e6dff5;

  /* Superfícies */
  --fundo-app:       #f8f7fa;
  --fundo-card:      #ffffff;
  --fundo-sutil:     #faf9fc;
  --fundo-input:     #f8f7fa;
  --header:          #2d1f3d;
  --header-texto:    #f0ecf4;
  --header-texto-2:  #c5bdd0;
  --video-bg:        #1a1820;

  /* Texto */
  --texto:           #3a3540;
  --texto-2:         #9590a0;
  --texto-3:         #b5b0bc;

  /* Bordas */
  --borda:           #ddd8e0;
  --borda-forte:     #c5c0cc;
  --borda-suave:     #ece9f1;

  /* Estados */
  --erro:            #d05040;
  --erro-borda:      #f5c6c0;
  --erro-fundo:      #fef2f0;
  --ok:              #5a8a52;
  --ok-fundo:        #eef6ec;
  --ok-borda:        #c3debb;
  --aviso:           #b07a2a;
  --aviso-fundo:     #fdf6ea;
  --aviso-borda:     #f0dfc0;
  --desabilitado:    #c5c0cc;

  /* Sombras */
  --sombra-card:     0 2px 8px rgba(60, 50, 80, 0.06);
  --sombra-dropdown: 0 6px 20px rgba(60, 50, 80, 0.12);
  --sombra-toast:    0 4px 12px rgba(0, 0, 0, 0.08);
}

[data-tema="escuro"] {
  --roxo:            #9b7fd4;
  --roxo-hover:      #ab92dd;
  --roxo-suave:      #2a2336;
  --roxo-suave-2:    #241f2e;
  --roxo-borda:      #3a3049;

  --fundo-app:       #16141a;
  --fundo-card:      #1e1b24;
  --fundo-sutil:     #232029;
  --fundo-input:     #232029;
  --header:          #2d1f3d;
  --header-texto:    #f0ecf4;
  --header-texto-2:  #c5bdd0;
  --video-bg:        #100e14;

  --texto:           #e8e4ee;
  --texto-2:         #9b95a6;
  --texto-3:         #6f6a7a;

  --borda:           #322d3a;
  --borda-forte:     #443d4f;
  --borda-suave:     #282430;

  --erro:            #e57363;
  --erro-borda:      #5c322c;
  --erro-fundo:      #2a1c1a;
  --ok:             #7fae76;
  --ok-fundo:        #1c2a1a;
  --ok-borda:        #35502e;
  --aviso:           #d1a05a;
  --aviso-fundo:     #2a2318;
  --aviso-borda:     #4d3f22;
  --desabilitado:    #443d4f;

  --sombra-card:     0 2px 8px rgba(0, 0, 0, 0.3);
  --sombra-dropdown: 0 6px 20px rgba(0, 0, 0, 0.45);
  --sombra-toast:    0 4px 12px rgba(0, 0, 0, 0.5);
}
```

### Notas sobre o tema escuro

O roxo **clareia** no escuro (`#7c5cbf` → `#9b7fd4`) para manter contraste de
texto legível sobre fundo escuro. É o único token de marca que muda de matiz.

O `--header` é idêntico nos dois temas. Ele já é um roxo escuro, então a barra
superior atravessa a troca de tema sem piscar — é a costura natural entre os
dois modos.

O `--video-bg` escurece um pouco no tema escuro para o vídeo não parecer uma
janela clara flutuando.

### Mecânica do tema

- Atributo `data-tema="claro" | "escuro"` no `<html>`.
- Default: `prefers-color-scheme` do sistema.
- Toggle no header, persistido em `localStorage` sob `concord:tema`.
- Script inline no `<head>` aplica o tema **antes da primeira pintura**, para
  não haver flash de tema claro em quem usa escuro.
- `<meta name="color-scheme" content="light dark">` para os controles nativos
  (scrollbar, seletor de arquivo) acompanharem.

---

## 3. Reset e base global

```css
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html, body {
  height: 100%;
  background: var(--fundo-app);
  color: var(--texto);
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  font-size: 13px;
  -webkit-font-smoothing: antialiased;
}

::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--borda); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: var(--borda-forte); }
```

---

## 4. Tipografia

Fonte única, do sistema: `'Segoe UI', system-ui, -apple-system, sans-serif`.

**Todo botão e input traz `font-family: inherit`.** Sem isso o Chrome aplica a
fonte de formulário. É regra do sistema, não detalhe.

| Papel | Tamanho | Peso | Cor |
|---|---|---|---|
| Título de tela | 20px | 600 | `--texto` |
| Título de seção | 15px | 600 | `--texto` |
| Nome na sala | 14px | 600 | `--texto` |
| Corpo / input / botão | 13px | 400–500 | `--texto` |
| Label de campo | 13px | 600 | `--texto` |
| Autor no chat | 12px | 600 | `--texto` |
| Meta / hint / hora | 12px | 400 | `--texto-2` |
| Contador / hint mínimo | 11px | 400 | `--texto-3` |
| Logo | 15px | 700, `letter-spacing: 2px` | `--header-texto` |

Texto corrido (mensagens de chat) usa `line-height: 1.5`.

---

## 5. Forma e movimento

- **Raios**: 6px (chip, mini-botão) · 8px (botão, input, ícone) · 10px
  (dropdown, botão grande) · 12px (card) · 14px (dropzone) · 50% (avatar).
- **Bordas**: sempre `1px solid`. Tracejada `2px dashed` só para zona de
  "adicionar" (o seletor de foto na tela de perfil).
- **Sombras**: praticamente ausentes. Só dropdown e toast. Hierarquia vem da
  borda.
- **Transições**: `0.12s` para cor, borda e fundo. `0.15s` para `transform`.
  Sem `ease` nomeado.
- **Nunca anime layout.** Só `opacity`, `transform` e `box-shadow`.
- **Sem gradiente, sem glassmorphism.**

### Movimento reduzido

Sob `prefers-reduced-motion: reduce`, o anel de fala e a opacidade continuam
(são informação, não decoração), mas o `transform: scale` é removido e as
durações caem para `0.01ms`.

---

## 6. Layout

```
┌────────────────────────────────────────────┐
│ header 52px  #2d1f3d                       │
│ CONCORD    [link ngrok · copiar]    [tema] │
├────────────────────────────────────────────┤
│                                            │
│              grid de avatares              │
│                                  ┌─────────┤
│                                  │  chat   │
│                                  │  320px  │
├──────────────────────────────────┤         │
│      [mic ▾] [tela] [chat] [sair] │        │
└────────────────────────────────────────────┘
```

- `.shell { display:flex; flex-direction:column; height:100vh }`.
- Sem sidebar de navegação. A v1 tem uma sala só.
- Header: `height:52px; padding:0 24px`. O bloco do ngrok fica centralizado; o
  toggle de tema à direita.
- Área central rola; header e barra de controles são fixos.
- Espaçamentos: 24px entre blocos grandes, 16px entre campos, 12px dentro de
  card, 8px entre itens de lista.

---

## 7. Componentes

### Botões

Todos: `font-family: inherit; cursor: pointer; font-weight: 500`.

| Variante | Estilo | Hover | Disabled |
|---|---|---|---|
| Primário | `bg --roxo`, texto branco, sem borda, raio 8px, `10px 20px` | `--roxo-hover` | `bg --desabilitado`, `not-allowed` |
| Secundário | `bg --fundo-card`, `1px solid --borda`, texto `--texto` | borda `--borda-forte`, fundo `--fundo-app` | texto `--texto-2` |
| Fantasma | sem fundo, borda transparente, texto `--texto-2` | texto `--texto`, borda aparece | texto `--desabilitado` |
| Perigo | `bg --fundo-card`, borda `--erro-borda`, texto `--erro` | `bg --erro-fundo` | — |
| Ícone (28×28) | quadrado raio 8px, borda `--borda`, ícone `--texto-2` | borda e ícone viram roxos | — |

O hover mais comum do sistema é **borda e texto viram roxo**.

### Inputs

```css
width:100%; padding:10px 12px; border:1px solid var(--borda);
border-radius:8px; font-size:13px; font-family:inherit;
color:var(--texto); background:var(--fundo-input);
transition:border-color .12s, background .12s;
```

**Foco**: `outline:none; border-color: var(--roxo); background: var(--fundo-card)`.
O input "acende" no foco — assinatura herdada do Inari, mantida aqui.

Placeholder `--texto-3`. Erro: `border-color:--erro; background:--erro-fundo`.

O foco visível por teclado nunca é removido: elementos sem borda própria usam
`box-shadow: 0 0 0 2px var(--roxo)` no `:focus-visible`.

### Avatar

Círculo com a inicial do nome em branco sobre `--roxo`; com imagem,
`object-fit: cover` e `overflow: hidden`.

Tamanhos: **96px** (grid da sala), 64px (preview no perfil), 28px (chat),
24px (faixa durante compartilhamento de tela).

#### Estados de fala — específico do Concord

```css
.avatar {
  opacity: .55;
  transform: scale(1);
  box-shadow: none;
  transition: opacity .12s, transform .15s, box-shadow .12s;
}
.avatar.falando {
  opacity: 1;
  transform: scale(1.04);
  box-shadow: 0 0 0 3px var(--roxo);
}
.avatar.mutado::after { /* ícone de mic cortado, 20px, canto inferior direito */ }
```

O estado vem de `isSpeaking` do LiveKit. Não há detecção de áudio própria.

### Barra de controles

Contêiner centralizado no rodapé, `bg --fundo-card`, borda superior
`1px solid --borda`, `padding: 12px`, `gap: 10px`.

Botões de 40×40, raio 8px. Estado ativo (mic ligado, tela compartilhando):
`bg --roxo`, ícone branco. Inativo: secundário. Mic mutado: variante perigo.

O botão de microfone é dividido: corpo alterna o mute, seta de 20px abre o
dropdown de dispositivos.

### Dropdown

`position:absolute` colado ao gatilho, `bg --fundo-card`, borda `--borda`,
raio 10px, `--sombra-dropdown`, `padding:6px`, `z-index:10`. Itens `8px 10px`,
raio 6px, hover `--fundo-app`, ativo `--roxo-suave` + texto roxo 600.

### Chat

Painel de 320px, `bg --fundo-card`, `border-left: 1px solid --borda`.
Mensagem: avatar 28px + nome 12px/600 + hora 12px `--texto-2` + corpo 13px.
Mensagens seguidas do mesmo autor em até 5 minutos agrupam, sem repetir
cabeçalho. Input fixo no rodapé do painel.

### Área de vídeo

`bg --video-bg`, raio 12px, `object-fit: contain`. Nome de quem compartilha
numa pílula no canto inferior esquerdo: `bg rgba(0,0,0,.6)`, texto branco 12px,
raio 999px, `4px 10px`.

É a única superfície escura no tema claro.

### Caixas de mensagem

- Info: texto roxo 12px, `bg --roxo-suave-2`, borda `--roxo-borda`, raio 10px.
- Erro: texto `--erro`, `bg --erro-fundo`, borda `--erro-borda`, raio 8px.
- Aviso: texto `--aviso`, `bg --aviso-fundo`, borda `--aviso-borda`, raio 6px.

### Toast

Componente React de verdade (o Inari injetava `<div>` no `body` e a animação
não rodava — aqui não). Fixo no rodapé centralizado, `10px 20px`, raio 10px,
13px/500, `--sombra-toast`, some em 3s, `role="status"`.

```css
@keyframes toastIn { from { opacity:0; transform:translate(-50%,8px) } }
```

### Estado vazio

Bloco `1px dashed --borda`, raio 14px, `bg --fundo-sutil`, texto 13px
`--texto-2`, centralizado. Usado na sala sem ninguém e no chat sem mensagens.

---

## 8. Regras para manter

1. Uma cor de marca só. Tudo que é ativo, selecionado ou em foco é roxo; nada
   mais é colorido.
2. Hierarquia por borda e tom de fundo, nunca por sombra.
3. 13px é o corpo. Não invente tamanhos fora da tabela da seção 4.
4. Transição de 120ms em cor e borda. Nunca anime layout.
5. Todo controle recebe `font-family: inherit`.
6. Desabilitado = cor apagada + `cursor: not-allowed`, nunca `opacity` no
   elemento inteiro.
7. Todo token novo entra **neste arquivo**, nos dois temas, antes de ser usado
   no código.

---

## 9. Escrita da interface

- Sentence case sempre. Nunca Title Case, nunca caixa alta.
- Verbo ativo no botão, e o mesmo verbo no resultado: "Entrar na sala" produz
  "Você entrou".
- Erro explica o que houve e o que fazer, sem pedir desculpa:
  "Imagem acima de 5 MB. Escolha um arquivo menor." — não "Ops! Algo deu
  errado."
- Tela vazia é convite: "Ninguém por aqui ainda. Copie o link e chame a galera."
- Sem emoji na interface.
