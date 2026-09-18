/**
 * Painel Executivo — Cotações Cabine Acústica (Phone Booth)
 *
 * Lê os dados diretamente da aba "Cotação Phone Booth" da planilha à qual
 * este script está vinculado e monta um painel visual (cards com foto,
 * comparação de preços e prazos) pensado para leitura rápida por um CEO.
 */

var SHEET_NAME = 'Cotação Phone Booth';
var HEADER_LABEL = 'Fornecedor';
var IMAGE_CACHE_SECONDS = 21600; // 6h, limite máximo do CacheService

// ---------------------------------------------------------------------------
// Menu / entradas do painel
// ---------------------------------------------------------------------------

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('📊 Painel Executivo')
    .addItem('Abrir painel de fornecedores', 'showDashboard')
    .addItem('🔄 Atualizar fotos (limpar cache)', 'clearImageCache')
    .addToUi();
}

function showDashboard() {
  var html = HtmlService.createTemplateFromFile('Dashboard')
    .evaluate()
    .setWidth(1440)
    .setHeight(920);
  SpreadsheetApp.getUi().showModalDialog(html, 'Painel Executivo — Cabine Acústica (Phone Booth)');
}

/** Permite publicar o mesmo painel como Web App (Implantar > Nova implantação). */
function doGet(e) {
  return HtmlService.createTemplateFromFile('Dashboard')
    .evaluate()
    .setTitle('Painel Executivo — Cabine Acústica (Phone Booth)')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function clearImageCache() {
  CacheService.getScriptCache().removeAll(
    getSuppliers_().map(function (s) { return imageCacheKey_(s.link); }).filter(Boolean)
  );
  SpreadsheetApp.getActiveSpreadsheet().toast('Cache de fotos limpo. Reabra o painel para buscar as fotos novamente.', 'Painel Executivo');
}

// ---------------------------------------------------------------------------
// Dados para o painel (chamado pelo cliente via google.script.run)
// ---------------------------------------------------------------------------

function getDashboardData() {
  var suppliers = getSuppliers_();

  suppliers.forEach(function (s) {
    s.imagem = s.link ? getPreviewImage_(s.link) : null;
  });

  var withTotal = suppliers.filter(function (s) { return s.valorTotal > 0; });
  var withPrazo = suppliers.filter(function (s) { return s.prazoDias !== null; });

  if (withTotal.length) {
    var minTotal = Math.min.apply(null, withTotal.map(function (s) { return s.valorTotal; }));
    var priceRanked = withTotal.slice().sort(function (a, b) { return a.valorTotal - b.valorTotal; });
    priceRanked.forEach(function (s, i) { s.priceRank = i + 1; });
    suppliers.forEach(function (s) { if (s.valorTotal === minTotal) s.badgeMenorPreco = true; });
  }

  if (withPrazo.length) {
    var minPrazo = Math.min.apply(null, withPrazo.map(function (s) { return s.prazoDias; }));
    var prazoRanked = withPrazo.slice().sort(function (a, b) { return a.prazoDias - b.prazoDias; });
    prazoRanked.forEach(function (s, i) { s.prazoRank = i + 1; });
    suppliers.forEach(function (s) { if (s.prazoDias === minPrazo) s.badgeMaisRapido = true; });
  }

  // Melhor custo-benefício = menor soma de rank de preço + rank de prazo
  // (só entre fornecedores com preço E prazo conhecidos)
  var scored = suppliers.filter(function (s) { return s.priceRank && s.prazoRank; });
  if (scored.length) {
    scored.forEach(function (s) { s.score = s.priceRank + s.prazoRank; });
    var bestScore = Math.min.apply(null, scored.map(function (s) { return s.score; }));
    var bestCandidates = scored.filter(function (s) { return s.score === bestScore; });
    // desempate: menor preço total
    bestCandidates.sort(function (a, b) { return a.valorTotal - b.valorTotal; });
    bestCandidates[0].badgeRecomendado = true;
  }

  var summary = {
    total: suppliers.length,
    valorMin: withTotal.length ? Math.min.apply(null, withTotal.map(function (s) { return s.valorTotal; })) : null,
    valorMax: withTotal.length ? Math.max.apply(null, withTotal.map(function (s) { return s.valorTotal; })) : null,
    valorMedio: withTotal.length ? withTotal.reduce(function (a, s) { return a + s.valorTotal; }, 0) / withTotal.length : null,
    prazoMin: withPrazo.length ? Math.min.apply(null, withPrazo.map(function (s) { return s.prazoDias; })) : null,
    atualizadoEm: new Date().toISOString()
  };

  return {
    suppliers: suppliers,
    summary: summary,
    notes: getNotes_(),
    sheetName: SHEET_NAME,
    sheetUrl: SpreadsheetApp.getActiveSpreadsheet().getUrl()
  };
}

// ---------------------------------------------------------------------------
// Leitura da planilha
// ---------------------------------------------------------------------------

function getSuppliers_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];
  var data = sheet.getDataRange().getValues();

  var headerRow = -1;
  for (var i = 0; i < data.length; i++) {
    if (String(data[i][0]).trim() === HEADER_LABEL) { headerRow = i; break; }
  }
  if (headerRow === -1) {
    throw new Error('Não encontrei a linha de cabeçalho ("' + HEADER_LABEL + '") na aba "' + sheet.getName() + '".');
  }

  var headers = data[headerRow].map(function (h) { return String(h || '').trim(); });
  var col = function (label) { return headers.indexOf(label); };
  var idx = {
    fornecedor: col('Fornecedor'),
    modelo: col('Modelo'),
    valorCabine: col('Valor da cabine (R$)'),
    frete: col('Frete (R$)'),
    montagem: col('Montagem (R$)'),
    valorTotal: col('Valor total (R$)'),
    prazo: col('Prazo (dias)'),
    cabinePreta: col('Cabine Preta?'),
    mesaInclusa: col('Com mesa inclusa?'),
    observacoes: col('Observações')
  };

  var suppliers = [];
  for (var r = headerRow + 1; r < data.length; r++) {
    var row = data[r];
    var fornecedor = row[idx.fornecedor];
    if (!fornecedor || String(fornecedor).trim() === '') break; // fim do bloco de propostas

    var observacoes = idx.observacoes >= 0 ? String(row[idx.observacoes] || '').trim() : '';
    var link = extractLink_(observacoes);

    suppliers.push({
      id: r + 1,
      fornecedor: String(fornecedor).trim(),
      modelo: idx.modelo >= 0 ? String(row[idx.modelo] || '').trim() : '',
      valorCabine: toNumber_(row[idx.valorCabine]),
      frete: toNumber_(row[idx.frete]),
      montagem: toNumber_(row[idx.montagem]),
      valorTotal: toNumber_(row[idx.valorTotal]),
      prazoTexto: idx.prazo >= 0 ? String(row[idx.prazo] || '').trim() : '',
      prazoDias: parsePrazoDias_(idx.prazo >= 0 ? row[idx.prazo] : ''),
      cabinePreta: idx.cabinePreta >= 0 ? String(row[idx.cabinePreta] || '').trim() : '',
      mesaInclusa: idx.mesaInclusa >= 0 ? String(row[idx.mesaInclusa] || '').trim() : '',
      nota: observacoes.replace(/\s*Link\s*:?\s*https?:\/\/\S+/i, '').trim(),
      link: link
    });
  }
  return suppliers;
}

