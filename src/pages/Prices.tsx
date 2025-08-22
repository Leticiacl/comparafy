// src/pages/Prices.tsx
import React, { useState, useMemo } from "react";
import { useData, Item } from "../context/DataContext";
import BottomNav from "../components/BottomNav";
import { normalizeString } from "../utils/normalizeString";
import PageHeader from "../components/ui/PageHeader";

interface FlatItem extends Item {
  listName: string;
}

interface GroupedMarket {
  key: string;            // mercado normalizado
  label: string;          // rótulo para exibição
  entries: Array<{
    preco: number;
    listName: string;
  }>;
}

const Prices: React.FC = () => {
  const { lists } = useData();
  const [query, setQuery] = useState("");

  // 1) Achata todas as listas num único array, carregando nome
  const allItems = useMemo<FlatItem[]>(
    () =>
      lists.flatMap((list) =>
        list.itens.map((item) => ({
          ...item,
          listName: list.nome,
        }))
      ),
    [lists]
  );

  // 2) Filtra pelo nome do produto
  const filtered = useMemo(() => {
    const q = normalizeString(query);
    if (!q) return [];
    return allItems.filter((item) => normalizeString(item.nome).includes(q));
  }, [query, allItems]);

  // 3) Agrupa por mercado (normalized)
  const grouped = useMemo((): GroupedMarket[] => {
    const map = new Map<string, GroupedMarket>();
    for (const item of filtered) {
      const key = normalizeString(item.mercado);
      if (!map.has(key)) {
        map.set(key, { key, label: item.mercado.trim(), entries: [] });
      }
      map.get(key)!.entries.push({ preco: item.preco, listName: item.listName });
    }
    return Array.from(map.values());
  }, [filtered]);

  return (
    <div className="p-4 pb-32 max-w-xl mx-auto bg-white space-y-6">
      <PageHeader title="Preços" />

      {/* search bar */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Buscar produto…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 border border-gray-300 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />
      </div>

      {/* resultados */}
      {grouped.length === 0 ? (
        <p className="mt-10 text-center text-gray-500">
          {query.trim()
            ? "Nenhum preço encontrado."
            : "Digite o nome de um produto para buscar."}
        </p>
      ) : (
        <ul className="mt-4 space-y-4">
          {grouped.map((market) => (
            <li key={market.key} className="rounded-2xl border border-gray-200 p-4">
              <strong className="block text-lg text-gray-900 mb-2">{market.label}</strong>
              <ul className="space-y-1">
                {market.entries.map((e, i) => (
                  <li key={i} className="flex items-center justify-between">
                    <span className="text-gray-800">{e.listName}</span>
                    <span className="font-semibold text-gray-900">
                      R$ {(Number(e.preco) || 0).toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}

      <BottomNav activeTab="compare" />
    </div>
  );
};

export default Prices;
