// src/pages/Compare.tsx
import React, { useMemo, useState } from "react";
import { ShoppingCartIcon, BuildingStorefrontIcon } from "@heroicons/react/24/outline";
import BottomNav from "@/components/BottomNav";
import RoundCheck from "@/components/RoundCheck";
import { useData } from "@/context/DataContext";

const brl = (n: number) =>
  (Number(n) || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// normaliza string (sem acento/ç/maiúsculas)
function norm(s: string) {
  return (s || "")
    .normalize("NFD")
    // @ts-ignore
    .replace(/\p{Diacritic}/gu, "")
    .replace(/ç/gi, "c")
    .toLowerCase()
    .trim();
}

type Tab = "produtos" | "compras" | "estatisticas";

const Compare: React.FC = () => {
  const { lists, purchases } = useData();
  const [tab, setTab] = useState<Tab>("compras");

  /* ========================= PRODUTOS ========================= */
  const [query, setQuery] = useState("");
  const canSearch = query.trim().length > 0;

  type MarketRow = {
    market: string;
    price: number;
    sourceKind: "compra" | "lista";
    sourceName: string;
  };

  // nome “canônico” do item a partir dos matches
  const matchedName = useMemo(() => {
    if (!canSearch) return "";
    const q = norm(query);
    const counts = new Map<string, number>();

    const add = (nome?: string) => {
      const k = (nome || "").trim();
      if (!k) return;
      counts.set(k, (counts.get(k) || 0) + 1);
    };

    // varre compras
    for (const p of purchases) {
      for (const it of p.itens || []) {
        if (norm(it.nome).includes(q)) add(it.nome);
      }
    }
    // varre listas
    for (const l of lists) {
      for (const it of l.itens || []) {
        if (norm(it.nome).includes(q)) add(it.nome);
      }
    }

    let best = "";
    let max = -1;
    counts.forEach((c, name) => {
      if (c > max) {
        max = c;
        best = name;
      }
    });

    return best || query.trim();
  }, [canSearch, query, lists, purchases]);

  // resultados por mercado (menor preço de cada mercado)
  const produtoPorMercado: MarketRow[] = useMemo(() => {
    if (!canSearch) return [];
    const q = norm(query);
    const bestByMarket: Record<string, MarketRow> = {};

    // COMPRAS
    for (const p of purchases) {
      const market = p.market || "—";
      for (const it of p.itens || []) {
        if (!norm(it.nome).includes(q)) continue;
        const price = Number(it.preco) || 0;
        const current = bestByMarket[market];
        if (!current || price < current.price) {
          bestByMarket[market] = {
            market,
            price,
            sourceKind: "compra",
            sourceName: p.name || "Compra",
          };
        }
      }
    }

    // LISTAS (opcional; deixe se quiser considerar listas)
    for (const l of lists) {
      for (const it of l.itens || []) {
        if (!norm(it.nome).includes(q)) continue;
        const market = it.mercado || l.market || "—";
        const price = Number(it.preco) || 0;
        const current = bestByMarket[market];
        if (!current || price < current.price) {
          bestByMarket[market] = {
            market,
            price,
            sourceKind: "lista",
            sourceName: l.nome || "Lista",
          };
        }
      }
    }

    return Object.values(bestByMarket).sort((a, b) => a.price - b.price);
  }, [canSearch, query, lists, purchases]);

  const menorPrecoGlobal = useMemo(
    () => (produtoPorMercado.length ? Math.min(...produtoPorMercado.map((r) => r.price)) : null),
    [produtoPorMercado]
  );

  /* ========================= COMPRAS ========================= */
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const togglePurchase = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  };

  const selectedPurchases = useMemo(() => {
    const arr = purchases.filter((p) => selectedIds.includes(p.id));
    return arr.sort((a, b) => {
      const na = (a.name || "").toLowerCase();
      const nb = (b.name || "").toLowerCase();
      if (na !== nb) return na.localeCompare(nb);
      const ta =
        typeof a.createdAt === "number"
          ? a.createdAt
          : a.createdAt?.seconds
          ? a.createdAt.seconds * 1000
          : Date.parse(a.createdAt || "");
      const tb =
        typeof b.createdAt === "number"
          ? b.createdAt
          : b.createdAt?.seconds
          ? b.createdAt.seconds * 1000
          : Date.parse(b.createdAt || "");
      return ta - tb;
    });
  }, [purchases, selectedIds]);

  const commonRows = useMemo(() => {
    if (selectedPurchases.length !== 2) return [];
    const [A, B] = selectedPurchases;

    const mapA = new Map<string, { rotulo: string; preco: number }>();
    for (const it of A.itens || []) {
      const k = norm(it.nome);
      if (!mapA.has(k)) mapA.set(k, { rotulo: it.nome, preco: Number(it.preco) || 0 });
    }
    const mapB = new Map<string, { rotulo: string; preco: number }>();
    for (const it of B.itens || []) {
      const k = norm(it.nome);
      if (!mapB.has(k)) mapB.set(k, { rotulo: it.nome, preco: Number(it.preco) || 0 });
    }

    const commons: Array<{ nome: string; a: number; b: number }> = [];
    for (const [k, va] of mapA.entries()) {
      if (mapB.has(k)) {
        const vb = mapB.get(k)!;
        commons.push({ nome: va.rotulo || vb.rotulo, a: va.preco, b: vb.preco });
      }
    }
    return commons.sort((x, y) => norm(x.nome).localeCompare(norm(y.nome), "pt-BR", { sensitivity: "base" }));
  }, [selectedPurchases]);

  /* ========================= ESTATÍSTICAS ========================= */
  const stats = useMemo(() => {
    const counts: Record<string, { nome: string; c: number }> = {};
    const byMarket: Record<string, number> = {};
    for (const p of purchases) {
      const total =
        typeof p.total === "number"
          ? p.total
          : (p.itens || []).reduce((s, it) => s + (Number(it.preco) || 0) * (Number(it.quantidade) || 1), 0);
      const market = p.market || "—";
      byMarket[market] = (byMarket[market] || 0) + total;

      for (const it of p.itens || []) {
        const k = norm(it.nome);
        if (!counts[k]) counts[k] = { nome: it.nome, c: 0 };
        counts[k].c += 1;
      }
    }
    const topItems = Object.values(counts).sort((a, b) => b.c - a.c);
    const markets = Object.entries(byMarket).sort((a, b) => b[1] - a[1]);

    return { topItems, markets };
  }, [purchases]);

  return (
    <div className="mx-auto max-w-xl bg-white p-4 pb-28">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-gray-900">Comparar</h1>
        <img src="/LOGO_REDUZIDA.png" alt="Logo" className="h-8 w-8" />
      </div>

      {/* Tabs */}
      <div className="mb-3 flex items-center gap-8 border-b">
        <button
          className={`pb-2 text-sm ${tab === "produtos" ? "border-b-2 border-yellow-500 font-semibold text-gray-900" : "text-gray-500"}`}
          onClick={() => setTab("produtos")}
        >
          Produtos
        </button>
        <button
          className={`pb-2 text-sm ${tab === "compras" ? "border-b-2 border-yellow-500 font-semibold text-gray-900" : "text-gray-500"}`}
          onClick={() => setTab("compras")}
        >
          Compras
        </button>
        <button
          className={`pb-2 text-sm ${tab === "estatisticas" ? "border-b-2 border-yellow-500 font-semibold text-gray-900" : "text-gray-500"}`}
          onClick={() => setTab("estatisticas")}
        >
          Estatísticas
        </button>
      </div>

      {/* ======================== PRODUTOS ======================== */}
      {tab === "produtos" && (
        <>
          <div className="mb-4 flex gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-2xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-yellow-400"
              placeholder="Buscar produto..."
            />
            <button
              className="rounded-2xl bg-yellow-500 px-4 py-3 font-medium text-black"
              onClick={() => setQuery((q) => q.trim())}
            >
              Buscar
            </button>
          </div>

          {!canSearch ? (
            <p className="px-1 text-center text-sm text-gray-500">
              Digite o nome de um produto para buscar.
            </p>
          ) : produtoPorMercado.length === 0 ? (
            <p className="px-1 text-center text-sm text-gray-500">Nenhum resultado.</p>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-gray-200">
              {/* Cabeçalho agora mostra o NOME DO ITEM */}
              <div className="flex items-center justify-between border-b bg-gray-50 p-3">
                <div className="text-base font-semibold text-gray-900">{matchedName}</div>
                {menorPrecoGlobal !== null && (
                  <div className="text-sm font-semibold text-green-600">
                    Melhor preço: {brl(menorPrecoGlobal)}
                  </div>
                )}
              </div>

              {produtoPorMercado.map((r, i) => {
                const isBest = menorPrecoGlobal !== null && r.price === menorPrecoGlobal;
                return (
                  <div key={i} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-gray-900">{r.market}</div>
                      <div className={`font-semibold ${isBest ? "text-green-600" : "text-gray-900"}`}>
                        {brl(r.price)}
                      </div>
                    </div>
                    <div className="mt-1 text-sm text-gray-500">
                      {r.sourceKind === "compra" ? "Compra: " : "Lista: "}
                      {r.sourceName}
                      {isBest && (
                        <span className="ml-2 rounded bg-green-100 px-2 py-0.5 text-xs text-green-700">
                          melhor preço
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ======================== COMPRAS ======================== */}
      {tab === "compras" && (
        <>
          <p className="mb-3 px-1 text-sm text-gray-600">
            Selecione <span className="font-semibold">duas</span> compras para comparar itens em comum.
          </p>

          <div className="mb-4 space-y-3">
            {purchases.map((p) => {
              const selected = selectedIds.includes(p.id);
              const total =
                typeof p.total === "number"
                  ? p.total
                  : (p.itens || []).reduce(
                      (acc, it) => acc + (Number(it.preco) || 0) * (Number(it.quantidade) || 1),
                      0
                    );
              const created =
                typeof p.createdAt === "number"
                  ? p.createdAt
                  : p.createdAt?.seconds
                  ? p.createdAt.seconds * 1000
                  : Date.parse(p.createdAt || "");
              const date = Number.isFinite(created)
                ? new Date(created).toLocaleDateString("pt-BR")
                : "";

              return (
                <div
                  key={p.id}
                  className={`flex items-start justify-between rounded-2xl border p-4 ${selected ? "border-yellow-400 ring-1 ring-yellow-200" : "border-gray-200"}`}
                >
                  <div className="flex flex-1 items-start gap-3">
                    <RoundCheck checked={selected} onChange={() => togglePurchase(p.id)} />
                    <div>
                      <div className="font-semibold text-gray-900">{p.name || "Compra"}</div>
                      <div className="mt-0.5 text-sm text-gray-500">
                        {date} · {p.market || "—"} · {p.itemCount ?? p.itens?.length ?? 0} itens
                      </div>
                    </div>
                  </div>
                  <div className="pl-3 text-right">
                    <div className="font-semibold text-gray-900">{brl(total)}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {selectedPurchases.length === 2 ? (
            <div className="overflow-hidden rounded-2xl border border-gray-200">
              <div className="border-b bg-gray-50 p-3 text-sm font-semibold text-gray-800">
                Itens em comum ({selectedPurchases[0].name} × {selectedPurchases[1].name})
              </div>

              <div className="grid grid-cols-[1fr,120px,120px] gap-2 border-b p-3 text-xs font-medium text-gray-500">
                <div>Item</div>
                <div className="text-right">{selectedPurchases[0].name}</div>
                <div className="text-right">{selectedPurchases[1].name}</div>
              </div>

              {commonRows.length === 0 ? (
                <div className="p-4 text-sm text-gray-500">Nenhum item em comum.</div>
              ) : (
                commonRows.map((r, i) => {
                  const min = Math.min(r.a, r.b);
                  return (
                    <div key={i} className="grid grid-cols-[1fr,120px,120px] items-center gap-2 p-3">
                      <div className="font-medium text-gray-900">{r.nome}</div>
                      <div className={`text-right ${r.a <= min ? "font-semibold text-green-600" : "text-gray-700"}`}>
                        {brl(r.a)}
                      </div>
                      <div className={`text-right ${r.b <= min ? "font-semibold text-green-600" : "text-gray-700"}`}>
                        {brl(r.b)}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            <p className="px-1 text-sm text-gray-500">Escolha duas compras para ver a comparação.</p>
          )}
        </>
      )}

      {/* ======================== ESTATÍSTICAS ======================== */}
      {tab === "estatisticas" && (
        <>
          <div className="mb-4 overflow-hidden rounded-2xl border border-gray-200">
            <div className="flex items-center gap-2 border-b bg-white p-3">
              <ShoppingCartIcon className="h-5 w-5 text-yellow-500" />
              <div className="font-semibold text-gray-900">Itens mais comprados</div>
            </div>
            {stats.topItems.length === 0 ? (
              <div className="p-4 text-sm text-gray-500">Sem dados ainda.</div>
            ) : (
              stats.topItems.slice(0, 20).map((it, i) => (
                <div key={i} className="flex items-center justify-between p-3">
                  <div className="text-gray-800">{it.nome}</div>
                  <div className="text-gray-700">{it.c}x</div>
                </div>
              ))
            )}
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-200">
            <div className="flex items-center gap-2 border-b bg-white p-3">
              <BuildingStorefrontIcon className="h-5 w-5 text-yellow-500" />
              <div className="font-semibold text-gray-900">Gastos por supermercado</div>
            </div>

            {stats.markets.length === 0 ? (
              <div className="p-4 text-sm text-gray-500">Sem dados ainda.</div>
            ) : (
              <div className="p-3">
                {stats.markets.map(([market, total], i) => {
                  const max = stats.markets[0][1] || 1;
                  const pct = Math.max(3, Math.round((total / max) * 100));
                  return (
                    <div key={i} className="mb-3">
                      <div className="mb-1 flex items-center justify-between text-sm text-gray-700">
                        <span>{market}</span>
                        <span>{brl(total)}</span>
                      </div>
                      <div className="h-2 w-full rounded bg-gray-200">
                        <div className="h-2 rounded bg-yellow-500" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      <BottomNav activeTab="compare" />
    </div>
  );
};

export default Compare;
