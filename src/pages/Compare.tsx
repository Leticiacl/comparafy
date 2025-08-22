// src/pages/Compare.tsx
import React, { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import BottomNav from "../components/BottomNav";
import PageHeader from "../components/ui/PageHeader";
import RoundCheck from "../components/RoundCheck";
import { useData } from "../context/DataContext";
import { ShoppingCartIcon, BuildingStorefrontIcon } from "@heroicons/react/24/outline";

type Tab = "produtos" | "compras" | "estatisticas";

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

function variantKey(nome: string, peso?: number, unidade?: string) {
  const u = (unidade || "").toLowerCase();
  const p = peso ?? 0;
  return `${norm(nome)}|${p}|${u}`;
}

function variantLabel(nome: string, peso?: number, unidade?: string) {
  return peso ? `${nome} — ${peso} ${unidade || ""}` : nome;
}

const Compare: React.FC = () => {
  const { lists = [], purchases = [] } = useData();

  // qual aba abrir
  const { search } = useLocation();
  const qp = new URLSearchParams(search);
  const [tab, setTab] = useState<Tab>((qp.get("tab") as Tab) || "produtos");

  /* ========================= PRODUTOS ========================= */
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
    // listas (preços cadastrados nas listas)
    for (const l of lists) {
      for (const it of l.itens || []) {
        if (!norm(it.nome).includes(q)) continue;
        rows.push({
          market: it.mercado || "—",
          price: Number(it.preco) || 0,
          sourceKind: "lista",
          sourceName: l.nome || "Lista",
          nome: it.nome,
          peso: it.peso,
          unidade: it.unidade,
        });
      }
    }

    // agrupa por variante (nome + peso + unidade)
    const map = new Map<string, Group>();
    for (const r of rows) {
      const k = variantKey(r.nome, r.peso, r.unidade);
      if (!map.has(k))
        map.set(k, { variant: { nome: r.nome, peso: r.peso, unidade: r.unidade }, rows: [] });
      map.get(k)!.rows.push(r);
    }

    // ordena por nome
    const gs = Array.from(map.values());
    gs.sort((a, b) => norm(a.variant.nome).localeCompare(norm(b.variant.nome)));
    return gs;
  }, [canSearch, query, purchases, lists]);

  /* ========================= COMPRAS (comparar 2) ========================= */
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
      <PageHeader title="Comparar" />

      {/* Abas */}
      <div className="mb-4 grid grid-cols-3 rounded-xl bg-gray-100 p-1 text-sm">
        {(["produtos", "compras", "estatisticas"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-lg py-2 font-medium ${tab === t ? "bg-white shadow" : "text-gray-600"}`}
          >
            {t === "produtos" ? "Produtos" : t === "compras" ? "Compras" : "Estatísticas"}
          </button>
        ))}
      </div>

      {/* ======================== PRODUTOS ======================== */}
      {tab === "produtos" && (
        <>
          <div className="mb-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nome…"
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          {!canSearch ? (
            <p className="text-sm text-gray-500">Digite o nome do produto para buscar.</p>
          ) : produtoGrupos.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhum resultado encontrado.</p>
          ) : (
            <div className="space-y-4">
              {produtoGrupos.map((g, i) => {
                const min = Math.min(...g.rows.map((r) => r.price || 0));
                return (
                  <div key={i} className="overflow-hidden rounded-2xl border border-gray-200">
                    <div className="border-b bg-white p-3">
                      <div className="font-semibold text-gray-900">
                        {variantLabel(g.variant.nome, g.variant.peso, g.variant.unidade)}
                      </div>
                    </div>
                    {g.rows
                      .sort((a, b) => a.price - b.price)
                      .map((r, j) => (
                        <div key={j} className="flex items-center justify-between p-3">
                          <div className="text-gray-800">{r.market}</div>
                          <div className={r.price <= min ? "font-semibold text-green-600" : "text-gray-900"}>
                            {brl(r.price)}
                          </div>
                        </div>
                      ))}
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
          <div className="mb-3 text-sm text-gray-600">Selecione até duas compras para comparar.</div>
          <div className="mb-4 space-y-2">
            {purchases.map((p) => {
              const checked = selectedIds.includes(p.id);
              return (
                <label key={p.id} className="flex items-center justify-between rounded-xl border p-3 active:scale-[.995]">
                  <div className="flex items-center gap-3">
                    <RoundCheck checked={checked} onChange={() => togglePurchase(p.id)} />
                    <div>
                      <div className="font-medium text-gray-900">{p.name || "Compra"}</div>
                      <div className="text-sm text-gray-500">
                        {p.market || "—"} · {(p.itens || []).length} itens
                      </div>
                    </div>
                  </div>
                  <div className="font-semibold text-gray-900">{brl(Number(p.total) || 0)}</div>
                </label>
              );
            })}
          </div>

          {compraComparacao ? (
            <div className="overflow-hidden rounded-2xl border border-gray-200">
              <div className="grid grid-cols-[1fr,140px,140px] items-center gap-2 border-b bg-white p-3 text-sm font-semibold">
                <div>Produto</div>
                <div className="text-right">{compraComparacao.A.name}</div>
                <div className="text-right">{compraComparacao.B.name}</div>
              </div>
              {compraComparacao.rows.map((r, i) => {
                const a: any = (r as any).a;
                const b: any = (r as any).b;
                const aHas = !!a;
                const bHas = !!b;
                const min = Math.min(a?.preco ?? Infinity, b?.preco ?? Infinity);
                return (
                  <div key={i} className="grid grid-cols-[1fr,140px,140px] items-center gap-2 p-3">
                    <div className="font-medium text-gray-900">{r.label}</div>

                    <div className="text-right">
                      {aHas ? (
                        <div className={`${a!.preco <= min ? "font-semibold text-green-600" : "text-gray-800"}`}>
                          {brl(a!.preco)}
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </div>

                    <div className="text-right">
                      {bHas ? (
                        <div className={`${b!.preco <= min ? "font-semibold text-green-600" : "text-gray-800"}`}>
                          {brl(b!.preco)}
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </div>
                  </div>
                );
              })}
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
                  <div key={i} className="mb-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="text-gray-800">{market}</div>
                      <div className="text-gray-900 font-semibold">{brl(total)}</div>
                    </div>
                    <div className="mt-1 h-2 w-full rounded bg-gray-100">
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
