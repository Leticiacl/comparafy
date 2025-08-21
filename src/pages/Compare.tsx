import React, { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import RoundCheck from "@/components/RoundCheck";
import { useData } from "@/context/DataContext";
import { ShoppingCartIcon, BuildingStorefrontIcon } from "@heroicons/react/24/outline";

/* ======================== helpers ======================== */
const brl = (n: number) =>
  (Number(n || 0)).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function norm(s: string) {
  return (s || "")
    .normalize("NFD")
    // @ts-ignore
    .replace(/\p{Diacritic}/gu, "")
    .replace(/ç/gi, "c")
    .toLowerCase()
    .trim();
}

const unitFactor: Record<string, number> = { kg: 1000, g: 1, l: 1000, ml: 1, un: 1 };

function variantKey(nome: string, peso?: number, unidade?: string) {
  const u = (unidade || "").toLowerCase();
  const p = peso ?? 0;
  return `${norm(nome)}|${p}|${u}`;
}
function variantLabel(nome: string, peso?: number, unidade?: string) {
  return peso ? `${nome} — ${peso} ${unidade || ""}` : nome;
}
function sameDimension(u1?: string, u2?: string) {
  const a = (u1 || "").toLowerCase();
  const b = (u2 || "").toLowerCase();
  if (!a || !b) return false;
  const weight = new Set(["kg", "g"]);
  const volume = new Set(["l", "ml"]);
  if (a === "un" || b === "un") return false;
  return (weight.has(a) && weight.has(b)) || (volume.has(a) && volume.has(b));
}
function toBase(peso: number, unidade: string) {
  const f = unitFactor[(unidade || "").toLowerCase()] || 1;
  return peso * f;
}

type Tab = "produtos" | "compras" | "estatisticas";

/* ======================== component ======================== */
const Compare: React.FC = () => {
  const { lists = [], purchases = [] } = useData();

  // inicia SEMPRE na aba "produtos" (ou usa ?tab=produtos)
  const { search } = useLocation();
  const qp = new URLSearchParams(search);
  const [tab, setTab] = useState<Tab>((qp.get("tab") as Tab) || "produtos");

  /* ========================= PRODUTOS (por variante) ========================= */
  const [query, setQuery] = useState("");
  const canSearch = query.trim().length > 0;

  type Row = {
    market: string;
    price: number;
    sourceKind: "compra" | "lista";
    sourceName: string;
    nome: string;
    peso?: number;
    unidade?: string;
  };

  type Group = {
    variant: { nome: string; peso?: number; unidade?: string };
    rows: Row[];
  };

  const produtoGrupos: Group[] = useMemo(() => {
    if (!canSearch) return [];
    const q = norm(query);

    const rows: Row[] = [];

    // compras
    for (const p of purchases) {
      for (const it of p.itens || []) {
        if (!norm(it.nome).includes(q)) continue;
        rows.push({
          market: p.market || "—",
          price: Number(it.preco) || 0,
          sourceKind: "compra",
          sourceName: p.name || "Compra",
          nome: it.nome,
          peso: it.peso,
          unidade: it.unidade,
        });
      }
    }
    // listas
    for (const l of lists) {
      for (const it of l.itens || []) {
        if (!norm(it.nome).includes(q)) continue;
        rows.push({
          market: (it as any).mercado || (l as any).market || "—",
          price: Number(it.preco) || 0,
          sourceKind: "lista",
          sourceName: l.nome || "Lista",
          nome: it.nome,
          peso: it.peso,
          unidade: it.unidade,
        });
      }
    }

    const byVariant = new Map<string, Group>();
    for (const r of rows) {
      const k = variantKey(r.nome, r.peso, r.unidade);
      const g = byVariant.get(k) || {
        variant: { nome: r.nome, peso: r.peso, unidade: r.unidade },
        rows: [],
      };
      // mantém apenas o melhor preço por mercado dentro da variante
      const existing = g.rows.find((x) => x.market === r.market);
      if (!existing || r.price < existing.price) {
        if (existing) {
          const i = g.rows.indexOf(existing);
          g.rows.splice(i, 1, r);
        } else g.rows.push(r);
      }
      byVariant.set(k, g);
    }

    return Array.from(byVariant.values()).map((g) => ({
      ...g,
      rows: g.rows.sort((a, b) => a.price - b.price),
    }));
  }, [canSearch, query, lists, purchases]);

  /* ========================= COMPRAS (tabela por variante) ========================= */
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const togglePurchase = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  };

  const selectedPurchases = useMemo(
    () => purchases.filter((p) => selectedIds.includes(p.id)),
    [purchases, selectedIds]
  );

  const compraComparacao = useMemo(() => {
    if (selectedPurchases.length !== 2) return null;
    const [A, B] = selectedPurchases;

    type V = { nome: string; peso?: number; unidade?: string; preco: number };
    const map = new Map<string, { label: string; a?: V; b?: V }>();

    const fill = (side: "a" | "b", p: typeof A) => {
      for (const it of p.itens || []) {
        const k = variantKey(it.nome, it.peso, it.unidade);
        const label = variantLabel(it.nome, it.peso, it.unidade);
        const v: V = {
          nome: it.nome,
          peso: it.peso,
          unidade: it.unidade,
          preco: Number(it.preco) || 0,
        };
        if (!map.has(k)) map.set(k, { label });
        (map.get(k) as any)[side] = v;
      }
    };
    fill("a", A);
    fill("b", B);

    const rows = Array.from(map.values()).sort((x, y) => norm(x.label).localeCompare(norm(y.label)));
    return { A, B, rows };
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
        const k = variantKey(it.nome, it.peso, it.unidade);
        if (!counts[k]) counts[k] = { nome: variantLabel(it.nome, it.peso, it.unidade), c: 0 };
        counts[k].c += 1;
      }
    }
    const topItems = Object.values(counts).sort((a, b) => b.c - a.c);
    const markets = Object.entries(byMarket).sort((a, b) => b[1] - a[1]);
    return { topItems, markets };
  }, [purchases]);

  /* ========================= render ========================= */
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
            <p className="px-1 text-center text-sm text-gray-500">Digite o nome de um produto para buscar.</p>
          ) : produtoGrupos.length === 0 ? (
            <p className="px-1 text-center text-sm text-gray-500">Nenhum resultado.</p>
          ) : (
            <div className="space-y-4">
              {produtoGrupos.map((g, gi) => {
                const best = g.rows.length ? Math.min(...g.rows.map((r) => r.price)) : null;
                return (
                  <div key={gi} className="overflow-hidden rounded-2xl border border-gray-200">
                    <div className="flex items-center justify-between border-b bg-gray-50 p-3">
                      <div className="text-base font-semibold text-gray-900">
                        {variantLabel(g.variant.nome, g.variant.peso, g.variant.unidade)}
                      </div>
                      {best !== null && (
                        <div className="text-sm font-semibold text-green-600">Melhor preço: {brl(best)}</div>
                      )}
                    </div>

                    {g.rows.map((r, i) => {
                      const isBest = best !== null && r.price === best;
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
            Selecione <span className="font-semibold">duas</span> compras para comparar itens.
          </p>

          <div className="mb-4 space-y-3">
            {(purchases || []).map((p) => {
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
              const date = Number.isFinite(created) ? new Date(created).toLocaleDateString("pt-BR") : "";

              return (
                <div
                  key={p.id}
                  className={`flex items-start justify-between rounded-2xl border p-4 ${
                    selected ? "border-yellow-400 ring-1 ring-yellow-200" : "border-gray-200"
                  }`}
                  onClick={() => togglePurchase(p.id)}
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

          {compraComparacao ? (
            <div className="overflow-hidden rounded-2xl border border-gray-200">
              <div className="grid grid-cols-[1fr,140px,140px] gap-2 border-b bg-gray-50 p-3 text-xs font-semibold text-gray-800">
                <div>Item (variante)</div>
                <div className="text-right">{compraComparacao.A.name}</div>
                <div className="text-right">{compraComparacao.B.name}</div>
              </div>

              {compraComparacao.rows.length === 0 ? (
                <div className="p-4 text-sm text-gray-500">Nenhum item em comum.</div>
              ) : (
                compraComparacao.rows.map((r, i) => {
                  const a = r.a;
                  const b = r.b;
                  const aHas = !!a;
                  const bHas = !!b;
                  const min = Math.min(a?.preco ?? Infinity, b?.preco ?? Infinity);

                  let aPer = "";
                  let bPer = "";
                  if (a && b && sameDimension(a.unidade, b.unidade) && a.peso && b.peso) {
                    const au = toBase(a.peso, a.unidade!);
                    const bu = toBase(b.peso, b.unidade!);
                    if (au > 0) aPer = brl(a.preco / (au / 1000)) + "/kg";
                    if (bu > 0) bPer = brl(b.preco / (bu / 1000)) + "/kg";
                  }

                  return (
                    <div key={i} className="grid grid-cols-[1fr,140px,140px] items-center gap-2 p-3">
                      <div className="font-medium text-gray-900">{r.label}</div>

                      <div className="text-right">
                        {aHas ? (
                          <>
                            <div className={`${a!.preco <= min ? "font-semibold text-green-600" : "text-gray-800"}`}>
                              {brl(a!.preco)}
                            </div>
                            {aPer && <div className="text-xs text-gray-500">{aPer}</div>}
                          </>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </div>

                      <div className="text-right">
                        {bHas ? (
                          <>
                            <div className={`${b!.preco <= min ? "font-semibold text-green-600" : "text-gray-800"}`}>
                              {brl(b!.preco)}
                            </div>
                            {bPer && <div className="text-xs text-gray-500">{bPer}</div>}
                          </>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
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
              stats.topItems.slice(0, 30).map((it, i) => (
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
          </div>
        </>
      )}

      <BottomNav activeTab="compare" />
    </div>
  );
};

export default Compare;
