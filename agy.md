# Melhorias e Correções — Antigravity (Fase 3: Áudio)

Registro das melhorias e diagnósticos implementados na Fase 3 do Concord.

---

## 1. Responsividade na Detecção de Fala (Anel Roxo do Avatar)

### Problema
O anel roxo indicativo de fala no avatar demorava consideravelmente para acender ao começar a falar e para apagar após parar de falar.

### Causa
No arquivo `livekit.yaml`, o bloco de configuração de `audio` estava ausente. Quando omitido, o LiveKit Server utiliza os parâmetros padrão:
- `update_interval: 500` (500 ms)
- `smooth_intervals: 4` (amostragem média em 4 intervalos)

Isso gerava uma janela de até 2.000 ms (2 segundos) para o servidor confirmar a transição de estado e emitir os eventos de `ActiveSpeakersChanged`.

### Correção
- Configurado o bloco `audio` em `livekit.yaml`:
  ```yaml
  audio:
    update_interval: 200
    smooth_intervals: 2
  ```
- **Resultado:** A latência de detecção caiu para ~300ms–400ms, proporcionando feedback visual imediato ao falar.

---

## 2. Prevenção de Mute Involuntário e Quedas de Áudio (React Strict Mode & Referências)

### Problema
Em determinados momentos durante o uso e carregamento da sala, o microfone mutava sozinho ou despublicava a faixa de áudio.

### Causas
1. **Concorrência no StrictMode (`app/sala/page.tsx`):**
   No ambiente de desenvolvimento do Next.js, o React StrictMode monta e desmonta componentes duas vezes. O `useEffect` de busca de sessão e emissão de token (`/api/token`) não possuía mecanismo de cancelamento (`cleanup`). Isso gerava duas requisições simultâneas; a segunda resposta sobrescrevia o `token` no estado, forçando o componente `<LiveKitRoom>` a realizar uma reconexão interna, o que despublicava e resetava as faixas de áudio ativas.

2. **Instabilidade de Referência do Objeto de Áudio (`Sala.tsx`):**
   O objeto com as opções de captura (`{ echoCancellation: true, noiseSuppression: true, autoGainControl: true }`) era declarado inline no JSX. A cada re-render do componente `Sala`, uma nova referência de objeto era criada, ativando listeners internos de dependência do `@livekit/components-react`.

### Correções
- **Fonte única de constantes (`lib/constantes.ts`):** Criada a constante `OPCOES_AUDIO` imutável.
- **`app/sala/page.tsx`:** Adicionada flag `cancelado` no cleanup do `useEffect` para ignorar respostas obsoletas durante desmontagem/remontagem.
- **`components/sala/Sala.tsx`:** Passagem da constante estável `audio={OPCOES_AUDIO}` para o `<LiveKitRoom>`.
- **`components/sala/BarraControles.tsx`:** Configurado `captureOptions: OPCOES_AUDIO` no hook `useTrackToggle` para garantir que desmutar o microfone reaplique consistentemente as opções de captura do sistema.
- **`components/sala/Avatar.tsx`:** Garantida a condição `falando && !isMuted` para que participantes com microfone mutado nunca exibam o anel de fala por falsos positivos.

---

## 3. Erro de Conexão WebRTC (`ConnectionError: could not establish pc connection`)

### Problema
O app conectava ao WebSocket de sinalização do LiveKit, mas falhava com `ConnectionError: could not establish pc connection` ao tentar estabelecer a mídia WebRTC (ICE). Como a conexão não concluía, participantes na aba anônima e na aba normal não conseguiam se ver na mesma sala.

### Causas
1. **`use_external_ip: true` com NAT Loopback:**
   No `livekit.yaml`, estava habilitado `use_external_ip: true`. Ao iniciar, o LiveKit descobria o IP público (WAN) do roteador via STUN e enviava candidatos ICE com esse IP público. Quando o navegador local tentava se conectar ao próprio IP público por UDP (portas 50000–50100), o roteador doméstico descartava os pacotes por falta de suporte a NAT Hairpinning/Loopback.
2. **IP interno do Docker Bridge:**
   Ao rodar via Docker sem configurar `node_ip`, o container anunciava o IP da bridge interna (`172.19.0.2`), que não é roteável diretamente pelo navegador no host Windows.
