// src/pages/Dashboard.tsx
import React, { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { useData } from "@/context/DataContext";

/* helpers */
const brl = (n: number) =>
  Number(n || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const fmtDate = (any: any) => {
  const ms =
    typeof any === "number"
      ? any
      : any?.seconds
      ? any.seconds * 1000
      : Date.parse(any || "");
  if (!Number.isFinite(ms)) return "-";
  return new Date(ms).toLocaleDateString("pt-BR");
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { lists, purchases } = useData();

  // últimas 2 listas
  const recentLists = useMemo(() => {
    const withDates = [...(lists || [])].sort((a, b) => {
      const ta = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : Date.parse(a.createdAt || "");
      const tb = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : Date.parse(b.createdAt || "");
      return (tb || 0) - (ta || 0);
    });
    return withDates.slice(0, 2);
  }, [lists]);

  // últimas 2 compras
  const recentPurchases = useMemo(() => {
    const ps = [...(purchases || [])].sort((a, b) => {
      const ta = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : Number(a.createdAt || 0);
      const tb = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : Number(b.createdAt || 0);
      return (tb || 0) - (ta || 0);
    });
    return ps.slice(0, 2);
  }, [purchases]);

  return (
    <div className="mx-auto max-w-xl bg-white p-4 pb-28">
      {/* Cabeçalho */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold text-gray-900">Olá!</div>
          <div className="text-sm text-gray-500 -mt-0.5">Bem-vindo ao Comparafy</div>
        </div>
        <img src="/LOGO_REDUZIDA.png" className="h-9" alt="Comparafy" />
      </div>

      {/* Listas recentes */}
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm font-semibold text-gray-700">Listas recentes</div>
        <button
          onClick={() => navigate("/lists")}
          className="text-xs font-medium text-yellow-600 hover:underline"
        >
          Ver todas
        </button>
      </div>

      <div className="space-y-3">
        {recentLists.length === 0 && (
          <div className="rounded-2xl border border-gray-200 p-4 text-sm text-gray-500">
            Você ainda não criou listas.
          </div>
        )}

        {recentLists.map((l) => {
          const itens = l.itens || [];
          const done = itens.filter((i) => i.comprado).length;
          const total = itens.reduce(
            (s, i) => s + Number(i.preco || 0) * Number(i.quantidade || 1),
            0
          );

          return (
            <button
              key={l.id}
              onClick={() => navigate(`/lists/${l.id}`)}
              className="block w-full rounded-2xl border border-gray-200 bg-white p-4 text-left active:scale-[.995]"
            >
              {/* título agora em text-base para igualar aos cards de compras */}
              <div className="mb-2 text-base font-semibold text-gray-900">{l.nome}</div>

              {/* meta em text-xs como nos cards de compras */}
              <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
                <span>
                  {done}/{itens.length} itens
                </span>
                <span>Total: {brl(total)}</span>
              </div>

              <div className="h-2 w-full rounded bg-gray-200">
                <div
                  className="h-2 rounded bg-yellow-400 transition-all"
                  style={{ width: `${(done / Math.max(1, itens.length)) * 100}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Botão Nova lista */}
      <Link
        to="/lists"
        className="mt-3 block rounded-2xl bg-yellow-500 py-3 text-center font-semibold text-black active:scale-[.995]"
      >
        + Nova lista
      </Link>

      <div className="my-6 h-px w-full bg-gray-100" />

      {/* Compras recentes */}
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm font-semibold text-gray-700">Minhas compras</div>
        <button
          onClick={() => navigate("/purchases")}
          className="text-xs font-medium text-yellow-600 hover:underline"
        >
          Ver todas
        </button>
      </div>

      <div className="space-y-3">
        {recentPurchases.length === 0 && (
          <div className="rounded-2xl border border-gray-200 p-4 text-sm text-gray-500">
            Você ainda não registrou compras.
          </div>
        )}

        {recentPurchases.map((p) => (
          <button
            key={p.id}
            onClick={() => navigate(`/purchases/${p.id}`)}
            className="block w-full rounded-2xl border border-gray-200 bg-white p-4 text-left active:scale-[.995]"
          >
            <div className="flex items-center justify-between">
              {/* mantém text-base nos dois cards */}
              <div className="text-base font-semibold text-gray-900">{p.name || "Compra"}</div>
              <div className="text-sm font-semibold text-gray-900">{brl(p.total)}</div>
            </div>
            <div className="mt-1 text-xs text-gray-500">
              {fmtDate(p.createdAt)} · {p.market || "—"} · {p.itemCount ?? p.itens?.length ?? 0} itens
            </div>
          </button>
        ))}
      </div>

      {/* Botão Nova compra */}
      <Link
        to="/purchases/new"
        className="mt-3 block rounded-2xl bg-yellow-500 py-3 text-center font-semibold text-black active:scale-[.995]"
      >
        + Nova compra
      </Link>

      <BottomNav activeTab="home" />
    </div>
  );
};

export default Dashboard;
