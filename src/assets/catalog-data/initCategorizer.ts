// /src/assets/catalog-data/initCategorizer.ts
// Inicializa o categorizador a partir do JSON estático (import estático).
// Unifica/renomeia categorias:
//   acougue → carnes
//   cereais → alimentos
//   doces/salgados → guloseimas
//   frutas/verduras → feira
//   itens domesticos → (removido; por padrão vira "limpeza"; se não encaixar, cai em "outros")
// Bloqueia categorias inválidas (A/E/I/O/U, "em cadastro", etc.), reforça 1ª palavra e keywords.

import rawDict from "./dict.json";
import {
  setDictionary,
  setFirstWordIndex,
  setKeywordPatterns,
  normalize,
} from "./categorizeFromDataset";

let bootstrapped = false;

/* ---------- whitelist com nomes novos ---------- */
const ALLOWED = new Set([
  "carnes",
  "aguas/sucos",
  "biscoitos",
  "alimentos",
  "chocolates/bombons",
  "condimentos",
  "congelados",
  "descartaveis",
  "guloseimas",
  "laticinios",
  "limpeza",
  "ovos",
  "padaria",
  "racao",
  "refrigerante",
  "feira",
  "massas",      // mantida (macarrão/lasanha etc.)
  "outros",
]);

/* ---------- stopwords para 1ª palavra ---------- */
const STOPWORDS = new Set([
  "a","e","i","o","u",
  "de","da","do","das","dos",
  "kg","g","gr","un","und","pct","pc","cx","lt","l","ml","emb","bd","bv",
]);

/* ---------- normalização e unificação p/ nomes novos ---------- */
function canonCategory(raw: string): string {
  let v = String(raw || "").toLowerCase().trim();

  // remover sufixos numéricos e prefixos tipo "mat "
  v = v.replace(/\b\d+\b/g, "").replace(/\s{2,}/g, " ").trim();
  v = v.replace(/^mat\s+/, ""); // "mat limpeza" → "limpeza"

  // mapear antigos → novos
  const map: Record<string, string> = {
    // inválidos/bloqueados
    "a": "outros", "e": "outros", "i": "outros", "o": "outros", "u": "outros",
    "em cadastro": "outros", "cadastro": "outros", "consumo interno": "outros",

    // renomeações solicitadas
    "acougue": "carnes", "acougue 1": "carnes", "acougue 2": "carnes",
    "cereais": "alimentos", "matinais": "alimentos",
    "doces/salgados": "guloseimas", "doces/salgados 1": "guloseimas",
    "frutas/verduras": "feira", "frutas/verduras 1": "feira",
    "sacolao": "feira", "sacolão": "feira",
    "itens domesticos": "limpeza", "itens domestico": "limpeza", "itens domestico 1": "limpeza",

    // mantidas / consolidadas
    "laticínios e frios": "laticinios",
    "laticinios e frios": "laticinios",
    "leite": "laticinios",

    "biscoitos": "biscoitos",
    "padaria": "padaria", "confeitaria": "padaria",

    "refrigerante": "refrigerante", "bebidas": "refrigerante",

    "condimentos alhos": "condimentos",
    "condimentos": "condimentos",
    "temperos": "condimentos", "tempero": "condimentos",
    "molhos": "condimentos", "molho": "condimentos",

    "aguas/sucos": "aguas/sucos", "aguas/sucos 1": "aguas/sucos", "refrescos": "aguas/sucos",

    "chocolates bombons": "chocolates/bombons",
    "chocolates/bombons": "chocolates/bombons",

    "congelados": "congelados",
    "congelados sorvetes": "congelados",

    "limpeza": "limpeza",

    "racao 1": "racao", "racao": "racao",

    "descartaveis 1": "descartaveis", "descartaveis": "descartaveis",

    "massas": "massas",
  };

  v = map[v] || v;

  // se não estiver na whitelist, volta "outros"
  if (!ALLOWED.has(v)) return "outros";
  return v;
}

/* ---------- reforços por 1ª palavra (famílias) p/ nomes novos ---------- */
const FIRST_OVERRIDES_ENTRIES: Array<[string, string]> = [
  // feira
  ..."abobora alface banana batata brocolis cebola cebolinha cenoura chuchu inhame laranja limao manga mexerica morango pepino tomate uva couve"
    .split(" ")
    .map(w => [w, "feira"] as [string, string]),

  // carnes
  ["carne","carnes"],["frango","carnes"],["linguica","carnes"],["bovina","carnes"],["suina","carnes"],
  ["apresuntado","carnes"],["apres","carnes"], // apres → carnes (não laticínios)

  // laticínios
  ["queijo","laticinios"],["qj","laticinios"],["manteiga","laticinios"],["iogurte","laticinios"],["requeijao","laticinios"],["leite","laticinios"],

  // ovos
  ["ovo","ovos"],["ovos","ovos"],

  // mercearia/secos → alimentos
  ["arroz","alimentos"],["feijao","alimentos"],["acucar","alimentos"],["cafe","alimentos"],
  ["farinha","alimentos"],["fermento","alimentos"],["canjica","alimentos"],["amendoim","alimentos"],

  // biscoitos
  ["biscoito","biscoitos"],["bolacha","biscoitos"],

  // padaria
  ["pao","padaria"],["bolo","padaria"],["salgado","padaria"],["sonho","padaria"],

  // refrigerantes
  ["refrigerante","refrigerante"],["coca","refrigerante"],["guarana","refrigerante"],["pepsi","refrigerante"],

  // condimentos
  ["ketchup","condimentos"],["mostarda","condimentos"],["maionese","condimentos"],["alho","condimentos"],["tempero","condimentos"],["molho","condimentos"],

  // limpeza
  ["detergente","limpeza"],["amaciante","limpeza"],["sabao","limpeza"],["esponja","limpeza"],

  // descartáveis
  ["toalha","descartaveis"],["papel","descartaveis"],

  // guloseimas
  ["pipoca","guloseimas"],["chiclete","guloseimas"],["bala","guloseimas"],["pirulito","guloseimas"],

  // óleo agora vai para alimentos
  ["oleo","alimentos"],
];

