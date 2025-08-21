// src/services/nfceParser.ts
// Parser robusto com suporte ao portal MG (portalsped.fazenda.mg.gov.br)

export type ReceiptItem = {
  nome: string;
  quantidade: number;
  unidade?: string;
  peso?: number;
  preco: number;   // preço unitário (ou o total da linha quando a unidade é kg/l/ml)
  total?: number;  // total da linha, se detectado
};

export type ReceiptParseResult = {
  name?: string;
  market?: string;
  date?: Date;
  itens: ReceiptItem[];
};

const PROXY = (import.meta as any).env?.VITE_NFCE_PROXY || "/api/nfce-proxy";
const FORCE_PROXY = ((import.meta as any).env?.VITE_FORCE_PROXY || "0") === "1";

function dbg(...a: any[]) {
  if (typeof window !== "undefined") console.info("[NFCe]", ...a);
}
function T(el: Element | null | undefined) {
  return (el?.textContent || "").replace(/\s+/g, " ").trim();
}
function numBR(s: string) {
  const n = Number(s.replace(/\s/g, "").replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}
function clean(s: string) {
  return (s || "")
    .replace(/\s*\|\s*/g, " ")
    .replace(/[-–—]{2,}/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}
function isJunk(s: string) {
  const l = s.toLowerCase();
  return (
    l.includes("tributo") ||
    l.includes("federais") ||
    l.includes("estaduais") ||
    l.includes("municipais") ||
    l.startsWith("total") ||
    l === "-" ||
    l === "|" ||
    l.length < 2
  );
}
function unitMap(u?: string) {
  const x = (u || "").toLowerCase();
  if (/^un|und|unid$/.test(x)) return "un";
  if (/^kg$/.test(x)) return "kg";
  if (/^g$/.test(x)) return "g";
  if (/^l$/.test(x)) return "l";
  if (/^ml$/.test(x)) return "ml";
  if (/^bd/.test(x)) return "bd"; // bandeja
  return x || undefined;
}

/* --------------------- fetch ---------------------- */
async function fetchViaProxy(url: string): Promise<string | null> {
  try {
    const endpoint = PROXY.startsWith("http") ? PROXY : `${location.origin}${PROXY}`;
    const r = await fetch(`${endpoint}?url=${encodeURIComponent(url)}`, { mode: "cors" });
    if (!r.ok) return null;
    const j = await r.json();
    return typeof j?.html === "string" ? j.html : null;
  } catch {
    return null;
  }
}
async function fetchDirect(url: string): Promise<string | null> {
  try {
    const r = await fetch(url, { mode: "cors", credentials: "omit" });
    return r.ok ? await r.text() : null;
  } catch {
    return null;
  }
}
async function fetchReadable(url: string): Promise<string | null> {
  try {
    const clean = url.replace(/^https?:\/\//, "");
    const r = await fetch(`https://r.jina.ai/https://${clean}`);
    return r.ok ? await r.text() : null;
  } catch {
    return null;
  }
}
async function fetchHtml(url: string): Promise<{ html: string; mode: "proxy" | "direct" | "readable" }> {
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

/* --------------------- parsers -------------------- */
// parser específico MG: linhas do tipo
//  [NOME (Código: 123)] [Qtde total de ítens: 0.4000] [UN:] [Kg] [Valor total R$: ] [R$ 2,80]
function parsePortalMG(doc: Document): ReceiptParseResult | null {
  const itens: ReceiptItem[] = [];

  const market =
    T(doc.querySelector("#spnNomeEmitente, .txtTopo, .txtTit, .cabecalho, header")) || undefined;

  // data dd/mm/aaaa (qualquer lugar no documento)
  let date: Date | undefined;
  const mDate = T(doc.body).match(/\b(\d{2}\/\d{2}\/\d{4})(?:\s+(\d{2}:\d{2}:\d{2}))?/);
  if (mDate) {
    const [dd, mm, yyyy] = mDate[1].split("/").map((x) => Number(x));
    const iso = `${yyyy}-${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}${mDate[2] ? "T" + mDate[2] : ""}`;
    const dt = new Date(iso);
    if (!isNaN(dt.getTime())) date = dt;
  }

  const rows = Array.from(doc.querySelectorAll("tr"));
  for (const tr of rows) {
    const tds = Array.from(tr.querySelectorAll("td"));
    if (tds.length === 0) continue;
    const cells = tds.map((td) => T(td));
    const joined = cells.join(" | ");
    if (!/\(c[oó]digo:\s*\d+\)/i.test(joined)) continue; // só linhas de item

    // nome
    const namePart = joined.split(/\(c[oó]digo:/i)[0];
    const nome = clean(namePart);
    if (!nome || isJunk(nome)) continue;

    // quantidade
    let quantidade = 1;
    const mQtd = joined.match(/qtde\s+total\s+de\s+[ií]tens:\s*([\d.,]+)/i);
    if (mQtd) {
      const q = numBR(mQtd[1]);
      if (q > 0) quantidade = q;
    }

    // unidade (vem logo após "UN:")
    let unidade = unitMap((joined.match(/UN:\s*([A-Za-z]+)/i) || [,""])[1]);

    // total
    let total = 0;
    const mTot = joined.match(/valor\s+total\s+r\$\s*:?\s*(?:r\$\s*)?([\d.,]+)/i);
    if (mTot) total = numBR(mTot[1]);

    // se não achou valores, pula
    if (!total && quantidade <= 0) continue;

    // regra: para massa/volume (kg/g/l/ml) usamos quantidade como peso
    // e tratamos a "quantidade" de itens como 1
    let peso: number | undefined;
    let preco = 0;

    if (unidade && /^(kg|g|l|ml)$/.test(unidade)) {
      peso = quantidade;
      quantidade = 1;
      preco = total; // preço da linha (para aquele peso)
    } else {
      // un/bd/etc → preco unitário
      preco = quantidade > 0 ? +(total / quantidade).toFixed(2) : total;
    }

    itens.push({
      nome,
      quantidade: Math.max(1, quantidade),
      unidade,
      peso,
      preco,
      total: total || undefined,
    });
  }

  if (!itens.length) return null;
  return { name: "Compra (NFC-e)", market, date, itens };
}

// fallback genérico (quando outra UF diferente)
function parseGeneric(doc: Document): ReceiptParseResult | null {
  const itens: ReceiptItem[] = [];
  const market = T(doc.querySelector("#spnNomeEmitente, .txtTopo, .txtTit, .cabecalho, header")) || undefined;

  const tables = Array.from(doc.querySelectorAll("table, .table"));
  let target: HTMLTableElement | null = null;
  target = tables.sort((a, b) => (a.textContent || "").length - (b.textContent || "").length).pop() as any;
  if (!target) return null;

  const rows = Array.from(target.querySelectorAll("tr")).slice(1);
  for (const tr of rows) {
    const cells = Array.from(tr.querySelectorAll("td")).map((td) => T(td));
    if (!cells.length) continue;
    const line = cells.join(" | ");
    if (isJunk(line)) continue;

    // nome
    let nome = clean(cells[0] || line.split("|")[0] || "");
    if (!nome || isJunk(nome)) continue;

    // tenta puxar qtd/un/tot na linha
    const mQtd = line.match(/(qtd|qtde|quant|itens:\s*)([\d.,]+)/i);
    const mUn = line.match(/\b(un|und|unid|kg|g|l|ml|bd)\b/i);
    const mDin = line.match(/(\d{1,3}(?:[\.\s]\d{3})*,\d{2}|\d+\.\d{2})(?!.*\d)/); // último valor da linha

    let quantidade = mQtd ? numBR(mQtd[2]) : 1;
    let unidade = unitMap(mUn?.[1]);
    let total = mDin ? numBR(mDin[1]) : 0;

    let peso: number | undefined;
    let preco = 0;

    if (unidade && /^(kg|g|l|ml)$/.test(unidade)) {
      peso = quantidade;
      quantidade = 1;
      preco = total;
    } else {
      preco = quantidade > 0 ? +(total / quantidade).toFixed(2) : total;
    }

    if (!total && !preco) continue;

    itens.push({ nome, quantidade, unidade, peso, preco, total: total || undefined });
  }

  if (!itens.length) return null;
  return { name: "Compra (NFC-e)", market, itens };
}

/* --------------------- entry point --------------------- */
export async function parseNFCeFromUrl(url: string): Promise<ReceiptParseResult> {
  const { html, mode } = await fetchHtml(url);
  dbg("fetch mode:", mode);

  const doc = new DOMParser().parseFromString(html, "text/html");

  // 1) MG
  const mg = parsePortalMG(doc);
  if (mg && mg.itens.length) {
    dbg("parsed MG:", mg.itens.length);
    return mg;
  }

  // 2) genérico
  const gen = parseGeneric(doc);
  if (gen && gen.itens.length) {
    dbg("parsed generic:", gen.itens.length);
    return gen;
  }

  dbg("no items parsed");
  return { name: "Compra (NFC-e)", itens: [] };
}
