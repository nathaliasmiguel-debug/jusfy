# Painel Executivo — Cotações Phone Booth

Painel em Google Apps Script para comparar visualmente as propostas de
cabine acústica (phone booth), com foto de cada modelo, preço, prazo e
selos de recomendação — pensado para leitura rápida em uma reunião com o
CEO.

## O que ele faz

- Lê os dados **direto da planilha** (aba `Cotação Phone Booth`), então
  nunca fica desatualizado — só reabrir o painel depois de editar a planilha.
- Busca automaticamente a **foto do produto** na página de cada fornecedor
  (tag `og:image` do link informado na coluna Observações), com cache de 6h.
- Mostra 4 indicadores no topo: nº de propostas, menor valor total, entrega
  mais rápida e valor médio.
- Cada fornecedor vira um **card** com foto, preço total em destaque,
  detalhamento (cabine + frete + montagem), prazo, se tem cabine preta / mesa
  inclusa, a observação da proposta e um botão para abrir o link original.
- Selos automáticos: **⭐ Recomendado** (melhor equilíbrio preço × prazo),
  **💰 Menor preço** e **⚡ Mais rápido**.
- Alterna para uma **visão em tabela** (mais compacta, melhor para
  imprimir/exportar) e tem busca + ordenação.
- Mostra também as confirmações registradas na planilha (ex.: "todas
  atendem Santa Maria?", "todas dependem de montador?").

## Por que esse formato (e não só a planilha)

Para decisão de CEO, o formato que funciona melhor é **cards visuais com
foto + preço em destaque + selo de recomendação**, apoiados por uma tabela
para quem quiser os números crus. Isso porque:

- **Fotos** tiram a ambiguidade — "cabine preta com mesa" em texto não
  comunica o mesmo que ver o produto.
- **Um número por card** (valor total) e não uma planilha densa reduz o
  tempo de leitura a segundos.
- **Selos** ("Recomendado", "Menor preço") fazem o trabalho de análise
  antes da reunião, não durante.
- A **tabela continua disponível** como camada de verificação para quem
  quiser conferir os componentes do preço (cabine/frete/montagem).

## Como instalar

1. Abra (ou importe) a planilha `Fornecedores_Phone_Booth.xlsx` no Google
   Sheets, mantendo a aba com o nome **`Cotação Phone Booth`** e as colunas
   originais (Fornecedor, Modelo, Valor da cabine (R$), Frete (R$),
   Montagem (R$), Valor total (R$), Prazo (dias), Cabine Preta?, Com mesa
   inclusa?, Observações).
2. No Sheets, vá em **Extensões → Apps Script**.
3. Apague o `Code.gs` padrão e crie os 3 arquivos deste diretório com os
   mesmos nomes e conteúdo: `Code.gs`, `Dashboard.html` e (nas
   configurações do projeto) cole `appsscript.json` no manifesto.
   - Alternativa recomendada: instale o [`clasp`](https://github.com/google/clasp)
     e rode `clasp push` a partir desta pasta, apontando para o script
     vinculado à planilha.
4. Salve, volte para a planilha e recarregue a página.
5. Um novo menu **📊 Painel Executivo** aparece na barra de menus →
   **Abrir painel de fornecedores**.

Na primeira abertura, o script vai pedir autorização (ele acessa a
planilha e busca as páginas dos fornecedores para pegar a foto do
produto — é o `UrlFetchApp`, só leitura, nenhum dado é enviado para fora).

### Publicar como link (opcional)

Se quiser um link para abrir o painel fora do Sheets (ex.: enviar para o
CEO por e-mail), use **Implantar → Nova implantação → Aplicativo da Web**
no editor do Apps Script. O `doGet` já está pronto para isso.

## Se alguma foto não aparecer

Alguns sites de fornecedor bloqueiam acesso automatizado ou não têm uma
imagem de destaque (`og:image`) na página do link. Nesses casos o card
mostra um placeholder com o link "Ver produto →" para abrir a página
manualmente. Use **📊 Painel Executivo → 🔄 Atualizar fotos (limpar
cache)** para forçar uma nova tentativa de busca depois de checar/ajustar
o link na planilha.
