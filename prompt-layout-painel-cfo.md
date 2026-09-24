# Prompt: padrão visual dos painéis Jusfy (baseado no Painel CFO)

> Cole o texto abaixo no início de qualquer pedido de criação ou ajuste de painel.
> Ele define **só layout e design**: o conteúdo, os números e as abas de cada painel são de cada área.

---

Construa este painel seguindo exatamente o padrão visual do **Painel CFO da Jusfy**. Não invente outro estilo, outras cores ou outra fonte. Tudo o que está abaixo é obrigatório.

## 1. Fonte

- Use **Poppins** em tudo: textos, botões, selects, inputs, tabelas e textos dentro de gráficos SVG.
- Carregue a fonte assim: `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap">`
- Fallback: `font-family:'Poppins',Arial,sans-serif`. Botões, inputs e selects usam `font-family:inherit`.
- Use só os pesos 400 (texto corrido), 500 (itens de menu e nomes em lista), 600 (títulos de card, botões e labels) e 700 (título da página, valores de KPI e linha de total).
- Números sempre com `font-variant-numeric:tabular-nums`, para os dígitos ficarem alinhados nas colunas.

## 2. Paleta de cores (tokens CSS, sem alterar)

```css
:root{
  --navy:#12395E;       /* cor principal: títulos, valores, botão primário, cards escuros */
  --ink:#1F2933;        /* texto padrão */
  --paper:#F7F9FB;      /* fundo da página */
  --card:#FFFFFF;       /* fundo dos cards */
  --accent:#2C5F8E;     /* links, destaques, borda de foco */
  --accent-soft:#EAF1F7;/* fundo do item de menu ativo, botões secundários, cabeçalho de tabela no chat */
  --line:#DDE4EA;       /* todas as bordas e divisórias */
  --muted:#6B7A88;      /* textos secundários, labels, legendas */
  --good:#2F6F55;  --good-soft:#E8F1ED;  /* positivo / redução de custo */
  --bad:#8C3B34;   --bad-soft:#F6EAE8;   /* negativo / aumento de custo / erro */
  --warn-soft:#F3EEE2;                   /* avisos */
  --tab-bg:#EDF1F5;                      /* fundo do seletor segmentado e trilho das barras */
  /* série de gráficos, sempre nesta ordem */
  --c1:#2C5F8E; --c2:#5B8CA8; --c3:#8AA9BE; --c4:#4A6B84; --c5:#9FB6C6;
}
```

- Tom geral: azul-marinho sóbrio sobre fundo cinza-azulado bem claro. Nada de cores saturadas, gradientes, sombras fortes ou modo escuro.
- Se houver mais de 5 séries no gráfico, continue nesta ordem: `#B37FA8`, `#D97E7E`, `#7EA8D9`, `#A0A05B`.
- Status em tabelas: verde `#2E7D6B` = ok, âmbar `#C98A2B` = atenção, vermelho `#B03A3A` = problema, cinza `#8494A6` = valor de referência.
- Tags: **Real** usa texto `--good` sobre fundo `--good-soft`. **Reforecast** usa texto `#A15C00` sobre fundo `#FDF0DC`. Fonte 9px, peso 700, raio 5px.
- Em custo, subir é ruim e cair é bom: aumento em `--bad` e redução em `--good`.

## 3. Estrutura da página (de cima para baixo)

1. **Contêiner** centralizado: `max-width:1320px; margin:0 auto; padding:26px 22px 70px`. Fundo `--paper`.
2. **Topbar** (flex, espaço entre os lados, alinhada embaixo, `margin-bottom:24px`):
   - **Esquerda:** logo "jus**fy**" em SVG com texto Poppins 700 (72×34px). "jus" em `--navy` e "fy" em verde `#3FBF95`. Ao lado, o título `h1` (24px, 700, `--navy`) e, abaixo dele, o subtítulo (13px, `--muted`) no formato: *Jusfy Serviços de Internet Ltda · Valores em BRL · Atualizado em DD/MM/AAAA*.
   - **Direita:** botão "Baixar CSV (aba atual)" no estilo `segbtn`, com fundo branco e borda `--line`.
3. **Statusbar:** texto de 11px em `--muted`, alinhado à direita, com o status do carregamento.
4. **Layout em 2 colunas:** `display:grid; grid-template-columns:212px 1fr; gap:26px`.
   - **Coluna esquerda:** menu lateral de abas (seção 4).
   - **Coluna direita (`main`):** nesta ordem, ① barra de controles, ② barra de pergunta, ③ conteúdo da aba ativa.