3. **Container antigo rodando em paralelo:**
   Havia um container anterior (`happy_tesla`) rodando na porta 7880 com a flag `--dev` sem o mapeamento da faixa UDP 50000–50100.

### Correções
- **`livekit.yaml`:** 
  - Adicionado `node_ip: 127.0.0.1` dentro do bloco `rtc`.
  - Definido `use_external_ip: false`.
- **Docker:** Finalizado o container órfão e inicializado o container oficial gerenciado via `docker compose up -d` com todas as portas UDP 50000–50100 mapeadas corretamente.
- **Resultado:** A conexão WebRTC (PeerConnection) passou a ser estabelecida localmente via `127.0.0.1` em milissegundos, permitindo que a aba anônima e a aba normal entrem na sala `geral` e visualizem seus respectivos avatares em tempo real.

---

## 4. Implementação da Fase 4 — Header e Link do Ngrok

### O que foi feito:
1. **Descoberta do Ngrok (`lib/ngrok.ts` & `app/api/ngrok/route.ts`):**
   - Criada a função `obterStatusNgrok()` com timeout estrito de 1s via `AbortSignal.timeout(1000)` consultando `http://127.0.0.1:4040/api/tunnels`.
   - Rota `GET /api/ngrok` dinâmica que retorna `{ estado: 'ativo', url: '...' }` ou `{ estado: 'ausente' }`.

2. **Componente Header (`components/header/Header.tsx` & `.module.css`):**
   - Altura de 52px com fundo `--header` (`#2d1f3d`) fixo/sticky no topo.
   - Logo CONCORD com tipografia conforme Design System (15px, peso 700, 2px letter-spacing).
   - **Privacidade Host vs Convidado:**
     - **Convidados (`ehHost: false`):** O bloco do Ngrok é totalmente oculto.
     - **Host (`ehHost: true`):** Exibe a URL pública e botão de cópia com um botão de alternância rápida de visibilidade (ícone de olho) para ocultar/exibir o link durante a sessão.
     - **Ngrok ausente (Host):** Exibe a instrução `"ngrok não detectado — rode ngrok http 3000 para gerar o link."`
   - Botão de alternância de tema (Sol/Lua) no topo direito, alternando `data-tema` no `<html>` e gravando em `localStorage` sob `concord:tema`.


3. **Integração Global no Layout (`app/layout.tsx` & `styles/globals.css`):**
   - Inserido `<Header />` na raiz da aplicação.
   - Ajustadas as alturas das páginas (`app/perfil/page.module.css` e `components/sala/Sala.module.css`) com `flex: 1` para eliminar barras de rolagem duplicadas.

---

## 5. Implementação da Fase 5 — Compartilhamento de Tela

### O que foi feito:
1. **Configuração de Captura e Publicação (`lib/constantes.ts`):**
   - Definidas as constantes `COMPARTILHAMENTO_SCREEN_CAPTURE` (`contentHint: 'detail'`, até 1440p @ 30fps) e `COMPARTILHAMENTO_PUBLISH_OPTIONS` (codec VP9 com fallback VP8, teto de 10 Mbps via `COMPARTILHAMENTO_BITRATE_MAX`, sem simulcast).

2. **Trava de Compartilhamento Exclusivo (`components/sala/BarraControles.tsx`):**
   - Adicionado botão de tela (40×40px) com ícone SVG `IconeTela`.
   - Se outro participante estiver apresentando, o botão fica desabilitado com tooltip descritivo: `"{Nome} está compartilhando a tela."`.
   - Se o próprio usuário estiver apresentando, o botão fica roxo ativo e o clique encerra a transmissão.

3. **Layout Alternativo de Apresentação (`components/sala/Sala.tsx`):**
   - Transição dinâmica entre o modo Grid (sem tela) e o modo Apresentação (com tela).
   - **`components/sala/FaixaAvatares.tsx`:** Faixa horizontal compacta no topo com avatares de 24px, anéis de fala responsivos e nomes dos participantes.
   - **`components/sala/TelaCompartilhada.tsx`:** Reprodutor de vídeo com fundo `--video-bg` (`#1a1820`), raio de 12px, `object-fit: contain` e pílula estilizada com o nome do apresentador no canto inferior esquerdo.

---

## 6. Diagnósticos e Correções: Firefox WebRTC e Dimensionamento de Vídeo

