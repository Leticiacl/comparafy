// src/utils/category.ts
const N = (s: string) =>
  (s || "")
    .normalize("NFD")
    // @ts-ignore
    .replace(/\p{Diacritic}/gu, "")
    .replace(/ç/gi, "c")
    .toLowerCase();

type Rule = { cat: string; kws: (string | RegExp)[] };

const RULES: Rule[] = [
  { cat: "Bebidas", kws: ["coca", "guarana", "fanta", "refrigerante", "suco", "agua", "energetico", "cha", /\bcerveja\b/, "vinho"] },
  { cat: "Carnes", kws: ["carne", "frango", "bovino", "suino", "file", "patinho", "alcatra", "linguica", "peito de frango", "cox", "tilapia", "peixe"] },
  { cat: "Laticínios", kws: ["leite", "manteiga", "queijo", "requeij", "iorg", "iogurte", "cream cheese", "nata"] },
  { cat: "Padaria", kws: ["pao", "pão", "bolo", "pao de forma", "bisnaga", "torrada"] },
  { cat: "Hortifruti", kws: ["banana", "maca", "maçã", "alface", "tomate", "cebola", "alho", "batata", "cenoura", "mamao", "manga", "abacaxi", "pepino", "piment", "morango", "uva", "couve", "abobrinha"] },
  { cat: "Grãos e Secos", kws: ["arroz", "feijao", "feijão", "macarrao", "massa", "farinha", "acucar", "açucar", "fermento", "aveia", "granola", "cafe", "café"] },
  { cat: "Congelados", kws: ["congelado", "sorvete", "lasanha", "nugget", "pizza", "hamburguer", "hambúrguer"] },
  { cat: "Snacks", kws: ["biscoito", "bolacha", "salgad", "batata frita", "chips", "chocolate", "bala", "pirulito"] },
  { cat: "Higiene", kws: ["sabonete", "shampoo", "condicionador", "escova", "creme dental", "fio dental", "papel higienico", "higienico", "desodorante"] },
  { cat: "Limpeza", kws: ["detergente", "desinfetante", "amaciante", "sabao", "sabão", "esponja", "candida", "cândida", "alvejante", "multiuso"] },
  { cat: "Pet", kws: ["ração", "racao", "sache", "areia sanit", "petisco pet"] },
  { cat: "Bebê", kws: ["fralda", "lenço umedecido", "mamadeira"] },
  { cat: "Utilidades", kws: ["vela", "pilha", "isqueiro", "aluminio", "papel filme", "guardanapo", "prendedor"] },
];

export function categorize(name: string): string {
  const s = N(name);
  for (const r of RULES) {
    for (const kw of r.kws) {
      if (typeof kw === "string" && s.includes(N(kw))) return r.cat;
      if (kw instanceof RegExp && kw.test(s)) return r.cat;
    }
  }
  return "Outros";
}
