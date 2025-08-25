import React, { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import PageHeader from "@/components/ui/PageHeader";
import RoundCheck from "@/components/RoundCheck";
import { useData } from "@/context/DataContext";
import { ShoppingCartIcon, BuildingStorefrontIcon, CalendarDaysIcon } from "@heroicons/react/24/outline";

type Tab = "produtos" | "compras" | "estatisticas";
const brl = (n: number) => (Number(n || 0)).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function norm(s: string) {
  return (s || "")
    .normalize("NFD")
    // @ts-ignore
    .replace(/\p{Diacritic}/gu, "")
    .replace(/ç/gi, "c")
    .toLowerCase()
    .trim();
}
function hasCommon4(a: string, b: string) {
  const x = norm(a);
  const y = norm(b);
  if (!x || !y) return false;
  const [shorter, longer] = x.length <= y.length ? [x, y] : [y, x];
  for (let i = 0; i <= shorter.length - 4; i++) {
    const sub = shorter.slice(i, i + 4);
    if (longer.includes(sub)) return true;
  }
  return false;
}

const Compare: React.FC = () => {
  const { lists = [], purchases = [] } = useData();

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
  type Group = { variant: { nome: string; peso?: number; unidade?: string }; rows: Row[] };

  const produtoGrupos: Group[] = useMemo(() => {
    if (!canSearch) return [];
    const q = norm(query);
    const rows: Row[] = [];

    for (const p of purchases) {
      for (const it of p.itens || []) {
        if (!norm(it.nome).includes(q)) continue;
        rows.push({ market: p.market || "—", price: Number(it.preco) || 0, sourceKind: "compra", sourceName: p.name || "Compra", nome: it.nome, peso: it.peso, unidade: it.unidade });
      }
    }
    for (const l of lists) {
      for (const it of l.itens || []) {
        if (!norm(it.nome).includes(q)) continue;
        rows.push({ market: it.mercado || "—", price: Number(it.preco) || 0, sourceKind: "lista", sourceName: l.nome || "Lista", nome: it.nome, peso: it.peso, unidade: it.unidade });
      }
    }

    const map = new Map<string, Group>();
    for (const r of rows) {
      const k = `${norm(r.nome)}|${r.peso ?? 0}|${(r.unidade || "").toLowerCase()}`;
      if (!map.has(k)) map.set(k, { variant: { nome: r.nome, peso: r.peso, unidade: r.unidade }, rows: [] });
      map.get(k)!.rows.push(r);
    }
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
  const selectedPurchases = useMemo(() => purchases.filter((p) => selectedIds.includes(p.id)), [purchases, selectedIds]);

  // Somente itens repetidos, via substring >= 4 chars
  const compraComparacao = useMemo(() => {
    if (selectedPurchases.length !== 2) return null;
    const [A, B] = selectedPurchases;

    type V = { nome: string; preco: number };
    type RowComp = { label: string; a?: V; b?: V };

    const rows: RowComp[] = [];
    const usedB = new Set<number>();

    (A.itens || []).forEach((ia: any) => {
      const na = ia?.nome || "";
      let matchIndex = -1;
      (B.itens || []).forEach((ib: any, j: number) => {
        if (usedB.has(j)) return;
        if (hasCommon4(na, ib?.nome || "")) matchIndex = (matchIndex === -1 ? j : matchIndex);
      });
      if (matchIndex >= 0) {
        const ib = (B.itens || [])[matchIndex];
        usedB.add(matchIndex);
        rows.push({
          label: na.length >= (ib?.nome || "").length ? na : ib?.nome || na,
          a: { nome: na, preco: Number(ia?.preco) || 0 },
          b: { nome: ib?.nome || "", preco: Number(ib?.preco) || 0 },
        });
      }
    });

    rows.sort((x, y) => norm(x.label).localeCompare(norm(y.label)));
    return { A, B, rows };
  }, [selectedPurchases]);

  /* ========================= ESTATÍSTICAS ========================= */
  const stats = useMemo(() => {
    const byMarket: Record<string, number> = {};
    const byMonth: Record<string, number> = {}; // AAAA-MM -> total
    const counts: Record<string, { nome: string; c: number }> = {};

    for (const p of purchases) {
      const total =
        typeof p.total === "number"
          ? p.total
          : (p.itens || []).reduce((s, it) => s + (Number(it.preco) || 0) * (Number(it.quantidade) || 1), 0);

      const market = p.market || "—";
      byMarket[market] = (byMarket[market] || 0) + total;

      const ms = typeof p.createdAt === "number" ? p.createdAt : (p as any)?.createdAt?.seconds ? (p as any).createdAt.seconds * 1000 : Date.parse(p.createdAt as any);
      const d = Number.isFinite(ms) ? new Date(ms) : new Date();
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      byMonth[key] = (byMonth[key] || 0) + total;

      for (const it of p.itens || []) {
        const k = norm(it.nome);
        if (!counts[k]) counts[k] = { nome: it.nome, c: 0 };
        counts[k].c += 1;
      }
    }

    const months = Object.entries(byMonth).sort((a, b) => a[0].localeCompare(b[0]));
    const markets = Object.entries(byMarket).sort((a, b) => (b[1] as number) - (a[1] as number));
    const topItems = Object.values(counts).sort((a, b) => b.c - a.c);

    return { months, markets, topItems };
  }, [purchases]);

  const monthLabel = (key: string) => {
    const [y, m] = key.split("-");
    const d = new Date(Number(y), Number(m) - 1, 1);
    return d.toLocaleDateString("pt-BR", { month: "short", year: "numeric" });
  };

  return (
    <main className="mx-auto w-full max-w-screen-sm md:max-w-screen-md lg:max-w-screen-lg xl:max-w-screen-xl bg-white px-4 md:px-6 pt-safe pb-[88px]">
      <PageHeader title="Comparar" />

      <div className="mb-4 grid grid-cols-3 gap-2 rounded-xl bg-gray-100 p-1 text-sm">
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

      {/* ------------------------ PRODUTOS ------------------------ */}
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
                        {g.variant.peso ? `${g.variant.nome} — ${g.variant.peso} ${g.variant.unidade || ""}` : g.variant.nome}
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

      {/* ------------------------ COMPRAS ------------------------ */}
      {tab === "compras" && (
        <>
          <div className="mb-3 text-sm text-gray-600">Selecione até duas compras para comparar.</div>
          <div className="mb-4 space-y-2">
            {purchases.map((p) => {
              const checked = selectedIds.includes(p.id);
              return (
                <div
                  key={p.id}
                  onClick={() => togglePurchase(p.id)}
                  className="flex cursor-pointer items-center justify-between rounded-xl border p-3 active:scale-[.995]"
                >
                  <div className="flex items-center gap-3">
                    <RoundCheck checked={checked} onChange={() => togglePurchase(p.id)} />
                    <div>
                      <div className="font-medium text-gray-900">{p.name || "Compra"}</div>
                      <div className="text-sm text-gray-500">{p.market || "—"} · {(p.itens || []).length} itens</div>
                    </div>
                  </div>
                  <div className="font-semibold text-gray-900">{brl(Number(p.total) || 0)}</div>
                </div>
              );
            })}
          </div>

          {compraComparacao ? (
            compraComparacao.rows.length === 0 ? (
              <p className="px-1 text-sm text-gray-500">As compras selecionadas não têm itens em comum.</p>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-gray-200">
                <div className="grid grid-cols-[1fr,140px,140px] items-center gap-2 border-b bg-white p-3 text-sm font-semibold">
                  <div>Produto</div>
                  <div className="text-right">{compraComparacao.A.name}</div>
                  <div className="text-right">{compraComparacao.B.name}</div>
                </div>
                {compraComparacao.rows.map((r, i) => {
                  const a = r.a, b = r.b;
                  const min = Math.min(a?.preco ?? Infinity, b?.preco ?? Infinity);
                  return (
                    <div key={i} className="grid grid-cols-[1fr,140px,140px] items-center gap-2 p-3">
                      <div className="font-medium text-gray-900">{r.label}</div>
                      <div className="text-right">
                        {a ? <div className={a.preco <= min ? "font-semibold text-green-600" : "text-gray-800"}>{brl(a.preco)}</div> : <span className="text-gray-400">—</span>}
                      </div>
                      <div className="text-right">
                        {b ? <div className={b.preco <= min ? "font-semibold text-green-600" : "text-gray-800"}>{brl(b.preco)}</div> : <span className="text-gray-400">—</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            <p className="px-1 text-sm text-gray-500">Escolha duas compras para ver a comparação.</p>
          )}
        </>
      )}

      {/* ---------------------- ESTATÍSTICAS --------------------- */}
      {tab === "estatisticas" && (
        <>
          {/* Gastos por mês */}
          <div className="mb-4 overflow-hidden rounded-2xl border border-gray-200">
            <div className="flex items-center gap-2 border-b bg-white p-3">
              <CalendarDaysIcon className="h-5 w-5 text-yellow-500" />
              <div className="font-semibold text-gray-900">Gastos por mês</div>
            </div>
            <div className="p-3">
              {stats.months.length === 0 ? (
                <div className="text-sm text-gray-500">Sem dados ainda.</div>
              ) : (
                stats.months.map(([key, total], i) => {
                  const max = stats.months.reduce((m, [, t]) => Math.max(m, t as number), 1);
                  const pct = Math.max(3, Math.round(((total as number) / max) * 100));
                  return (
                    <div key={i} className="mb-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="text-gray-800">{monthLabel(key)}</div>
                        <div className="font-semibold text-gray-900">{brl(total as number)}</div>
                      </div>
                      <div className="mt-1 h-2 w-full rounded bg-gray-100">
                        <div className="h-2 rounded bg-yellow-500" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Gastos por mercado */}
          <div className="mb-4 overflow-hidden rounded-2xl border border-gray-200">
            <div className="flex items-center gap-2 border-b bg-white p-3">
              <BuildingStorefrontIcon className="h-5 w-5 text-yellow-500" />
              <div className="font-semibold text-gray-900">Gastos por mercado</div>
            </div>
            <div className="p-3">
              {stats.markets.length === 0 ? (
                <div className="text-sm text-gray-500">Sem dados ainda.</div>
              ) : (
                stats.markets.map(([market, total], i) => {
                  const max = stats.markets[0]?.[1] || 1;
                  const pct = Math.max(3, Math.round((Number(total) / Number(max)) * 100));
                  return (
                    <div key={i} className="mb-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="text-gray-800">{market}</div>
                        <div className="font-semibold text-gray-900">{brl(total as number)}</div>
                      </div>
                      <div className="mt-1 h-2 w-full rounded bg-gray-100">
                        <div className="h-2 rounded bg-yellow-500" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Itens mais comprados */}
          <div className="overflow-hidden rounded-2xl border border-gray-200">
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
        </>
      )}

      <BottomNav activeTab="compare" />
    </main>
  );
};

export default Compare;
