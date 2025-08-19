// src/pages/Compare.tsx
import React, { useMemo, useState } from "react";
import BottomNav from "../components/BottomNav";
import { useData } from "../context/DataContext";
import PageHeader from "../components/ui/PageHeader";

/* ============================
   ÍCONES AMARELINHOS (inline)
   ============================ */
const YellowCartIcon: React.FC<{ className?: string }> = ({
  className = "h-5 w-5",
}) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="#EAB308"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M7 18a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm10 0a2 2 0 1 0 .001 3.999A2 2 0 0 0 17 18ZM6.2 6l.3 2H20a1 1 0 0 1 .98 1.197l-1.5 7A1 1 0 0 1 18.5 17H8a1 1 0 0 1-.98-.804L5.14 5H3a1 1 0 1 1 0-2h3a1 1 0 0 1 .98.804L7.2 6Z" />
  </svg>
);

const YellowStoreIcon: React.FC<{ className?: string }> = ({
  className = "h-5 w-5",
}) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="#EAB308"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M3 9.5V7l2.5-4h13L21 7v2.5A2.5 2.5 0 0 1 18.5 12a2.5 2.5 0 0 1-2.5-2.5A2.5 2.5 0 0 1 13.5 12 2.5 2.5 0 0 1 11 9.5 2.5 2.5 0 0 1 8.5 12 2.5 2.5 0  0 1 6 9.5 2.5 2.5 0 0 1 3 9.5ZM5 14h14v6a1 1 0 0 1-1 1h-4v-4H10v4H6a1 1 0 0 1-1-1v-6Z" />
  </svg>
);

/* ============================
   HELPERS
   ============================ */
const ns = (s?: string) =>
  (s ?? "")
    .normalize("NFD")
    // @ts-ignore
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();

const currency = (n: number) =>
  `R$ ${Number.isFinite(n) ? n.toFixed(2) : "0.00"}`;

/* ============================
   TIPOS LOCAIS
   ============================ */
type FlatItem = {
  nome: string;
  preco: number;
  mercado: string;
  unidade?: string;
  peso?: number;
  listName: string;
};

type MarketEntry = {
  preco: number;
  listName: string;
  mercado: string;
};

type ProductGroup = {
  key: string; // nome+peso+un
  itemName: string;
  pesoUnit: string; // "2kg", "300g", etc.
  entries: MarketEntry[];
};

/* ============================
   COMPONENTE
   ============================ */
