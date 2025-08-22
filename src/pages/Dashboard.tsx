// src/pages/Dashboard.tsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import PageHeader from "../components/ui/PageHeader";
import BottomNav from "../components/BottomNav";
import ListaCard from "../components/ListaCard";
import { useData } from "../context/DataContext";
import LogoMark from "../components/ui/LogoMark";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { lists = [], purchases = [] } = useData();

  const latestLists = lists.slice(0, 3);
  const latestPurchases = purchases.slice(0, 3);

  return (
    <div className="mx-auto max-w-xl bg-white p-4 pb-28">
      {/* Cabeçalho com logo à ESQUERDA do título */}
      <PageHeader title="Início" showLogo={false} leftSlot={<LogoMark />} />

      {/* ===== Últimas listas ===== */}
      <section className="mt-2">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Últimas listas</h2>
          <Link to="/lists" className="text-sm text-yellow-600 hover:underline">ver todas</Link>
        </div>

        {/* CTA grande (card width) */}
        <button
          onClick={() => navigate("/lists")}
          className="mb-3 w-full rounded-2xl bg-yellow-500 px-4 py-3 font-semibold text-black shadow hover:brightness-95"
        >
          + Nova lista
        </button>

        {latestLists.length === 0 ? (
          <div className="rounded-xl border border-dashed p-6 text-center text-gray-600">
            Você ainda não criou listas.
          </div>
        ) : (
          <div className="space-y-3">
            {latestLists.map((l) => (
              <ListaCard key={l.id} list={l} onClick={() => navigate(`/lists/${l.id}`)} />
            ))}
          </div>
        )}
      </section>

      {/* ===== Últimas compras ===== */}
      <section className="mt-8">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Últimas compras</h2>
          <Link to="/purchases" className="text-sm text-yellow-600 hover:underline">ver todas</Link>
        </div>

        {/* CTA grande (card width) */}
        <button
          onClick={() => navigate("/purchase-new")}
          className="mb-3 w-full rounded-2xl bg-yellow-500 px-4 py-3 font-semibold text-black shadow hover:brightness-95"
        >
          Nova compra
        </button>

        {latestPurchases.length === 0 ? (
          <div className="rounded-xl border border-dashed p-6 text-center text-gray-600">
            Nenhuma compra cadastrada ainda.
          </div>
        ) : (
          <div className="space-y-3">
            {latestPurchases.map((p) => (
              <button
                key={p.id}
                onClick={() => navigate(`/purchases/${p.id}`)}
                className="flex w-full items-center justify-between rounded-xl border border-gray-200 p-4 text-left hover:bg-gray-50"
              >
                <div>
                  <div className="font-medium text-gray-900">{p.name || "Compra"}</div>
                  <div className="text-sm text-gray-500">
                    {p.market || "—"} · {(p.itens || []).length} itens
                  </div>
                </div>
                <div className="text-right font-semibold text-gray-900">
                  {(Number(p.total) || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      <BottomNav activeTab="home" />
    </div>
  );
};

export default Dashboard;
