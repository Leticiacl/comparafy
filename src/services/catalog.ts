// src/services/catalog.ts
import { getFirestore, collection, getDocs, doc, setDoc } from "firebase/firestore";
import { topSuggestions } from "@/utils/match";
import seed from "../catalog.seed.json";

export type CatalogItem = {
  id?: string;
  nome: string;        // Nome "canonical" (ex.: "Coca-Cola")
  categoria?: string;  // "Bebidas > Refrigerantes"
  marca?: string;      // "Coca-Cola"
  unidade?: string;    // "l", "ml", "kg", "un"...
  sinonimos?: string[]; // ["coca", "coca cola", "refrigerante coca"]
  volumeRegex?: string; // opcional: extrair volume (ex.: "(\\d+(?:[,\\.]\\d+)?)(?:\\s*)(l|ml)")
};

const db = getFirestore();
const CATALOG = "catalog";

export async function fetchCatalog(): Promise<CatalogItem[]> {
  const snap = await getDocs(collection(db, CATALOG));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
}

/** Povoa o catálogo se estiver vazio. */
export async function seedCatalogIfEmpty(): Promise<number> {
  const existing = await fetchCatalog();
  if (existing.length > 0) return 0;

  let count = 0;
  for (const item of seed as CatalogItem[]) {
    const ref = doc(collection(db, CATALOG));
    await setDoc(ref, {
      nome: item.nome,
      categoria: item.categoria || null,
      marca: item.marca || null,
      unidade: item.unidade || null,
      sinonimos: item.sinonimos || [],
      volumeRegex: item.volumeRegex || null,
    });
    count++;
  }
  return count;
}

export function suggestForName(name: string, catalog: CatalogItem[]) {
  const suggestions = topSuggestions(name, catalog, 5, 0.84);
  // retorna a melhor com score e metadados básicos
  if (!suggestions.length) return null;
  const best = suggestions[0];
  return {
    score: best.score,
    item: best.target,
  };
}