### 1. Espelhamento Infinito e Vídeo Cortado
- **Espelhamento Infinito:** Ocorre quando se compartilha a tela inteira contendo a própria janela do Concord em exibição (efeito "espelho no espelho"). Para testar a nitidez sem loop visual, deve-se compartilhar uma janela de outro aplicativo (ex: VS Code, Bloco de notas, navegador com outra aba aberta).
- **Vídeo Cortado no Topo:** Em containers Flexbox, elementos `<video>` com dimensões nativas 1440p expandem a altura intrínseca além da viewport se não possuírem limites estritos de `min-height: 0` e `max-height: 100%`.
- **Correção:** Ajustado `TelaCompartilhada.module.css` para `min-height: 0; min-width: 0;` e `.video` com `max-width: 100%; max-height: 100%; width: auto; height: auto; object-fit: contain;`, além de travar a altura útil em `Sala.module.css` em `height: calc(100vh - 52px)`.

### 2. Firefox WebRTC e Microfone (`ConnectionError: could not establish pc connection`)
- **Causa:** O motor WebRTC do Firefox apresenta instabilidade com a estratégia de conexão única (`singlePeerConnection: true`) e falhava ao receber `backupCodec` duplicado para telas. Além disso, no Windows, o driver de áudio bloqueia a segunda aba de obter o microfone (`NotReadableError` / `DeviceInUse`).
- **Correção:** Em `lib/constantes.ts`, removemos o `backupCodec` mantendo apenas 1 codificador único de alta performance (VP9 no Chrome, VP8 no Firefox a 10 Mbps). Em `components/sala/Sala.tsx`, configuramos `singlePeerConnection: false` (canais publisher/subscriber dedicados e estáveis), `peerConnectionTimeout: 30_000` (30s para handshake ICE) e `audioCaptureDefaults: OPCOES_AUDIO` com `dynacast: true`.

---

## 7. Funcionalidade Extra: Avatar em GIF Animado por Voz (Voice-Activated GIF)

### O que foi feito:
1. **Suporte a GIF no Upload (`lib/imagem.ts` & `app/api/participantes/route.ts`):**
   - Adicionado suporte ao formato `image/gif` com teto de até 15 MB (`AVATAR_TAMANHO_MAX_SERVIDOR` e `AVATAR_TAMANHO_MAX_CLIENTE`).
   - GIFs animados preservam todas as suas camadas de frames sem re-encode com perda.
   - Imagens estáticas (PNG, JPEG, WebP) continuam sendo recortadas e otimizadas em WebP 256×256.
   - Limpeza automática de mensagens de erro na interface ao selecionar um arquivo válido.

2. **Congelamento Inteligente no Frame 0 (`components/ui/Avatar.tsx`):**
   - Ao carregar a imagem do avatar, um `<canvas>` 2D em memória captura o frame inicial (frame 0).
   - **Em Silêncio / Mutado (`animar: false`):** O avatar exibe o primeiro frame estático perfeitamente congelado.
   - **Falando (`animar: true`):** Quando a detecção de voz do LiveKit ativa (`falando && !isMuted`), o componente exibe a tag `<img>` animada rodando o GIF em tempo real.
   - **Transição Instantânea:** Como ambos os elementos estão prontos no cliente, a transição entre o estado congelado e o GIF em movimento é imediata.

3. **Integração nas Visualizações (`components/sala/Avatar.tsx` & `FaixaAvatares.tsx`):**
   - Aplicado tanto no Grid principal de 96px quanto na faixa superior de 24px durante o compartilhamento de tela.
   - Preview no seletor de foto do perfil com animação contínua para conferência do usuário.

---

## 8. Correção: Envio do Campo `nome` no FormData do Perfil

### Problema
Ao tentar salvar o perfil no `/perfil`, a API retornava erro `HTTP 400: Nome obrigatório.` mesmo com o campo de nome devidamente preenchido.

### Causa
Na função `enviar()` de `app/perfil/page.tsx`, a linha que anexava o nome ao `FormData` (`dados.set('nome', ...)`) havia sido omitida durante a refatoração do nome de arquivo dinâmico (`avatar.gif` / `avatar.webp`).

### Correção
Restaurado `dados.set('nome', nome.trim())` no `FormData` antes do envio para `/api/participantes`.