5. **Barra de controles (`ctrlbar`):** uma linha de grupos. Cada grupo é uma pílula branca com borda `--line`, raio 9px e padding `6px 10px`. Dentro de cada pílula vai um label (10.5px, MAIÚSCULAS, `letter-spacing:.06em`, 600, `--muted`) e um select sem borda (12.5px, 600, `--navy`). Grupos padrão: **Moeda** (R$ / US$ / €) e **Idioma** (Português / English / Español).
6. **Barra de pergunta (`askbar`):** card branco com borda `--line`, raio 11px e `margin-bottom:18px`. Leva, nesta ordem: avatar redondo navy (30px), input sem borda (13px) com placeholder "Pergunte qualquer coisa sobre os números — ex.: …" e botão "Perguntar" (fundo `--navy`, texto branco, 12px, 600, raio 8px).
7. **Rodapé:** 11px, `--muted`, centralizado, `margin-top:24px`.

## 4. Abas: menu lateral esquerdo

- **Posição:** coluna fixa de 212px à esquerda, `position:sticky; top:20px`, com rolagem própria (`max-height:calc(100vh - 40px)`). Card branco, borda `--line`, raio 12px, padding 8px. Scrollbar fina na cor `--accent`.
- **Não use abas horizontais no topo** para navegar entre as páginas. A navegação principal é sempre o menu lateral.
- **Organização em grupos numerados e recolhíveis:**
  - **Título do grupo (`navsep`):** 10px, MAIÚSCULAS, `letter-spacing:.09em`, 600, `--muted`, opacidade .75, padding `13px 13px 5px`. Leva uma seta ▾ que gira -90° quando o grupo está fechado. Clicar no título recolhe ou expande o grupo.
  - **Item (`navbtn`):** largura total, alinhado à esquerda, padding `9px 13px`, raio 8px, 12.5px, peso 500, cor `--muted`.
    - Hover: fundo `--paper`, texto `--navy`.
    - **Ativo:** fundo `--accent-soft`, texto `--navy`, peso 600.
  - **Badge de contagem** (ex.: comentários pendentes): pílula `--bad` com texto branco, 10px, raio 9px.
- **Ordem padrão das abas** (modelo do CFO; cada painel troca os nomes pelos da sua área e mantém a lógica):
  1. **Chat com [assistente]**: primeiro item, fora de grupo.
  2. **Resumo**: grupo próprio, é a aba aberta por padrão.
  3. **1. Gerencial**: P&L · Dashboard por área · Gráficos · Cenários · Comentários
  4. **2. Contábil**: DRE contábil · Balanço · Conciliação de ajustes
  5. **3. People**: Folha de pagamento · Headcount · Distratos · Cadastro
  6. **4. Fornecedores**: Fornecedores · Ativos
  7. **5. Jurídico**: Jurídico
  8. **6. Administração**: Permissões. Fica oculto e só aparece para administradores.

  No total são 18 abas em 6 grupos numerados, mais Chat e Resumo. Em outros painéis, mantenha: **Chat no topo → Resumo → grupos numerados "1. …", "2. …" → Administração por último e oculta**.
- **Sub-abas dentro de uma página** (ex.: Visão mês / Visão acumulada, ou Base / Otimista / Pessimista): use o **seletor segmentado (`segctl`)** dentro do card, nunca um segundo menu.
  - Contêiner: fundo `--tab-bg`, raio 10px, padding 3px, gap 2px.
  - Botão (`segbtn`): transparente, padding `8px 16px`, raio 8px, 12.5px, 600, `--muted`.
  - Ativo: fundo branco, texto `--navy`, `box-shadow:0 1px 2px rgba(0,0,0,.08)`.
- **Responsivo:** abaixo de 900px o layout vira 1 coluna, e o menu fica estático e horizontal com quebra de linha.

## 5. Componentes do conteúdo

- **Card padrão:** fundo branco, borda `1px solid --line`, raio 14px, padding 22px, `margin-bottom:18px`. Título `h2` com 15px, 600 e `--navy`. Logo abaixo, a dica (`hint`) em 12px, `--muted`, `margin-bottom:16px`.
- **Card de destaque:** borda esquerda de `3px solid var(--accent)`.
- **Linha de KPIs:** grid de 3 colunas com gap de 14px. Cada KPI é um card com raio 14px e padding `18px 20px`:
  - Label: 11.5px, MAIÚSCULAS, `--muted`.
  - Valor: 26px, 700, `--navy`.
  - Variação: 12px, 600, em `--good` ou `--bad`.
