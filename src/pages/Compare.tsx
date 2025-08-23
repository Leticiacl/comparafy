import React, { useMemo, useState } from "react";
import PageHeader from "../components/ui/PageHeader";
import BottomNav from "../components/BottomNav";
import { useData } from "../context/DataContext";
import { normalizeString } from "../utils/normalizeString";
import { formatCurrency } from "../utils/formatCurrency";
import { BuildingStorefrontIcon, CalendarDaysIcon, TagIcon } from "@heroicons/react/24/outline";

type CtxPurchase = { kind: "purchase"; purchaseName: string; market?: string; price: number };
type ProductRow = { name: string; contexts: CtxPurchase[]; bestPrice: number };

const currency = (n: number) => formatCurrency(Number(n || 0));
const parseDate = (any: any) => {
  const ms = typeof any === "number" ? any : any?.seconds ? any.seconds * 1000 : Date.parse(any || "");
  if (!Number.isFinite(ms)) return null;
  return new Date(ms);
};
const dateOnly = (any: any) => {
  const d = parseDate(any);
  return d ? d.toLocaleDateString("pt-BR") : "-";
};
const ymLabel = (d: Date) =>
  d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" }).replace(/^./, (s) => s.toUpperCase());

type AnyItem = Record<string, any>;
const getItems = (p: any): AnyItem[] => {
  const list = (p?.itens || p?.items || p?.produtos || p?.products || []) as AnyItem[];
  return Array.isArray(list) ? list : [];
};
const getName = (it: AnyItem): string =>
  String(it?.nome ?? it?.name ?? it?.descricao ?? it?.descricaoItem ?? it?.xProd ?? "").trim();
const getUnit = (it: AnyItem): string =>
  String(it?.unidade ?? it?.unit ?? it?.uCom ?? it?.uTrib ?? "").trim();
const getPrice = (it: AnyItem): number =>
  Number(it?.preco ?? it?.price ?? it?.vUnCom ?? it?.vProd ?? 0) || 0;

const lettersOnly = (s: string) => normalizeString(s).replace(/[^a-z]/g, "");
const seqN = (s: string, n: number) => {
  const t = lettersOnly(s);
  const out: string[] = [];
  for (let i = 0; i <= t.length - n; i++) out.push(t.slice(i, i + n));
  return out;
};
const hasCommonSeq = (a: string, b: string, n = 4) => {
  const A = seqN(a, n);
  const setB = new Set(seqN(b, n));
  for (const x of A) if (setB.has(x)) return true;
  return false;
};