/** Lê o bloco de confirmações (perguntas/respostas) abaixo da tabela principal. */
function getNotes_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];
  var data = sheet.getDataRange().getValues();

  var notes = { autor: '', perguntas: [] };
  for (var r = 0; r < data.length; r++) {
    var pergunta = String(data[r][2] || '').trim();
    var resposta = String(data[r][4] || '').trim();
    if (!pergunta) continue;
    if (pergunta === HEADER_LABEL) continue;
    if (!resposta && !notes.autor && /^[A-ZÀ-Ú][a-zà-ú]+\s+[A-ZÀ-Ú]/.test(pergunta)) {
      notes.autor = pergunta; // linha de assinatura, ex.: "Nathália Fernandes"
      continue;
    }
    if (resposta) {
      notes.perguntas.push({ pergunta: pergunta, resposta: resposta });
    }
  }
  return notes;
}

function toNumber_(v) {
  var n = Number(v);
  return isFinite(n) ? n : 0;
}

function parsePrazoDias_(v) {
  var s = String(v || '');
  var m = s.match(/(\d+)/);
  return m ? Number(m[1]) : null;
}

function extractLink_(text) {
  var m = String(text || '').match(/https?:\/\/[^\s)]+/);
  return m ? m[0].replace(/[.,;]+$/, '') : null;
}

// ---------------------------------------------------------------------------
// Foto do produto (busca a imagem de destaque (og:image) da página do link)
// ---------------------------------------------------------------------------

function imageCacheKey_(url) {
  if (!url) return null;
  var digest = Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, url);
  return 'pbimg_' + Utilities.base64EncodeWebSafe(digest).replace(/[^a-zA-Z0-9]/g, '');
}

function getPreviewImage_(url) {
  var key = imageCacheKey_(url);
  if (!key) return null;

  var cache = CacheService.getScriptCache();
  var cached = cache.get(key);
  if (cached) return cached === 'NONE' ? null : cached;

  var image = null;
  try {
    var res = UrlFetchApp.fetch(url, {
      muteHttpExceptions: true,
      followRedirects: true,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36'
      }
    });
    if (res.getResponseCode() >= 200 && res.getResponseCode() < 300) {
      image = extractImage_(res.getContentText(), url);
    }
  } catch (err) {
    image = null;
  }

  cache.put(key, image || 'NONE', IMAGE_CACHE_SECONDS);
  return image;
}

function extractImage_(html, baseUrl) {
  var patterns = [
    /<meta[^>]+property=["']og:image:secure_url["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
    /<meta[^>]+name=["']twitter:image(?::src)?["'][^>]+content=["']([^"']+)["']/i,
    /<link[^>]+rel=["']image_src["'][^>]+href=["']([^"']+)["']/i
  ];
  for (var i = 0; i < patterns.length; i++) {
    var m = html.match(patterns[i]);
    if (m && m[1]) return resolveUrl_(m[1], baseUrl);
  }

  // Sem meta tag de imagem: procura a primeira <img> plausível de produto.
  var imgs = html.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi) || [];
  for (var j = 0; j < imgs.length; j++) {
    var srcMatch = imgs[j].match(/src=["']([^"']+)["']/i);
    if (!srcMatch) continue;
    var src = srcMatch[1];
    if (/logo|icon|favicon|sprite|avatar|placeholder|pixel|\.svg(\?|$)/i.test(src)) continue;
    return resolveUrl_(src, baseUrl);
  }
  return null;
}

function resolveUrl_(src, baseUrl) {
  if (/^https?:\/\//i.test(src)) return src;
  if (src.indexOf('//') === 0) return 'https:' + src;
  var originMatch = baseUrl.match(/^https?:\/\/[^\/]+/i);
  var origin = originMatch ? originMatch[0] : '';
  if (src.indexOf('/') === 0) return origin + src;
  return origin + '/' + src;
}
