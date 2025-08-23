export type ReceiptItem = {
  nome: string;
  quantidade?: number;
  unidade?: string;
  preco?: number;
  total?: number;
};

export type ReceiptParseResult = {
  name?: string;
  market?: string;
  date?: Date | null;
  itens: ReceiptItem[];
  totalItems?: number;
  grandTotal?: number;
};

/**
 * Tenta extrair dados básicos da URL da NFC-e.
 * IMPORTANTE: muitas SEFAZ bloqueiam CORS, então evitamos "fetch".
 * O QR normalmente já traz alguns metadados na querystring (ex.: dhEmi).
 */
export async function parseNFCeFromUrl(rawUrl: string): Promise<ReceiptParseResult> {
  let date: Date | null = null;

  try {
    const u = new URL(rawUrl);
    const get = (k: string) => u.searchParams.get(k) || "";

    // Datas mais comuns na query
    const candidates = [
      "dhEmi", "dhemi", "dEmi", "dataEmissao", "data", "emissao"
    ].map(get).filter(Boolean);

    // Às vezes vem codificado (ex.: 2024-08-10T16:32:00-03:00)
    for (const c of candidates) {
      const val = decodeURIComponent(c);
      const d = new Date(val);
      if (!isNaN(d.getTime())) { date = d; break; }
    }

    // Em alguns estados a data vem "compactada" dentro de p=chave|timestamp
    if (!date) {
      const p = get("p");
      if (p && p.includes("|")) {
        const parts = p.split("|");
        const maybeTs = parts.find(x => /^\d{10,13}$/.test(x));
        if (maybeTs) {
          const ms = maybeTs.length === 10 ? Number(maybeTs) * 1000 : Number(maybeTs);
          if (Number.isFinite(ms)) date = new Date(ms);
        }
      }
    }

    // Nome/mercado às cegas (quase nunca vem na URL, mantemos vazio)
    // Deixamos o usuário confirmar na UI.

  } catch {}

  return {
    name: "",
    market: "",
    date: date || null,
    itens: [],          // prévia não lista itens (CORS), usuário confirma depois
    totalItems: 0,
    grandTotal: undefined
  };
}
