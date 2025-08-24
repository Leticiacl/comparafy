// src/services/nfceParser.ts
// > Remove "(código: 123)" do nome
// > Para na linha "Qtde total de itens" (não inclui rodapé como item)
// > Filtra "Seq. cnc/cliente/tributos/valor pago/valor total" fora da grade
// > Mantém as normalizações de unidade/quantidade/peso já combinadas

export type ReceiptItem = {
  nome: string;
  quantidade: number;
  unidade?: string;  // un | kg | g | l | ml | bd | dz
  peso?: number;     // quando for kg/g/l/ml
  preco: number;     // preço unitário mostrado no app ou total (para peso)
  total?: number;    // total da linha (opcional)
};

export type ReceiptParseResult = {
  name?: string;
  market?: string;
  date?: Date;
  itens: ReceiptItem[];
  totalItems?: number;   // “Qtde total de itens” (rodapé)
  grandTotal?: number;   // “Valor total R$” (rodapé)
};

const PROXY = (import.meta as any).env?.VITE_NFCE_PROXY || "/api/nfce-proxy";
const FORCE_PROXY = ((import.meta as any).env?.VITE_FORCE_PROXY || "0") === "1";

const T = (el: Element | null | undefined) =>
  (el?.textContent || "").replace(/\s+/g, " ").trim();

