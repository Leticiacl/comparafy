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

  // container responsivo + safe-area topo + espaço p/ BottomNav
  const containerClass =
    "mx-auto w-full max-w-screen-sm md:max-w-screen-md lg=max-w-screen-lg xl=max-w-screen-xl bg-white px-4 md:px-6 pt-safe pb-[88px]";

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

      {/* …restante inalterado… (lista de produtos, comparação, estatísticas) */}

      <BottomNav activeTab="compare" />
    </div>
  );
};

export default Compare;
