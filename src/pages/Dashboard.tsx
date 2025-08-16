import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import BottomNav from "../components/BottomNav";
import { useData } from "../context/DataContext";
import { NewListModal } from "../components/ui/NewListModal";

const currency = (n: number) =>
  `R$ ${Number(n || 0).toFixed(2).replace(".", ",")}`;

function toDate(d: any): Date {
  if (!d) return new Date(0);
  if (typeof d?.seconds === "number") return new Date(d.seconds * 1000); // Firestore Timestamp
  if (typeof d === "string") return new Date(d); // "YYYY-MM-DD"
  return new Date(d);
}
function formatDateBR(d: any) {
  const dt = toDate(d);
  try {
    return dt.toLocaleDateString("pt-BR");
  } catch {
    return "";
  }
}

export default function Dashboard() {
  const { lists, fetchUserData, purchases, fetchPurchases } = useData();
  const [openNew, setOpenNew] = useState(false);

  useEffect(() => {
    fetchUserData();
    fetchPurchases?.();
  }, []);

  const recentLists = useMemo(
    () =>
      [...(lists || [])]
        .sort(
          (a, b) =>
            toDate(b.createdAt).getTime() - toDate(a.createdAt).getTime()
        )
        .slice(0, 3),
    [lists]
  );

  const recentPurchases = useMemo(() => {
    const arr = [...(purchases || [])].sort(
      (a, b) => toDate(b.createdAt).getTime() - toDate(a.createdAt).getTime()
    );
    return arr.slice(0, 3).map((p) => ({
      ...p,
      total: (p.itens || []).reduce(
        (s: number, it: any) =>
          s + Number(it.preco || 0) * Number(it.quantidade || 1),
        0
      ),
      title:
        p.source === "list"
          ? p.sourceRefName || "Compra de lista"
          : p.market || p.sourceRefName || "Compra (cupom)",
      subtitle: `${p.market ? `${p.market} • ` : ""}${formatDateBR(
        p.createdAt
      )}`,
    }));
  }, [purchases]);

  return (
    <div className="p-4 pb-28 max-w-xl mx-auto">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-3xl font-extrabold">Olá!</h1>
          <p className="text-gray-500">Bem-vindo ao Comparify</p>
        </div>
        <img src="/LOGO_REDUZIDA.png" alt="Logo" className="h-9 w-9" />
      </div>

      {/* CTA: Nova lista */}
      <button
        onClick={() => setOpenNew(true)}
        className="w-full bg-yellow-500 text-black font-medium rounded-xl py-3 shadow"
      >
        + Nova lista
      </button>

      {/* Listas recentes */}
      <section className="mt-6">
        <div className="flex items-end justify-between mb-2">
          <h2 className="text-lg font-semibold">Listas recentes</h2>
          <Link to="/lists" className="text-yellow-600 text-sm font-medium">
            Ver todas
          </Link>
        </div>

        {recentLists.length === 0 ? (
          <div className="rounded-xl border border-dashed p-4 text-center text-gray-500">
            Sem listas ainda.
          </div>
        ) : (
          <ul className="space-y-3">
            {recentLists.map((l) => (
              <li key={l.id}>
                <Link
                  to={`/lists/${l.id}`}
                  className="block rounded-xl border p-4 hover:bg-gray-50 transition"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-900">
                        {l.nome}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDateBR(l.createdAt)} • {l.itens?.length || 0}{" "}
                        itens
                      </div>
                    </div>
                    <span className="text-gray-400">&rsaquo;</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Compras recentes */}
      <section className="mt-8">
        <div className="flex items-end justify-between mb-2">
          <h2 className="text-lg font-semibold">Compras recentes</h2>
          <Link to="/purchases" className="text-yellow-600 text-sm font-medium">
            Ver todas
          </Link>
        </div>

        {recentPurchases.length === 0 ? (
          <div className="rounded-xl border border-dashed p-4 text-center text-gray-500">
            Sem compras ainda.
          </div>
        ) : (
          <ul className="space-y-3">
            {recentPurchases.map((p) => (
              <li key={p.id}>
                <Link
                  to="/purchases"
                  className="block rounded-xl border p-4 hover:bg-gray-50 transition"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-900">
                        {p.title}
                      </div>
                      <div className="text-sm text-gray-500">{p.subtitle}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">
                        {currency(p.total)}
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <BottomNav activeTab="home" />

      <NewListModal isOpen={openNew} onClose={() => setOpenNew(false)} />
    </div>
  );
}