- **Página de Resumo** (é a vitrine do painel). Card com padding `30px 34px` e, dentro, nesta ordem:
  - Sobretítulo "RESULTADOS": 11px, maiúsculas, `--muted`.
  - Mês de referência: 17px, 600.
  - Título: 26px, 600, `--navy`.
  - Grid de 3 **cards escuros**: fundo `--navy`, texto branco, raio 10px. Rótulo em 11.5px `#C5D6E4`, valor em 25px 600 e subtexto em 11px `#A9C1D4`.
  - Um **card escuro largo** com barras horizontais: trilho `rgba(255,255,255,.16)`, barra `#7FA9C9`, 9px de altura.
  - Nota de rodapé centralizada: 11px, `--muted`.
- **Seletor de mês (`mesbar`):** label de 12px, 600, `--muted`, e select branco com borda `--line`, raio 8px, 13px, 600, `--navy`. Fica no topo da aba, acima dos cards.
- **Tabelas:**
  - Largura 100%, 12.5px.
  - Cabeçalho: 10px, MAIÚSCULAS, `--muted`, alinhado à direita (a 1ª coluna à esquerda), com borda inferior `--line`.
  - Células: padding `7px 8px`, divisória `--line`, números à direita e sem quebra de linha. A 1ª coluna fica à esquerda, com peso 500.
  - Linha de total: 700, `--navy` e borda superior de 2px.
  - Linha de variação %: 11px, itálico, `--muted`.
  - Tabela larga fica dentro de `overflow-x:auto`, com uma **barra de rolagem espelhada acima** dela e a 1ª coluna fixa (`position:sticky; left:0`).
- **Botões:**
  - Secundário: texto `--accent` sobre fundo `--accent-soft`.
  - Primário: texto branco sobre fundo `--navy`.
  - Perigo: texto `--bad` sobre fundo `--bad-soft`.
  - Todos: 11.5px, 600, raio 7px, padding `7px 13px`, sem borda.
- **Avisos:** fundo `--warn-soft`, borda `--line`, raio 8px, 12px.
- **Erros:** fundo `--bad-soft`, texto `--bad`.
- **Chat:**
  - Mensagem do usuário: navy com texto branco, alinhada à direita.
  - Resposta: card branco com borda, alinhada à esquerda.
  - Raio 12px, 13px, `line-height:1.55`.
  - Sugestões em pílulas `--accent-soft` com raio 16px.
- **Tooltip:** fundo `--navy`, texto branco, 11.5px, 600, raio 7px, sombra `0 2px 8px rgba(0,0,0,.18)`.

## 6. Gráficos

- Gráficos em **SVG próprio**, com textos em Poppins e cor `--ink`.
- Cores das séries: `--c1` a `--c5` nesta ordem. Cada área ou categoria mantém a **mesma cor em todos os gráficos** do painel.
- **Real:** linha contínua de 2.2 a 2.4px. **Forecast/reforecast:** mesma cor, tracejada (`stroke-dasharray:5,4`). Total geral em `--navy`.
- **Pizza:** fatias separadas por um traço branco (`--card`). A legenda mostra o percentual.
- **Legenda:** bolinhas de 9px e texto de 11.5px em `--muted`, acima do gráfico.
- **Barras de composição:** trilho `--tab-bg` de 8px, raio 5px, barra na cor da área.

## 7. Formato de números

- **Real:** `R$ 1.234.567`, com separador pt-BR e sem centavos nos painéis gerenciais.
- **Outras moedas:** `US$` e `€` no padrão en-US. A cotação usada aparece ao lado do seletor.
- **Valor ausente:** `–`.

## 8. O que NÃO fazer

- Não usar outra fonte além da Poppins.
- Não usar cores fora da paleta.
- Não usar gradientes, sombras fortes, emojis nos títulos ou abas no topo da página.
- Não misturar pesos de fonte fora de 400, 500, 600 e 700.
- Não usar mais de 3 KPIs por linha.
- Não mudar o raio dos cantos: cards 14px, menu 12px, botões e selects 7 a 9px.