const Compare: React.FC = () => {
  const { lists, purchases } = useData();
  // 👇 Inicia em "products" (Produtos)
  const [activeTab, setActiveTab] = useState<"products" | "purchases" | "stats">(
    "products"
  );
  const [query, setQuery] = useState("");

  /* ============ ABA PRODUTOS ============ */
  const allItems = useMemo<FlatItem[]>(
    () =>
      lists.flatMap((list) =>
        (list.itens || []).map((item) => ({
          nome: item.nome,
          preco: item.preco ?? 0,
          mercado: item.mercado ?? "",
          unidade: item.unidade,
          peso: item.peso,
          listName: list.nome,
        }))
      ),
    [lists]
  );

  const filtered = useMemo(() => {
    const q = ns(query);
    if (!q) return [];
    return allItems.filter((i) => ns(i.nome).includes(q));
  }, [query, allItems]);

  const productGroups = useMemo<ProductGroup[]>(() => {
    const map = new Map<string, ProductGroup>();
    for (const item of filtered) {
      const key = `${ns(item.nome)}::${String(item.peso ?? "")}::${ns(
        item.unidade
      )}`;
      if (!map.has(key)) {
        map.set(key, {
          key,
          itemName: item.nome,
          pesoUnit: `${item.peso ?? ""}${item.unidade ?? ""}`,
          entries: [],
        });
      }
      map.get(key)!.entries.push({
        preco: item.preco ?? 0,
        listName: item.listName,
        mercado: item.mercado ?? "",
      });
    }
    return Array.from(map.values()).map((g) => ({
      ...g,
      entries: g.entries.sort((a, b) => a.preco - b.preco),
    }));
  }, [filtered]);

  /* ============ ABA COMPRAS ============ */
  const [selPurchaseIds, setSelPurchaseIds] = useState<string[]>([]);
  const togglePurchase = (id: string) => {
    setSelPurchaseIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length < 2) return [...prev, id];
      return [prev[1], id];
    });
  };
  const pA = purchases?.find((p) => p.id === selPurchaseIds[0]);
  const pB = purchases?.find((p) => p.id === selPurchaseIds[1]);

  type PurchaseCompareRow = {
    key: string; // nome+peso+un
    itemName: string;
    pesoUnit: string;
    cheapest: {
      preco: number;
      market?: string;
      purchaseName: string;
    } | null;
    options: Array<{
      preco: number;
      market?: string;
      purchaseName: string;
    }>;
  };

  const purchaseRows: PurchaseCompareRow[] = useMemo(() => {
    if (!pA || !pB) return [];

    const mapA = new Map<
      string,
      { preco: number; market?: string; purchaseName: string }
    >();
    for (const it of pA.itens || []) {
      const key = `${ns(it.nome)}::${String(it.peso ?? "")}::${ns(it.unidade)}`;
      mapA.set(key, {
        preco: (it.preco ?? 0) * (it.quantidade ?? 1),
        market: it.mercado,
        purchaseName: pA.sourceRefName ?? pA.market ?? "Compra A",
      });
    }

    const rows: PurchaseCompareRow[] = [];
    for (const it of pB.itens || []) {
      const key = `${ns(it.nome)}::${String(it.peso ?? "")}::${ns(it.unidade)}`;
      if (mapA.has(key)) {
        const a = mapA.get(key)!;
        const b = {
          preco: (it.preco ?? 0) * (it.quantidade ?? 1),
          market: it.mercado,
          purchaseName: pB.sourceRefName ?? pB.market ?? "Compra B",
        };
        const itemName = it.nome ?? "";
        const pesoUnit = `${it.peso ?? ""}${it.unidade ?? ""}`;

        const options = [a, b].sort((x, y) => x.preco - y.preco);
        rows.push({
          key,
          itemName,
          pesoUnit,
          cheapest: options[0],
          options,
        });
      }
    }
    rows.sort((x, y) => x.itemName.localeCompare(y.itemName));
    return rows;
  }, [pA, pB]);

  /* ============ ABA ESTATÍSTICAS ============ */
  const stats = useMemo(() => {
    const countMap = new Map<string, number>();
    const spendMap = new Map<string, number>();

    for (const p of purchases || []) {
      for (const it of p.itens || []) {
        const name = it.nome ?? "";
        const qty = it.quantidade ?? 1;
        countMap.set(name, (countMap.get(name) ?? 0) + qty);

        const mkt = it.mercado ?? p.market ?? "—";
        const total = (it.preco ?? 0) * (it.quantidade ?? 1);
        spendMap.set(mkt, (spendMap.get(mkt) ?? 0) + total);
      }
    }

    const itemsMost = Array.from(countMap.entries())
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    const spend = Array.from(spendMap.entries())
      .map(([market, total]) => ({ market, total }))
      .sort((a, b) => b.total - a.total);

    return { itemsMost, spend };
  }, [purchases]);

  /* ============ RENDER ============ */
  return (
    <div className="p-4 pb-32 max-w-xl mx-auto bg-white space-y-6">
      {/* Header */}
      <PageHeader title="Comparar" />

      {/* Tabs */}
      <div className="flex justify-between px-6 border-b border-gray-200 pb-2">
        {(["products", "purchases", "stats"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-sm font-medium pb-1 ${
              activeTab === tab
                ? "text-yellow-500 border-b-2 border-yellow-500"
                : "text-gray-500"
            }`}
          >
            {tab === "products"
              ? "Produtos"
              : tab === "purchases"
              ? "Compras"
              : "Estatísticas"}
          </button>
        ))}
      </div>

      {/* === ABA PRODUTOS === */}
      {activeTab === "products" && (
        <div>
          <div className="mt-4 flex gap-2">
            <input
              type="text"
              placeholder="Buscar produto…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 border rounded-xl px-4 py-2 focus:ring-yellow-400"
            />
            <button className="bg-yellow-500 px-4 py-2 rounded-xl text-black font-medium">
              Buscar
            </button>
          </div>

          {productGroups.length === 0 ? (
            <p className="mt-10 text-center text-gray-500">
              {query.trim()
                ? "Nenhum produto encontrado."
                : "Digite o nome de um produto para buscar."}
            </p>
          ) : (
            <ul className="mt-6 space-y-4">
              {productGroups.map((g) => {
                const cheapest = g.entries[0];
                return (
                  <li
                    key={g.key}
                    className="border rounded-xl p-4 border-gray-200"
                  >
                    <strong className="block text-lg text-gray-800 mb-3">
                      {g.itemName} · {g.pesoUnit}
                    </strong>

                    {cheapest && (
                      <div className="rounded-lg bg-green-50 border border-green-100 p-3 mb-2">
                        <div className="flex justify-between">
                          <div className="font-medium text-gray-800">
                            {cheapest.mercado}
                            <span className="text-sm text-gray-500 ml-2">
                              ({cheapest.listName})
                            </span>
                          </div>
                          <div className="font-semibold text-green-700">
                            {currency(cheapest.preco)}
                          </div>
                        </div>
                        {g.entries.length > 1 && (
                          <div className="text-xs text-green-700 mt-1">
                            Economia de{" "}
                            {currency(
                              g.entries[1].preco - g.entries[0].preco
                            )}{" "}
                            em relação ao segundo mais barato
                          </div>
                        )}
                      </div>
                    )}

                    <div className="space-y-1">
                      {g.entries.slice(1).map((e, i) => (
                        <div
                          key={i}
                          className="flex justify-between rounded-lg px-2 py-1"
                        >
                          <span className="text-sm text-gray-700">
                            {e.mercado}{" "}
                            <span className="text-gray-400">({e.listName})</span>
                          </span>
                          <span className="text-sm font-semibold text-gray-800">
                            {currency(e.preco)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {/* === ABA COMPRAS === */}
      {activeTab === "purchases" && (
        <div className="space-y-4">
          <p className="text-gray-600">Selecione duas compras para comparar</p>

          <div className="space-y-2">
            {(purchases || []).map((p) => {
              const sel = selPurchaseIds.includes(p.id);
              const title = p.sourceRefName || p.market || "Compra";
              return (
                <button
                  key={p.id}
                  onClick={() => togglePurchase(p.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg border ${
                    sel
                      ? "bg-yellow-100 border-yellow-500"
                      : "border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-800">{title}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(
                        p.createdAt?.seconds
                          ? p.createdAt.seconds * 1000
                          : p.createdAt
                      ).toLocaleDateString()}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {pA && pB && (
            <ul className="mt-4 space-y-3">
              {purchaseRows.map((r) => (
                <li
                  key={r.key}
                  className="border rounded-xl p-4 border-gray-200"
                >
                  <strong className="block text-lg text-gray-800 mb-2">
                    {r.itemName} · {r.pesoUnit}
                  </strong>

                  {r.cheapest && (
                    <div className="rounded-lg bg-green-50 border border-green-100 p-3 mb-2">
                      <div className="flex justify-between">
                        <div className="font-medium text-gray-800">
                          {r.cheapest.market ?? "—"}
                          <span className="text-sm text-gray-500 ml-2">
                            ({r.cheapest.purchaseName})
                          </span>
                        </div>
                        <div className="font-semibold text-green-700">
                          {currency(r.cheapest.preco)}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1">
                    {r.options.slice(1).map((o, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between rounded-lg px-2 py-1"
                      >
                        <span className="text-sm text-gray-700">
                          {o.market ?? "—"}{" "}
                          <span className="text-gray-400">
                            ({o.purchaseName})
                          </span>
                        </span>
                        <span className="text-sm font-semibold text-gray-800">
                          {currency(o.preco)}
                        </span>
                      </div>
                    ))}
                  </div>
                </li>
              ))}
              {purchaseRows.length === 0 && (
                <p className="text-center text-gray-500">
                  Nenhum produto em comum entre as duas compras.
                </p>
              )}
            </ul>
          )}
        </div>
      )}

      {/* === ABA ESTATÍSTICAS === */}
      {activeTab === "stats" && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center gap-2 mb-3">
              <YellowCartIcon />
              <h2 className="text-lg font-semibold">Itens mais comprados</h2>
            </div>

            {stats.itemsMost.length === 0 ? (
              <p className="text-center text-gray-400">Sem dados.</p>
            ) : (
              <ul className="divide-y">
                {stats.itemsMost.map((it) => (
                  <li
                    key={it.name}
                    className="flex justify-between py-2 text-gray-700"
                  >
                    <span>{it.name}</span>
                    <span className="font-medium">{it.qty}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center gap-2 mb-3">
              <YellowStoreIcon />
              <h2 className="text-lg font-semibold">Gastos por supermercado</h2>
            </div>

            {stats.spend.length === 0 ? (
              <p className="text-center text-gray-400">Sem dados.</p>
            ) : (
              <div className="space-y-3">
                {(() => {
                  const max = Math.max(...stats.spend.map((s) => s.total), 1);
                  return stats.spend.map((s) => (
                    <div key={s.market}>
                      <div className="flex justify-between text-sm text-gray-700 mb-1">
                        <span>{s.market}</span>
                        <span className="font-semibold">
                          {currency(s.total)}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded">
                        <div
                          className="h-2 rounded bg-yellow-500"
                          style={{ width: `${(s.total / max) * 100}%` }}
                        />
                      </div>
                    </div>
                  ));
                })()}
              </div>
            )}
          </div>
        </div>
      )}

      <BottomNav activeTab="compare" />
    </div>
  );
};

export default Compare;