const Compare: React.FC = () => {
  const { purchases = [] } = useData() as any;
  const [active, setActive] = useState<"produtos" | "compras" | "stats">("produtos");
  const [query, setQuery] = useState("");

  // -------- Responsividade: container maior em telas médias/grandes --------
  const containerClass =
    "mx-auto w-full max-w-screen-sm md:max-w-screen-md lg:max-w-screen-lg xl:max-w-screen-xl bg-white px-4 md:px-6 pb-28";

  const products: ProductRow[] = useMemo(() => {
    const map = new Map<string, ProductRow>();
    for (const p of (purchases as any[]) || []) {
      for (const it of getItems(p)) {
        const rawName = getName(it);
        if (!rawName) continue;
        const key = normalizeString(rawName);
        const price = getPrice(it);
        const row = map.get(key) || { name: rawName, contexts: [], bestPrice: Infinity };
        row.name = row.name.length >= rawName.length ? row.name : rawName;
        row.contexts.push({
          kind: "purchase",
          purchaseName: String(p?.name ?? p?.nome ?? "Compra"),
          market: (p as any)?.market ?? (p as any)?.mercado,
          price,
        });
        row.bestPrice = Math.min(row.bestPrice, price || Infinity);
        map.set(key, row);
      }
    }
    const q = normalizeString(query);
    const arr = Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
    return q ? arr.filter((r) => normalizeString(r.name).includes(q)) : arr;
  }, [purchases, query]);

  type Row = {
    key: string;
    display: string;
    a: number;
    b: number;
    aPurchaseName: string;
    bPurchaseName: string;
    aMarket?: string;
    bMarket?: string;
  };
  const [selPurch, setSelPurch] = useState<string[]>([]);
  const togglePurch = (id: string) => {
    setSelPurch((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  };
  const selectedPurchases = useMemo(() => purchases.filter((p: any) => selPurch.includes(p.id)), [purchases, selPurch]);

  const commonPurchRows: Row[] = useMemo(() => {
    if (selectedPurchases.length !== 2) return [];
    const [A, B] = selectedPurchases as any[];
    const itemsA = getItems(A).map((it) => {
      const name = getName(it);
      const unit = getUnit(it);
      const display = unit ? `${name} — ${unit}` : name;
      return { name, full: `${name} ${unit}`.trim(), display, price: getPrice(it) };
    });
    const itemsB = getItems(B).map((it) => {
      const name = getName(it);
      const unit = getUnit(it);
      const display = unit ? `${name} — ${unit}` : name;
      return { name, full: `${name} ${unit}`.trim(), display, price: getPrice(it) };
    });
    const usedB = new Set<number>();
    const rows: Row[] = [];
    for (let i = 0; i < itemsA.length; i++) {
      const a = itemsA[i];
      let bestJ = -1;
      let matched = false;
      for (let j = 0; j < itemsB.length; j++) {
        if (usedB.has(j)) continue;
        const b = itemsB[j];
        if (hasCommonSeq(a.name, b.name, 4)) {
          bestJ = j; matched = true; break;
        }
      }
      if (matched && bestJ >= 0) {
        const b = itemsB[bestJ];
        usedB.add(bestJ);
        const display = a.display.length >= b.display.length ? a.display : b.display;
        rows.push({
          key: `${normalizeString(a.full)}__${normalizeString(b.full)}`,
          display,
          a: a.price,
          b: b.price,
          aPurchaseName: String(A?.name ?? "Compra A"),
          bPurchaseName: String(B?.name ?? "Compra B"),
          aMarket: String(A?.market ?? "—"),
          bMarket: String(B?.market ?? "—"),
        });
      }
    }
    rows.sort((x, y) => x.display.localeCompare(y.display));
    return rows;
  }, [selectedPurchases]);

  const stats = useMemo(() => {
    const itemCount = new Map<string, { name: string; count: number }>();
    for (const p of (purchases as any[]) || []) {
      for (const it of getItems(p)) {
        const nm = getName(it);
        if (!nm) continue;
        const key = normalizeString(nm);
        const qnty = Number((it as any)?.quantidade ?? (it as any)?.qty ?? 1) || 1;
        const entry = itemCount.get(key) || { name: nm, count: 0 };
        entry.name = entry.name.length >= nm.length ? entry.name : nm;
        entry.count += qnty;
        itemCount.set(key, entry);
      }
    }
    const topItems = Array.from(itemCount.values()).sort((a, b) => b.count - a.count);

    const byMarket = new Map<string, number>();
    for (const p of (purchases as any[]) || []) {
      const market = String(p?.market ?? "—");
      byMarket.set(market, (byMarket.get(market) || 0) + (Number(p?.total) || 0));
    }
    const spendByMarket = Array.from(byMarket.entries())
      .map(([market, total]) => ({ market, total }))
      .sort((a, b) => b.total - a.total);

    const byMonth = new Map<string, { label: string; total: number; date: Date }>();
    for (const p of (purchases as any[]) || []) {
      const d = parseDate(p?.createdAt);
      if (!d) continue;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const entry = byMonth.get(key) || { label: ymLabel(d), total: 0, date: d };
      entry.total += Number(p?.total) || 0;
      byMonth.set(key, entry);
    }
    const spendByMonth = Array.from(byMonth.values()).sort((a, b) => a.date.getTime() - b.date.getTime());

    return { topItems, spendByMarket, spendByMonth };
  }, [purchases]);

  return (
    <div className={containerClass}>
      <PageHeader title="Comparar" />

      {/* Tabs */}
      <div className="mt-2 flex gap-2">
        <button
          className={`flex-1 rounded-xl border px-3 py-2 text-sm font-medium ${active === "produtos" ? "bg-white shadow" : "bg-gray-100 text-gray-600"}`}
          onClick={() => setActive("produtos")}
        >
          Produtos
        </button>
        <button
          className={`flex-1 rounded-xl border px-3 py-2 text-sm font-medium ${active === "compras" ? "bg-white shadow" : "bg-gray-100 text-gray-600"}`}
          onClick={() => setActive("compras")}
        >
          Compras
        </button>
        <button
          className={`flex-1 rounded-xl border px-3 py-2 text-sm font-medium ${active === "stats" ? "bg-white shadow" : "bg-gray-100 text-gray-600"}`}
          onClick={() => setActive("stats")}
        >
          Estatísticas
        </button>
      </div>

      {/* PRODUTOS */}
      {active === "produtos" && (
        <div className="mt-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nome..."
            className="w-full rounded-2xl border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-yellow-400"
          />
          {products.length === 0 ? (
            <p className="mt-4 text-sm text-gray-500">Digite o nome do produto para buscar.</p>
          ) : (
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              {products.map((prod) => (
                <div key={prod.name} className="rounded-2xl border border-gray-200 p-3">
                  <div className="mb-2 font-semibold text-gray-900">{prod.name}</div>
                  <div className="space-y-2">
                    {prod.contexts.map((ctx, idx) => {
                      const price = ctx.price || 0;
                      const isBest = Number(price) === prod.bestPrice && prod.bestPrice !== Infinity;
                      return (
                        <div key={idx} className="flex items-center justify-between">
                          <div className="text-sm text-gray-600">
                            Compra {ctx.purchaseName}{ctx.market ? ` · ${ctx.market}` : ""}
                          </div>
                          <div className={`text-sm font-semibold ${isBest ? "text-green-600" : "text-gray-900"}`}>
                            {currency(price)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* COMPRAS */}
      {active === "compras" && (
        <div className="mt-3">
          <div className="mb-3 text-sm text-gray-600">Selecione <b>2 compras</b> para comparar.</div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {(purchases as any[]).map((p) => {
              const selected = selPurch.includes(p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => togglePurch(p.id)}
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    selected ? "border-yellow-500 bg-yellow-50 ring-2 ring-yellow-400" : "border-gray-200 bg-white hover:bg-gray-50"
                  }`}
                >
                  <div className="font-medium text-gray-900 line-clamp-1">{p.name || "Compra"}</div>
                  <div className="mt-0.5 text-sm text-gray-500">
                    {dateOnly(p.createdAt)} · {p.market || "—"} · {getItems(p).length} itens
                  </div>
                </button>
              );
            })}
          </div>
          {selectedPurchases.length === 2 && (
            <div className="mt-4">
              <div className="mb-2 text-sm text-gray-600">
                Comparando: <b>{String(selectedPurchases[0]?.name ?? "Compra A")}</b> ×{" "}
                <b>{String(selectedPurchases[1]?.name ?? "Compra B")}</b>
              </div>
              {commonPurchRows.length === 0 ? (
                <div className="rounded-2xl border border-gray-200 p-4 text-sm text-gray-500">
                  Estas compras não possuem itens em comum.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {commonPurchRows.map((r) => {
                    const cheaper = r.a < r.b ? "a" : r.b < r.a ? "b" : "eq";
                    const baseRow = "flex items-center justify-between rounded-lg border px-3 py-2";
                    const cheapRow = baseRow + " border-green-100 bg-green-50";
                    const normRow  = baseRow + " border-gray-100 bg-gray-50";
                    return (
                      <div key={r.key} className="rounded-2xl border border-gray-200 p-3">
                        <div className="mb-2 font-medium text-gray-900">{r.display}</div>
                        <div className={cheaper === "a" ? cheapRow : normRow}>
                          <div className="text-sm text-gray-600">{r.aPurchaseName} · {r.aMarket || "—"}</div>
                          <div className={`text-sm font-semibold ${cheaper === "a" ? "text-green-700" : "text-gray-900"}`}>
                            {currency(r.a)}{" "}
                            {cheaper === "a" && (
                              <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                                mais barato
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="mt-2"></div>
                        <div className={cheaper === "b" ? cheapRow : normRow}>
                          <div className="text-sm text-gray-600">{r.bPurchaseName} · {r.bMarket || "—"}</div>
                          <div className={`text-sm font-semibold ${cheaper === "b" ? "text-green-700" : "text-gray-900"}`}>
                            {currency(r.b)}{" "}
                            {cheaper === "b" && (
                              <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                                mais barato
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ESTATÍSTICAS */}
      {active === "stats" && (
        <div className="mt-3 space-y-6">
          <section>
            <h3 className="mb-2 text-base font-semibold text-gray-900">Gasto por mercado</h3>
            {(stats.spendByMarket.length === 0) ? (
              <div className="rounded-2xl border border-gray-200 p-4 text-sm text-gray-500">
                Sem compras registradas ainda.
              </div>
            ) : (
              <div className="divide-y rounded-2xl border border-gray-200 bg-white">
                {stats.spendByMarket.map((m: any) => (
                  <div key={m.market} className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <BuildingStorefrontIcon className="h-5 w-5 text-yellow-500" />
                      <span className="text-gray-900">{m.market}</span>
                    </div>
                    <div className="font-semibold">{currency(m.total)}</div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <h3 className="mb-2 text-base font-semibold text-gray-900">Gasto por mês</h3>
            {(stats.spendByMonth.length === 0) ? (
              <div className="rounded-2xl border border-gray-200 p-4 text-sm text-gray-500">
                Sem compras registradas ainda.
              </div>
            ) : (
              <div className="divide-y rounded-2xl border border-gray-200 bg-white">
                {stats.spendByMonth.map((m: any) => (
                  <div key={m.label} className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <CalendarDaysIcon className="h-5 w-5 text-yellow-500" />
                      <span className="text-gray-900">{m.label}</span>
                    </div>
                    <div className="font-semibold">{currency(m.total)}</div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <h3 className="mb-2 text-base font-semibold text-gray-900">Itens mais comprados</h3>
            {stats.topItems.length === 0 ? (
              <div className="rounded-2xl border border-gray-200 p-4 text-sm text-gray-500">
                Sem compras registradas ainda.
              </div>
            ) : (
              <div className="divide-y rounded-2xl border border-gray-200 bg-white">
                {stats.topItems.map((it: any, idx: number) => (
                  <div key={it.name + idx} className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <TagIcon className="h-5 w-5 text-yellow-500" />
                      <span className="text-gray-900">{it.name}</span>
                    </div>
                    <div className="text-sm text-gray-600">{it.count}×</div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      <BottomNav activeTab="compare" />
    </div>
  );
};

export default Compare;
