export type ReceiptItem = {
  nome: string;
  quantidade?: number;
  unidade?: string;
  peso?: number;
  preco: number;
  mercado?: string;
};
export type ReceiptParseResult = {
  name?: string;
  market?: string;
  date?: Date;
  itens: ReceiptItem[];
};

const API_BASE = (import.meta as any).env?.VITE_API_BASE || ""; // ex.: https://seuapp.vercel.app

async function fetchHtml(url: string): Promise<string> {
  // 1) direto (muitos portais bloqueiam)
  try {
    const r = await fetch(url, { mode: "cors", credentials: "omit" });
    if (r.ok) return await r.text();
  } catch {}

  // 2) via nosso proxy (mesma origem em prod; em dev aponte para o domínio da Vercel)
  try {
    const base = API_BASE || "";
    const r = await fetch(`${base}/api/nfce-proxy?url=${encodeURIComponent(url)}`);
    if (r.ok) {
      const j = await r.json();
      if (typeof j?.html === "string") return j.html;
    }
  } catch {}

  // 3) fallback DEV (não use em prod)
  try {
    const via = `https://r.jina.ai/${url.startsWith("https://") ? "" : "https://"}${url.replace(/^https?:\/\//, "")}`;
    const r = await fetch(via);
    if (r.ok) return await r.text();
  } catch {}

  throw new Error("nfce_fetch_failed");
}

function T(el: Element | null | undefined): string {
  return (el?.textContent || "").replace(/\s+/g, " ").trim();
}
function moneyToNumber(s: string): number {
  const n = Number(s.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

function parseHtmlGeneric(html: string): ReceiptParseResult {
  const doc = new DOMParser().parseFromString(html, "text/html");

  // nome do mercado – heurísticas comuns
  const market =
    T(doc.querySelector("#spnNomeEmitente, #u20, .txtTopo, .txtTit, .cabecalho, header")) ||
    undefined;

  const itens: ReceiptItem[] = [];
  const rows = Array.from(
    doc.querySelectorAll("table tr, .table tr, #tabResult tr, #tabResult tbody tr, .ui-row")
  );

  for (const tr of rows) {
    const tds = Array.from(tr.querySelectorAll("td"));
    if (tds.length < 2) continue;
    const raw = tds.map((td) => T(td));
    const joined = raw.join(" | ").toLowerCase();

    // pula cabeçalhos
    if (/descri|qtd|valor|unidade|total/.test(joined) && tds.length <= 5) continue;

    // procura um valor monetário
    const m = joined.match(/(\d{1,3}(?:[\.\s]\d{3})*,\d{2}|\d+\.\d{2})/);
    if (!m) continue;

    const nome = raw[0] || raw[1];
    if (!nome || nome.length < 2) continue;

    const preco = moneyToNumber(m[0]);

    // extrai unidade/peso se existir
    let unidade: string | undefined;
    let peso: number | undefined;
    const um = joined.match(/(\d+[.,]?\d*)\s?(kg|g|l|ml)\b/);
    if (um) {
      unidade = um[2].toLowerCase();
      peso = moneyToNumber(um[1].replace(",", "."));
    } else if (/\bun\b/.test(joined)) unidade = "un";

    itens.push({ nome, preco, unidade, peso, quantidade: 1 });
  }

  return { name: "Compra (NFC-e)", market, itens };
}

export async function parseNFCeFromUrl(url: string): Promise<ReceiptParseResult> {
  const html = await fetchHtml(url);
  const parsed = parseHtmlGeneric(html);
  return parsed.itens?.length ? parsed : { name: "Compra (NFC-e)", market: parsed.market, itens: [] };
}