const numBR = (s: string) => {
  const n = Number(s.replace(/\s/g, "").replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? +n.toFixed(2) : 0;
};

// MG: “1.000” (unidade) = 1 ; “0.158” (peso) = 0.158
const parseQtyMG = (s: string) => {
  const v = s.replace(/\s/g, "");
  if (v.includes(",")) return numBR(v);
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const unitMap = (u?: string) => {
  const x = (u || "").toLowerCase();
  if (/^un|und|unid$/.test(x)) return "un";
  if (/^kg$/.test(x)) return "kg";
  if (/^g$/.test(x)) return "g";
  if (/^l$/.test(x)) return "l";
  if (/^ml$/.test(x)) return "ml";
  if (/^bd/.test(x)) return "bd";
  if (/^dz/.test(x)) return "dz";
  if (x === "fr") return "un"; // alguns portais exibem "FR" na coluna "UN:" — trata como unidade
  return x || undefined;
};

const capFirst = (s: string) => {
  const t = (s || "").toLowerCase().trim();
  return t ? t[0].toUpperCase() + t.slice(1) : t;
};

// remove qualquer "(código: 12345)" que apareça
const stripCodigo = (s: string) => s.replace(/\s*\(c[oó]digo:\s*\d+\)\s*/gi, "").trim();

/* ---------------- fetch helpers ---------------- */
async function fetchViaProxy(url: string): Promise<string | null> {
  try {
    const endpoint = PROXY.startsWith("http") ? PROXY : `${location.origin}${PROXY}`;
    const r = await fetch(`${endpoint}?url=${encodeURIComponent(url)}`);
    if (!r.ok) return null;
    const j = await r.json();
    return typeof j?.html === "string" ? j.html : null;
  } catch { return null; }
}
async function fetchDirect(url: string): Promise<string | null> {
  try {
    const r = await fetch(url, { credentials: "omit" });
    return r.ok ? await r.text() : null;
  } catch { return null; }
}
async function fetchReadable(url: string): Promise<string | null> {
  try {
    const clean = url.replace(/^https?:\/\//, "");
    const r = await fetch(`https://r.jina.ai/https://${clean}`);
    return r.ok ? await r.text() : null;
  } catch { return null; }
}
async function fetchHtml(url: string): Promise<{ html: string; mode: string }> {
  if (FORCE_PROXY) {
    const p = await fetchViaProxy(url);
    if (p) return { html: p, mode: "proxy" };
    const r = await fetchReadable(url);
    if (r) return { html: r, mode: "readable" };
    throw new Error("nfce_fetch_failed");
  }
  const d = await fetchDirect(url);
  if (d) return { html: d, mode: "direct" };
  const p = await fetchViaProxy(url);
  if (p) return { html: p, mode: "proxy" };
  const r = await fetchReadable(url);
  if (r) return { html: r, mode: "readable" };
  throw new Error("nfce_fetch_failed");
}

/* ------------- parser MG por colunas ------------- */
function parsePortalMG(doc: Document): ReceiptParseResult | null {
  const itens: ReceiptItem[] = [];
  let totalItems: number | undefined;
  let grandTotal: number | undefined;

  const market =
    T(doc.querySelector("#spnNomeEmitente")) ||
    T(doc.querySelector(".txtTopo, .txtTit, header")) || undefined;

  // data (dd/mm/aaaa)
  let date: Date | undefined;
  const mDate = T(doc.body).match(/\b(\d{2}\/\d{2}\/\d{4})(?:\s+(\d{2}:\d{2}:\d{2}))?/);
  if (mDate) {
    const [dd, mm, yyyy] = mDate[1].split("/").map(Number);
    const iso = `${yyyy}-${String(mm).padStart(2,"0")}-${String(dd).padStart(2,"0")}${mDate[2] ? "T"+mDate[2] : ""}`;
    const dt = new Date(iso);
    if (!isNaN(dt.getTime())) date = dt;
  }

  // Totais (rodapé)
  const allText = T(doc.body);
  const mTotI = allText.match(/Qtde total de itens\s*[:\-]?\s*(\d+)/i);
  const mTotV = allText.match(/Valor total R\$\s*[:\-]?\s*(?:R\$\s*)?([\d.,]+)/i);
  if (mTotI) totalItems = Number(mTotI[1]);
  if (mTotV) grandTotal = numBR(mTotV[1]);

  const rows = Array.from(doc.querySelectorAll("tr"));
  for (const tr of rows) {
    const tds = Array.from(tr.querySelectorAll("td"));
    if (!tds.length) continue;

    const cells = tds.map(T);
    const joined = cells.join(" | ");

    // Ao encontrar o bloco "Qtde total de itens", paramos — dali pra baixo é rodapé.
    if (/Qtde\s+total\s+de\s+itens/i.test(joined)) break;

    // Descarta linhas informativas fora da grade de itens
    if (
      /valor aproximado dos tributos|cliente:|seq\.?\s*cnc|forma de pagamento|valor pago r\$/i.test(joined)
    ) continue;

    // Linha de moeda solta (ex.: "R$ 255,20")
    if (tds.length <= 2 && /^\s*R\$\s*[\d.,]+\s*$/i.test(joined)) continue;

    // Itens válidos têm "(Código: NNNN)" em MG; garantimos isso
    if (!/\(c[oó]digo:\s*\d+\)/i.test(joined)) continue;

    // nome: texto ANTES de “(Código: …)”
    const firstCell = cells[0] || joined.split("|")[0] || "";
    let nome = firstCell.replace(/\(c[oó]digo:\s*\d+\)/i, "");
    nome = capFirst(stripCodigo(nome));

    // quantidade (pega da célula "Qtde total de itens: X")
    const qtdCell = cells.find((c) => /qtde\s+total\s+de\s+i?tens/i.test(c));
    const qtdStr = qtdCell ? qtdCell.replace(/.*?[:]\s*/i, "") : "";
    let quantidade = parseQtyMG(qtdStr);

    // unidade (fica após um "UN:" em outra célula)
    let unidade: string | undefined;
    const idxUn = cells.findIndex((c) => /^UN:?$/i.test(c) || /UN:\s*$/i.test(c));
    if (idxUn >= 0 && cells[idxUn + 1]) unidade = unitMap(cells[idxUn + 1]);

    // valor total da linha
    let total = 0;
    const idxVal = cells.findIndex((c) => /valor\s+total\s+r\$/i.test(c));
    if (idxVal >= 0 && cells[idxVal + 1]) {
      total = numBR(cells[idxVal + 1].replace(/^R\$\s*/i, ""));
    }
    if (!total) continue;

    // normalizações
    if (unidade && /^(un|bd|dz)$/.test(unidade)) {
      quantidade = Math.round(quantidade);
      while (quantidade >= 1000 && quantidade % 1000 === 0) quantidade /= 1000;
    }

    let peso: number | undefined;
    let preco = 0;

    if (unidade && /^(kg|g|l|ml)$/.test(unidade)) {
      peso = quantidade;
      // alguns portais exibem frações como 0.158 (ok); se vier “158” (g) no mesmo lugar, converter
      if (peso > 10 && /\b0\.\d{1,3}\b/.test(qtdStr)) peso = +(peso / 1000).toFixed(3);
      quantidade = 1;
      preco = total; // para peso, exibimos o total da linha
    } else {
      preco = quantidade > 0 ? +(total / quantidade).toFixed(2) : total;
    }

    if (!nome || (!preco && !total)) continue;

    itens.push({
      nome,
      quantidade: Math.max(1, quantidade),
      unidade,
      peso,
      preco,
      total,
    });
  }

  if (!itens.length) return null;
  return { name: "Compra (NFC-e)", market, date, itens, totalItems, grandTotal };
}

/* -------- fallback genérico (com os mesmos cortes) -------- */
function parseGeneric(doc: Document): ReceiptParseResult | null {
  const itens: ReceiptItem[] = [];
  const rows = Array.from(doc.querySelectorAll("tr"));
  for (const tr of rows) {
    const cells = Array.from(tr.querySelectorAll("td")).map(T);
    const line = cells.join(" | ");

    if (/Qtde\s+total\s+de\s+itens/i.test(line)) break;
    if (/valor aproximado dos tributos|cliente:|seq\.?\s*cnc|forma de pagamento|valor pago r\$/i.test(line))
      continue;
    if (cells.length <= 2 && /^\s*R\$\s*[\d.,]+\s*$/i.test(line)) continue;
    if (!/\(c[oó]digo:\s*\d+\)/i.test(line)) continue;
    if (!/R\$\s*[\d.,]+/i.test(line)) continue;

    let nome = capFirst(stripCodigo((cells[0] || line.split(/\(c[oó]digo:\s*\d+\)/i)[0] || "")));

    const mQtd = line.match(/(qtde|qtd|quant|itens:\s*)([\d.,]+)/i);
    const mUn  = line.match(/\b(un|und|unid|kg|g|l|ml|bd|dz|fr)\b/i);
    const mVal = line.match(/R\$\s*([\d.,]+)/i);

    let quantidade = mQtd ? parseQtyMG(mQtd[2]) : 1;
    let unidade = unitMap(mUn?.[1]);
    const total = mVal ? numBR(mVal[1]) : 0;
    if (!total) continue;

    if (unidade && /^(un|bd|dz)$/.test(unidade)) {
      quantidade = Math.round(quantidade);
      while (quantidade >= 1000 && quantidade % 1000 === 0) quantidade /= 1000;
    }

    let peso: number | undefined;
    let preco = 0;
    if (unidade && /^(kg|g|l|ml)$/.test(unidade)) {
      peso = quantidade;
      quantidade = 1;
      preco = total;
    } else {
      preco = quantidade > 0 ? +(total / quantidade).toFixed(2) : total;
    }

    if (!nome || (!preco && !total)) continue;
    itens.push({ nome, quantidade, unidade, peso, preco, total });
  }

  if (!itens.length) return null;
  return { name: "Compra (NFC-e)", itens };
}

/* ------------- entrypoint ------------- */
export async function parseNFCeFromUrl(url: string): Promise<ReceiptParseResult> {
  const { html } = await fetchHtml(url);
  const doc = new DOMParser().parseFromString(html, "text/html");

  const mg = parsePortalMG(doc);
  if (mg) return mg;

  const gen = parseGeneric(doc);
  if (gen) return gen;

  return { name: "Compra (NFC-e)", itens: [] };
}