---

## 9. Correção: Revalidação de Cache de Avatar e Renderização de Imagens em Cache

### Problema
Ao trocar a foto de perfil por um novo arquivo (ou GIF) e entrar na sala, o avatar continuava exibindo a imagem antiga.

### Causas
1. **Cache HTTP Agressivo no Navegador:** Na rota `app/api/participantes/[id]/avatar/route.ts`, o cabeçalho `Cache-Control` estava configurado com `max-age=31536000` (1 ano). Como a URL (`/api/participantes/[id]/avatar`) não mudava, o navegador utilizava a imagem antiga salva no disco/memória local sem consultar o servidor.
2. **Ciclo de Vida do `onLoad` em Imagens em Cache:** No componente `Avatar.tsx`, quando a imagem já estava carregada no cache do navegador antes do listener `onLoad` ser registrado, o evento não disparava novamente, mantendo o canvas em estado não-inicializado.

### Correções
1. Alterado `Cache-Control` na rota do avatar para `no-store, no-cache, must-revalidate`. O navegador agora revalida com `ETag` (que contém o timestamp `vistoEm` atualizado no banco SQLite), recebendo a nova foto imediatamente ao trocar de perfil.
2. No `Avatar.tsx`, adicionada checagem no `useEffect` para `if (img.complete && img.naturalWidth > 0) desenharPrimeiroFrame()`, além de manter a tag `<img>` visível como fallback até a conclusão do desenho do frame no canvas.
3. Adicionado timestamp de sessão `?t=${participant.joinedAt}` nas tags de imagem para invalidar o cache de memória do Chrome de forma determinística.

---

## 10. Melhorias na Apresentação: Modo Tela Cheia e Eliminação de Scroll Vertical

### O que foi feito:
1. **Eliminação de Rolagem Vertical:**
   - Ajustadas as margens em `TelaCompartilhada.module.css` (`margin: 8px 16px;`) e o padding do rodapé (`trocar: 4px;`) para que o reprodutor de vídeo e a faixa superior caibam 100% no espaço visível sem ativar barra de rolagem vertical no navegador.
   - Configurado `.shell-global` com `height: 100vh; height: 100dvh; overflow: hidden;` e `.shell` com `height: 100%;`.
2. **Botão de Tela Cheia (Fullscreen):**
   - Adicionado botão no canto superior direito do vídeo com ícones `IconeMaximizar` e `IconeMinimizar`.
   - Adicionado atalho de **clique duplo no vídeo** para alternar tela cheia instantaneamente.
   - Suporte a `fullscreenchange` para sincronizar o estado visual do botão ao entrar ou sair do modo tela cheia pelo teclado (`Esc`).

---

## 11. Expansão e Escala Inteligente de Vídeo na Tela Cheia

### O que foi feito:
- Em `TelaCompartilhada.module.css`, configurado `width: 100%; height: 100%; object-fit: contain;` e `.container:fullscreen .video { width: 100vw; height: 100vh; }`.
---

## 12. Implementação da Fase 6 — Seletor de Microfone

### O que foi feito:
1. **Botão Dividido (Split Button):**
   - Criado o componente `components/sala/SeletorMicrofone.tsx` e `SeletorMicrofone.module.css`.
   - **Corpo (40×40px):** Alterna mute/desmute do microfone com feedback visual imediato (`IconeMic` / `IconeMicCortado`).
   - **Seta (20×40px):** Abre/fecha o menu dropdown de dispositivos com ícones `IconeChevronCima` e `IconeChevronBaixo`.

2. **Troca a Quente de Dispositivos (`useMediaDeviceSelect`):**
   - Enumera os microfones disponíveis no sistema com permissões ativas.
   - Permite alternar o dispositivo ativo em tempo real durante a chamada sem recarregar a página e sem reconectar na sala.

3. **Persistência de Preferência:**
   - Salva o `deviceId` selecionado em `localStorage` sob `concord:mic` e restaura automaticamente o microfone preferido nas sessões seguintes.

4. **Acessibilidade e Usabilidade:**
   - Fechamento automático do menu ao clicar fora (*click outside*) ou ao pressionar a tecla `Escape`.
   - Marcação com `IconeCheck` e fundo `--roxo-suave` no microfone ativo no momento.



