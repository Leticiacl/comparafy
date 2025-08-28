import React, { useMemo, useState } from "react";
import BottomNav from "@/components/BottomNav";
import PageHeader from "@/components/ui/PageHeader";
import { useData } from "@/context/DataContext";
import {
  CalendarDaysIcon,
  BuildingStorefrontIcon,
  BanknotesIcon,
  CubeIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import Sparkline from "@/components/ui/Sparkline";
import { categorize } from "@/utils/category";

type Tab = "produtos" | "compras" | "estatisticas";
type PeriodKey = "none" | "30" | "60" | "90" | "max";

const brl = (n: number) =>
  Number(n || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const norm = (s: string) =>
  (s || "")
    .normalize("NFD")
    // @ts-ignore
    .replace(/\p{Diacritic}/gu, "")
    .replace(/ç/gi, "c")
    .toLowerCase()
    .trim();

const toDate = (v: any): Date => {
  if (v instanceof Date) return v;
  if (v?.seconds) return new Date(v.seconds * 1000);
  if (typeof v === "number") return new Date(v);
  const d = new Date(v);
  return isNaN(d.getTime()) ? new Date() : d;
};
const startOfDay = (d: Date) => { const x = new Date(d); x.setHours(0,0,0,0); return x; };
const endOfDay   = (d: Date) => { const x = new Date(d); x.setHours(23,59,59,999); return x; };
const subDays    = (d: Date, days: number) => { const x = new Date(d); x.setDate(x.getDate() - days); return x; };

export default function Compare() {
  const { purchases = [] } = useData();
  const [tab, setTab] = useState<Tab>("produtos");

  /* ------------------------- PRODUTOS ------------------------- */
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"az" | "min" | "max">("az");
  const [histPeriod, setHistPeriod] = useState<PeriodKey>("none"); // “Nenhum” por padrão

  // busca por prefixo de palavra (tokens precisam bater no início de alguma palavra do nome)
  const wordPrefixMatch = (name: string, q: string) => {
    const tokens = norm(q).split(/\s+/).filter(Boolean);
    if (!tokens.length) return true;
    const words = norm(name).split(/[^a-z0-9]+/).filter(Boolean);
    return tokens.every((t) => words.some((w) => w.startsWith(t)));
  };

  const now = new Date();
  const histEnd = endOfDay(now);
  const histStart =
    histPeriod === "max"
      ? new Date(0)
      : histPeriod === "none"
      ? new Date(0)
      : startOfDay(subDays(now, Number(histPeriod) - 1));

  type Row = { market: string; nome: string; preco: number; date: Date };
  type Group = { nome: string; rows: Row[] };

  const { produtoGrupos, historyMap } = useMemo(() => {
    const rows: Row[] = [];
    const history = new Map<string, number[]>(); // key: norm(nome)|market -> [prices]

    if (histPeriod === "none") {
      // Sem histórico: apenas último preço por produto×mercado
      const latest = new Map<string, Row>(); // key: norm(nome)|market
      for (const p of purchases) {
        const d = toDate(p.createdAt);
        for (const it of p.itens || []) {
          if (query && !wordPrefixMatch(it.nome, query)) continue;

          const total =
            (typeof it.total === "number" && it.total) ||
            (Number(it.preco) || 0) * (Number(it.quantidade) || 1);
          const unit =
            Number(it.preco) ||
            (total && Number(it.quantidade) ? total / Number(it.quantidade) : 0);
          const price = +((unit || total) || 0).toFixed(2);
          const market = p.market || "—";
          const key = `${norm(it.nome)}|${market}`;

          const row: Row = { market, nome: it.nome, preco: price, date: d };
          const prev = latest.get(key);
          if (!prev || d.getTime() > prev.date.getTime()) latest.set(key, row);
        }
      }
      rows.push(...latest.values());
    } else {
      // Com histórico: restringe pela janela e acumula séries
      for (const p of purchases) {
        const d = toDate(p.createdAt);
        if (d < histStart || d > histEnd) continue;

        for (const it of p.itens || []) {
          if (query && !wordPrefixMatch(it.nome, query)) continue;

          const total =
            (typeof it.total === "number" && it.total) ||
            (Number(it.preco) || 0) * (Number(it.quantidade) || 1);
          const unit =
            Number(it.preco) ||
            (total && Number(it.quantidade) ? total / Number(it.quantidade) : 0);
          const price = +((unit || total) || 0).toFixed(2);
          const market = p.market || "—";
          rows.push({ market, nome: it.nome, preco: price, date: d });

          const hKey = `${norm(it.nome)}|${market}`;
          if (!history.has(hKey)) history.set(hKey, []);
          history.get(hKey)!.push(price);
        }
      }
      for (const [k, arr] of history) history.set(k, arr.slice(-20)); // limita a 20
    }

    // grupos por produto
    const map = new Map<string, Group>();
    for (const r of rows) {
      const key = norm(r.nome);
      if (!map.has(key)) map.set(key, { nome: r.nome, rows: [] });
      map.get(key)!.rows.push(r);
    }
    let groups = Array.from(map.values());

    groups = groups.sort((a, b) => {
      if (sort === "az") return norm(a.nome).localeCompare(norm(b.nome));
      const minA = Math.min(...a.rows.map((r) => r.preco));
      const minB = Math.min(...b.rows.map((r) => r.preco));
      if (sort === "min") return minA - minB;
      const maxA = Math.max(...a.rows.map((r) => r.preco));
      const maxB = Math.max(...b.rows.map((r) => r.preco));
      return maxB - maxA;
    });

    return { produtoGrupos: groups, historyMap: history };
  }, [purchases, query, sort, histPeriod, histStart.getTime(), histEnd.getTime()]);

  /* -------------------------- COMPRAS ------------------------- */
  const [aId, setAId] = useState<string>("");
  const [bId, setBId] = useState<string>("");
  const a = purchases.find((p) => p.id === aId);
  const b = purchases.find((p) => p.id === bId);

  const compareRows = useMemo(() => {
    if (!a || !b) return [];
    const sum = (it: any) =>
      (typeof it.total === "number" && it.total) ||
      (Number(it.preco) || 0) * (Number(it.quantidade) || 1);

    const mapA = new Map<string, number>();
    for (const it of a.itens || []) mapA.set(norm(it.nome), +sum(it).toFixed(2));

    const mapB = new Map<string, number>();
    for (const it of b.itens || []) mapB.set(norm(it.nome), +sum(it).toFixed(2));

    const keysIntersec = [...mapA.keys()].filter((k) => mapB.has(k));
    return keysIntersec
      .map((k) => ({
        key: k,
        nome: (a.itens || []).find((x: any) => norm(x.nome) === k)?.nome || k,
        a: mapA.get(k)!,
        b: mapB.get(k)!,
        equal: Math.abs(mapA.get(k)! - mapB.get(k)!) < 0.005,
      }))
      .sort((x, y) => norm(x.nome).localeCompare(norm(y.nome)));
  }, [a, b]);

  /* ------------------------ ESTATÍSTICAS ---------------------- */
  const [period, setPeriod] = useState<Exclude<PeriodKey, "none">>("30");
  const now2 = new Date();
  const end = endOfDay(now2);
  const start = period === "max" ? new Date(0) : startOfDay(subDays(now2, Number(period) - 1));

  const filtered = useMemo(
    () =>
      purchases.filter((p) => {
        const d = toDate(p.createdAt);
        return d >= start && d <= end;
      }),
    [purchases, start.getTime(), end.getTime()]
  );

  const byMonth = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of filtered) {
      const d = toDate(p.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      map.set(key, (map.get(key) || 0) + (Number(p.total) || 0));
    }
    return Array.from(map.entries())
      .map(([k, v]) => ({ key: k, label: k.split("-").reverse().join("/"), total: +v.toFixed(2) }))
      .sort((a, b) => a.key.localeCompare(b.key));
  }, [filtered]);

  const byMarket = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of filtered)
      map.set(p.market || "—", (map.get(p.market || "—") || 0) + (Number(p.total) || 0));
    return Array.from(map.entries())
      .map(([m, v]) => ({ market: m, total: +v.toFixed(2) }))
      .sort((a, b) => b.total - a.total);
  }, [filtered]);

  const top5 = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of filtered) {
      for (const it of p.itens || []) {
        const tot =
          (typeof it.total === "number" && it.total) ||
          (Number(it.preco) || 0) * (Number(it.quantidade) || 1);
        const key = norm(it.nome);
        map.set(key, (map.get(key) || 0) + (+tot || 0));
      }
    }
    return Array.from(map.entries())
      .map(([k, v]) => ({ nome: k, total: +v.toFixed(2) }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [filtered]);

  /* --------------------------- UI ----------------------------- */

  return (
    <div className="mx-auto max-w-xl bg-white px-4 md:px-6 pt-safe pb-28">
      <PageHeader title="Comparar" />

      {/* Tabs */}
      <div className="mb-3 grid grid-cols-3 gap-2">
        {(["produtos", "compras", "estatisticas"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-2xl px-3 py-2 text-sm font-semibold shadow-inner ${
              tab === t ? "bg-yellow-500 text-black" : "bg-gray-100 text-gray-700"
            }`}
          >
            {t === "produtos" ? "Produto" : t === "compras" ? "Compras" : "Estatísticas"}
          </button>
        ))}
      </div>

      {/* ---------- PRODUTO ---------- */}
      {tab === "produtos" && (
        <>
          <div className="mb-2 flex items-center gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar produto..."
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          <div className="mb-3 grid grid-cols-2 gap-2">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as any)}
              className="rounded-2xl border border-gray-200 px-3 py-2 text-sm"
            >
              <option value="az">A–Z</option>
              <option value="min">Menor preço</option>
              <option value="max">Maior preço</option>
            </select>

            <select
              value={histPeriod}
              onChange={(e) => setHistPeriod(e.target.value as PeriodKey)}
              className="rounded-2xl border border-gray-200 px-3 py-2 text-sm"
              title="Período do histórico"
            >
              <option value="none">Histórico: Nenhum</option>
              <option value="30">Histórico: 30 dias</option>
              <option value="60">Histórico: 60 dias</option>
              <option value="90">Histórico: 90 dias</option>
              <option value="max">Histórico: Máximo</option>
            </select>
          </div>

          <div className="space-y-3">
            {produtoGrupos.map((g, i) => {
              const valores = g.rows.map((r) => r.preco);
              const faixa = valores.length
                ? `${brl(Math.min(...valores))} – ${brl(Math.max(...valores))}`
                : "—";

              // rows por mercado (ordenados)
              const rowsByMarket = g.rows.reduce<Record<string, Row[]>>((acc, r) => {
                (acc[r.market] ||= []).push(r);
                return acc;
              }, {});
              const markets = Object.keys(rowsByMarket).sort((a, b) => a.localeCompare(b));

              return (
                <div key={i} className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
                  <div className="flex items-baseline justify-between">
                    <h3
                      onClick={() =>
                        (window.location.href = `/product/${encodeURIComponent(g.nome)}`)
                      }
                      className="cursor-pointer text-[15px] font-semibold text-gray-900 hover:underline"
                      title="Ver detalhes do produto"
                    >
                      {g.nome}
                    </h3>
                    <div className="text-xs text-gray-500">Faixa global</div>
                  </div>
                  <div className="text-[15px] font-semibold text-gray-900">{faixa}</div>

                  <div className="mt-2 space-y-2">
                    {markets.map((mkt) => {
                      const sorted = rowsByMarket[mkt].sort(
                        (a, b) => a.date.getTime() - b.date.getTime()
                      );
                      const samples = sorted.map((r) => r.preco);
                      const last = samples[samples.length - 1] ?? 0;

                      if (histPeriod === "none") {
                        // Sem histórico: apenas último preço
                        return (
                          <div
                            key={mkt}
                            className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 p-3"
                          >
                            <div className="truncate text-sm text-gray-800">{mkt}</div>
                            <div className="text-sm font-semibold text-gray-900">{brl(last)}</div>
                          </div>
                        );
                      }

                      // Com histórico: sparkline + média + variação
                      const avg =
                        samples.length > 0
                          ? +(samples.reduce((s, v) => s + v, 0) / samples.length).toFixed(2)
                          : 0;
                      const variation = avg ? ((last - avg) / avg) * 100 : 0;

                      const hKey = `${norm(g.nome)}|${mkt}`;
                      const hist = historyMap.get(hKey) || [];

                      return (
                        <div
                          key={mkt}
                          className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 p-3"
                        >
                          <div className="min-w-0">
                            <div className="truncate text-sm text-gray-800">{mkt}</div>
                            <div className="text-xs text-gray-500">
                              Último: <span className="font-medium text-gray-800">{brl(last)}</span>
                              {" · "}
                              Média: <span className="font-medium">{brl(avg)}</span>
                              {" · "}
                              <span className={variation >= 0 ? "text-red-600" : "text-green-600"}>
                                {variation >= 0 ? "▲" : "▼"} {Math.abs(variation).toFixed(0)}%
                              </span>
                            </div>
                          </div>
                          <Sparkline data={hist} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ---------- COMPRAS ---------- */}
      {tab === "compras" && (
        <>
          <div className="mb-3 grid grid-cols-1 gap-2">
            <select
              value={aId}
              onChange={(e) => setAId(e.target.value)}
              className="rounded-2xl border border-gray-200 px-3 py-2 text-sm"
            >
              <option value="">Selecione a compra A</option>
              {purchases.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} · {p.market || "—"} · {brl(p.total || 0)}
                </option>
              ))}
            </select>
            <select
              value={bId}
              onChange={(e) => setBId(e.target.value)}
              className="rounded-2xl border border-gray-200 px-3 py-2 text-sm"
            >
              <option value="">Selecione a compra B</option>
              {purchases.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} · {p.market || "—"} · {brl(p.total || 0)}
                </option>
              ))}
            </select>
          </div>

          {a && b ? (
            <>
              <div className="mb-3 grid grid-cols-2 gap-2">
                {[a, b].map((x) => (
                  <div key={x.id} className="rounded-2xl border border-gray-200 bg-gray-50 p-3">
                    <div className="text-sm font-semibold text-gray-900">{x.name}</div>
                    <div className="text-xs text-gray-500">{x.market || "—"}</div>
                    <div className="mt-1 text-sm font-semibold text-gray-900">{brl(x.total || 0)}</div>
                  </div>
                ))}
              </div>

              {/* somente itens repetidos */}
              <div className="space-y-2">
                {compareRows.length === 0 && (
                  <p className="px-1 text-sm text-gray-500">
                    Não há itens repetidos entre as duas compras.
                  </p>
                )}
                {compareRows.map((r) => (
                  <div key={r.key} className="rounded-2xl border border-gray-200 bg-white p-3">
                    <div className="mb-2 text-sm text-gray-800">{r.nome}</div>
                    <div className="flex items-center gap-2">
                      <div className="rounded-xl border border-gray-200 px-2 py-1 text-sm">
                        A: <span className="font-semibold">{brl(r.a || 0)}</span>
                      </div>
                      <div className="rounded-xl border border-gray-200 px-2 py-1 text-sm">
                        B: <span className="font-semibold">{brl(r.b || 0)}</span>
                      </div>
                      <div className="ml-auto text-xs text-gray-500">{r.equal ? "igual" : ""}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="px-1 text-sm text-gray-500">Escolha duas compras para comparar.</p>
          )}
        </>
      )}

      {/* ---------- ESTATÍSTICAS ---------- */}
      {tab === "estatisticas" && (
        <>
          <div className="mb-3 flex items-center gap-2">
            <label className="text-sm text-gray-700">Período:</label>
            <div className="relative">
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as any)}
                className="appearance-none rounded-2xl border border-gray-200 bg-white px-3 py-2 pr-8 text-sm"
              >
                <option value="30">30 dias</option>
                <option value="60">60 dias</option>
                <option value="90">90 dias</option>
                <option value="max">Máximo</option>
              </select>
              <ChevronDownIcon className="pointer-events-none absolute right-2 top-2.5 h-4 w-4 text-gray-500" />
            </div>
          </div>

          {/* Gastos por mês */}
          <div className="mb-3 overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <div className="flex items-center gap-2 border-b p-3">
              <CalendarDaysIcon className="h-5 w-5 text-yellow-500" />
              <div className="font-semibold text-gray-900">Gastos por mês</div>
            </div>
            <div className="p-3">
              {(() => {
                const list = (() => {
                  const map = new Map<string, number>();
                  for (const p of filtered) {
                    const d = toDate(p.createdAt);
                    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
                    map.set(key, (map.get(key) || 0) + (Number(p.total) || 0));
                  }
                  return Array.from(map.entries())
                    .map(([k, v]) => ({
                      key: k,
                      label: k.split("-").reverse().join("/"),
                      total: +v.toFixed(2),
                    }))
                    .sort((a, b) => a.key.localeCompare(b.key));
                })();
                if (!list.length) return <div className="py-4 text-center text-sm text-gray-500">Sem dados no período.</div>;
                return (
                  <ul className="space-y-2">
                    {list.map((m) => (
                      <li key={m.key} className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">
                        <span className="text-sm text-gray-800">{m.label}</span>
                        <span className="text-sm font-semibold text-gray-900">{brl(m.total)}</span>
                      </li>
                    ))}
                  </ul>
                );
              })()}
            </div>
          </div>

          {/* Gastos por mercado */}
          <div className="mb-3 overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <div className="flex items-center gap-2 border-b p-3">
              <BuildingStorefrontIcon className="h-5 w-5 text-yellow-500" />
              <div className="font-semibold text-gray-900">Gastos por mercado</div>
            </div>
            <div className="p-3">
              {(() => {
                const list = (() => {
                  const map = new Map<string, number>();
                  for (const p of filtered)
                    map.set(p.market || "—", (map.get(p.market || "—") || 0) + (Number(p.total) || 0));
                  return Array.from(map.entries())
                    .map(([m, v]) => ({ market: m, total: +v.toFixed(2) }))
                    .sort((a, b) => b.total - a.total);
                })();
                if (!list.length) return <div className="py-4 text-center text-sm text-gray-500">Sem dados no período.</div>;
                return (
                  <ul className="space-y-2">
                    {list.map((m) => (
                      <li key={m.market} className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">
                        <span className="text-sm text-gray-800">{m.market}</span>
                        <span className="text-sm font-semibold text-gray-900">{brl(m.total)}</span>
                      </li>
                    ))}
                  </ul>
                );
              })()}
            </div>
          </div>

          {/* Top 5 produtos */}
          <div className="mb-10 overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <div className="flex items-center gap-2 border-b p-3">
              <BanknotesIcon className="h-5 w-5 text-yellow-500" />
              <div className="font-semibold text-gray-900">Top 5 produtos mais comprados</div>
            </div>
            <div className="p-3">
              {(() => {
                const list = (() => {
                  const map = new Map<string, number>();
                  for (const p of filtered) {
                    for (const it of p.itens || []) {
                      const tot =
                        (typeof it.total === "number" && it.total) ||
                        (Number(it.preco) || 0) * (Number(it.quantidade) || 1);
                      const key = norm(it.nome);
                      map.set(key, (map.get(key) || 0) + (+tot || 0));
                    }
                  }
                  return Array.from(map.entries())
                    .map(([k, v]) => ({ nome: k, total: +v.toFixed(2) }))
                    .sort((a, b) => b.total - a.total)
                    .slice(0, 5);
                })();
                if (!list.length) return <div className="py-4 text-center text-sm text-gray-500">Sem dados no período.</div>;
                return (
                  <ul className="space-y-2">
                    {list.map((t, i) => (
                      <li key={i} className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">
                        <span className="truncate text-sm text-gray-800">{t.nome}</span>
                        <span className="text-sm font-semibold text-gray-900">{brl(t.total)}</span>
                      </li>
                    ))}
                  </ul>
                );
              })()}
            </div>
          </div>

          {/* Gastos por categoria */}
          <div className="mb-10 overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <div className="flex items-center gap-2 border-b p-3">
              <CubeIcon className="h-5 w-5 text-yellow-500" />
              <div className="font-semibold text-gray-900">Gastos por categoria</div>
            </div>
            <div className="p-3">
              {(() => {
                const map = new Map<string, number>();
                for (const p of filtered) {
                  for (const it of p.itens || []) {
                    const tot =
                      (typeof it.total === "number" && it.total) ||
                      (Number(it.preco) || 0) * (Number(it.quantidade) || 1);
                    const cat = categorize(it.nome || "");
                    map.set(cat, (map.get(cat) || 0) + (+tot || 0));
                  }
                }
                const list = Array.from(map.entries())
                  .map(([cat, v]) => ({ cat, total: +v.toFixed(2) }))
                  .sort((a, b) => b.total - a.total);

                if (!list.length)
                  return <div className="py-4 text-center text-sm text-gray-500">Sem dados no período.</div>;

                return (
                  <ul className="space-y-2">
                    {list.map((c) => (
                      <li
                        key={c.cat}
                        className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-3 py-2"
                      >
                        <span className="text-sm text-gray-800">{c.cat}</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {Number(c.total).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </span>
                      </li>
                    ))}
                  </ul>
                );
              })()}
            </div>
          </div>
        </>
      )}

      <BottomNav activeTab="compare" />
    </div>
  );
}