/* ---------- keywords/abreviações/colados (novas categorias) ---------- */
const EXTRA_KEYWORDS: Array<{ key: string; category: string }> = [
  // abreviações citadas + correções
  { key: "apres", category: "carnes" },
  { key: "canj", category: "alimentos" },
  { key: "espon", category: "limpeza" },
  { key: "far trig", category: "alimentos" },
  { key: "ferm bio", category: "alimentos" },
  { key: "qj", category: "laticinios" },
  { key: "m.pi", category: "alimentos" },   // milho p/ pipoca cru
  { key: "pipoca", category: "guloseimas" },
  { key: "panko", category: "alimentos" },

  // feira colado
  { key: "cebolaamar", category: "feira" },
  { key: "cenouraverm", category: "feira" },
  { key: "alfacecrespa", category: "feira" },
  { key: "mangatommy", category: "feira" },
  { key: "limaotahiti", category: "feira" },
  { key: "brocolisninja", category: "feira" },
  { key: "bat.inglesa", category: "feira" },

  // gerais
  { key: "achoc", category: "alimentos" },          // achocolatado
  { key: "salgadin", category: "guloseimas" },      // salgadinho
  { key: "chiclet", category: "guloseimas" },       // chiclete topline
  { key: "refri", category: "refrigerante" },
  { key: "iog", category: "laticinios" },
  { key: "tempero", category: "condimentos" },
  { key: "molho", category: "condimentos" },
  { key: "toalha", category: "descartaveis" },
  { key: "papel hig", category: "descartaveis" },   // papel higiênico
  { key: "ketchup", category: "condimentos" },
  { key: "sonho", category: "padaria" },
];

/* ---------- overrides por produto exato ---------- */
const EXACT_MATCH_OVERRIDES: Record<string,string> = {
  "far.mand.b.pa.300g": "alimentos",
  "m.pi.pre.pach.500g": "alimentos",
  "sabao ype gl.160g": "limpeza",
  "iog.bat.ped.ab.450": "outros",
  "bisc aymore aman": "biscoitos",
  "pip doce kerus t": "guloseimas",
  "bat.inglesa esp.kg": "feira",
  "catchup heinz 1.0": "condimentos",
  "chiclete top line": "guloseimas",
  "far.panko": "alimentos",
  "ferm.po royal 250g": "alimentos",
  "papel hig cotton": "descartaveis",
  "pres coz pif paf": "carnes",
  "qjo": "laticinios",
  "refresco mid zero": "aguas/sucos",
  "sonho americano k": "padaria",
  "io.pens.ze.bat.850": "outros",
  "oleo": "alimentos",
  "espon": "limpeza",
};

/* ---------- build ---------- */
export async function initCategorizer() {
  if (bootstrapped) return;
  try {
    const base: Record<string, string> =
      (rawDict as any)?.map && typeof (rawDict as any).map === "object"
        ? (rawDict as any).map
        : (rawDict as any);

    // 1) montar dicionário normalizado + renomeado (sobrepõe com família se precisar)
    const dict = new Map<string, string>();
    const firstOverride = new Map<string, string>(FIRST_OVERRIDES_ENTRIES);

    for (const [k, v] of Object.entries(base || {})) {
      const nk = normalize(k);
      if (!nk) continue;

      // categoria original canonizada → nomes novos + overrides exatos
      let cat = EXACT_MATCH_OVERRIDES[nk] || canonCategory(v);

      // reforço por 1ª palavra (garante família correta)
      const first = nk.split(" ")[0];
      if (first && firstOverride.has(first)) {
        cat = firstOverride.get(first)!;
      }

      dict.set(nk, cat);
    }

    // 2) index de 1ª palavra — ignora stopwords
    const firstIdx = new Map<string, string>();
    for (const [k, v] of dict.entries()) {
      const first = k.split(" ")[0];
      if (!first || STOPWORDS.has(first)) continue;
      firstIdx.set(first, v);
    }
    // garante que overrides entrem mesmo se não existirem no dict
    for (const [w, cat] of firstOverride.entries()) {
      const t = normalize(w).split(" ")[0];
      if (!t || STOPWORDS.has(t)) continue;
      firstIdx.set(t, cat);
    }

    // 3) keywords (famílias + extras)
    const keywordRules = Array.from(firstIdx.entries()).map(([key, category]) => ({ key, category }));

    // 4) aplicar
    setDictionary(dict);
    setFirstWordIndex(firstIdx);
    setKeywordPatterns([...keywordRules, ...EXTRA_KEYWORDS]);

    bootstrapped = true;
    if (import.meta.env.DEV) {
      console.info(
        `[categorizer] pronto: dict=${dict.size} · first=${firstIdx.size} · overrides=${Object.keys(EXACT_MATCH_OVERRIDES).length}`
      );
    }
  } catch (err) {
    console.warn("[categorizer] Falha ao inicializar dicionário:", err);
  }
}
