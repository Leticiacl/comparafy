// src/services/nfceParser.ts
export type ParsedNFCe = {
  name?: string;
  market?: string;
  date?: Date;
  itens: Array<{
    nome: string;
    quantidade?: number; // pode ser decimal (Kg)
    unidade?: string;    // 'un', 'kg', 'bd', etc.
    preco: number;       // PREÇO UNITÁRIO
    peso?: number;
  }>;
};

/** Converte "R$ 1.234,56" -> 1234.56 */
function moneyBRToNumber(s: string): number {
  const cleaned = s.replace(/\s|R\$/g, "").replace(/\./g, "").replace(",", ".");
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

/** Converte "3.0000" ou "0,5800" -> número */
function parseNumberBR(s: string): number {
  return moneyBRToNumber(s);
}

/** Sentence case simples (primeira letra maiúscula, resto minúsculo) */
function sentenceCase(str: string): string {
  const s = str.toLowerCase().replace(/\s+/g, " ").trim();
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}

/** Normaliza unidade (UN, Kg, Bd...) -> minúsculas */
function normUnit(u?: string): string | undefined {
  if (!u) return undefined;
  return u.trim().toLowerCase();
}

/**
 * Parser genérico para páginas de consulta da NFC-e.
 * Focado no padrão exibido pelo portal de MG (mas funciona em portals semelhantes).
 */
export async function parseNFCeFromUrl(url: string): Promise<ParsedNFCe> {
  const res = await fetch(url, { credentials: "omit" });
  const html = await res.text();

  // nome do mercado (heurística comum em vários portais)
  let market: string | undefined;
  {
    const m =
      html.match(/(Emitente|Estabelecimento|Raz[aã]o Social)\s*[:\-]\s*<\/?[^>]*>\s*([^<]+)/i) ||
      html.match(/<td[^>]*>\s*(Emitente|Estabelecimento)[^<]*<\/td>\s*<td[^>]*>\s*([^<]+)/i);
    if (m && m[2]) market = sentenceCase(m[2]);
  }

  // data da compra (quando disponível)
  let date: Date | undefined;
  {
    const m =
      html.match(/Data\s*de\s*(Emiss[aã]o|Emissão)\s*[:\-]\s*<\/?[^>]*>\s*([^<]+)/i) ||
      html.match(/(\d{2}\/\d{2}\/\d{4})/);
    if (m && m[2]) {
      const parts = (m[2].match(/\d{2}\/\d{2}\/\d{4}/) || [])[0];
      if (parts) {
        const [d, mo, y] = parts.split("/").map((x) => parseInt(x, 10));
        date = new Date(y, mo - 1, d);
      }
    }
  }

  // itens (padrão MG)
  // capturamos: NOME, QUANTIDADE (Qtde total de itens), UNIDADE (após "UN:"), VALOR TOTAL R$
  const itemRegex =
    /([A-Z0-9Á-ÚÇÃÕÂÊÔÉÍÓÚÀÜ°ºª/.,\-\s]+?)\s*\(Código:[^)]+\)[\s\S]*?Qtde\s*total\s*de\s*itens:\s*([\d.,]+)[\s\S]*?UN:\s*([A-Za-z]+)[\s\S]*?Valor\s*total\s*R\$\s*:\s*R\$\s*([\d.,]+)/g;

  const itens: ParsedNFCe["itens"] = [];
  let m: RegExpExecArray | null;
  while ((m = itemRegex.exec(html))) {
    const nameUpper = (m[1] || "").replace(/\s+/g, " ").trim();
    const quantidade = parseNumberBR(m[2] || "1");
    const unidade = normUnit(m[3] || "un");
    const valorTotal = moneyBRToNumber(m[4] || "0");

    // preço unitário = total / quantidade (evita 1x quando foram 3x)
    const precoUnit = quantidade > 0 ? valorTotal / quantidade : valorTotal;

    itens.push({
      nome: sentenceCase(nameUpper),
      quantidade,
      unidade,
      preco: Number(precoUnit.toFixed(2)),
    });
  }

  // fallback: se nada casou (outros portais), tenta um formato mais solto
  if (itens.length === 0) {
    const loose =
      /<tr[^>]*>\s*<td[^>]*>(.*?)<\/td>[\s\S]*?Qtde[^<]*:\s*([\d.,]+)[\s\S]*?UN[^<]*:\s*([A-Za-z]+)[\s\S]*?Valor[^R]*R\$\s*([\d.,]+)/gi;
    let l: RegExpExecArray | null;
    while ((l = loose.exec(html))) {
      const nameUpper = (l[1] || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      const quantidade = parseNumberBR(l[2] || "1");
      const unidade = normUnit(l[3] || "un");
      const valorTotal = moneyBRToNumber(l[4] || "0");
      const precoUnit = quantidade > 0 ? valorTotal / quantidade : valorTotal;

      itens.push({
        nome: sentenceCase(nameUpper),
        quantidade,
        unidade,
        preco: Number(precoUnit.toFixed(2)),
      });
    }
  }

  // nome sugerido da compra
  const name = "Compra (NFC-e)";

  return {
    name,
    market,
    date,
    itens,
  };
}
