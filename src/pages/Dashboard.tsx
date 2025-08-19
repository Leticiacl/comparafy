import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav";
import { useData } from "../context/DataContext";
import PageHeader from "../components/ui/PageHeader";
import PrimaryButton from "../components/ui/PrimaryButton";

const currency = (n: number) => `R$ ${Number(n || 0).toFixed(2)}`;

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { lists, purchases, fetchUserData, fetchPurchases } = useData();
  
  useEffect(() => {
    fetchUserData();
    fetchPurchases();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white pb-28">
      <PageHeader title="Olá!" subtitle="Bem-vindo ao Comparafy" divider />

      {/* Listas recentes */}
      <section className="px-4 mt-5">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">Listas recentes</h2>
          <Link to="/lists" className="text-yellow-600 font-medium">Ver todas</Link>
        </div>
        {lists?.length ? (
          <ul className="space-y-3">
            {lists.slice(0, 3).map((l: any) => (
              <li key={l.id}>
                <Link to={`/lists/${l.id}`} className="block bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <div className="font-medium">{l.nome || l.name || "Lista"}</div>
                  <div className="text-xs text-gray-500 mt-1">{(l.itens?.length || 0)} itens</div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">Nenhuma lista ainda.</p>
        )}
      </section>

      {/* Compras recentes */}
      <section className="px-4 mt-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">Compras recentes</h2>
          <Link to="/purchases" className="text-yellow-600 font-medium">Ver todas</Link>
        </div>
        {purchases?.length ? (
          <ul className="space-y-3">
            {purchases.slice(0, 3).map((p: any) => {
              const total = p.total ?? (p.itens || []).reduce((acc: number, it: any) => acc + (Number(it.preco) || 0) * (Number(it.quantidade) || 1), 0);
              return (
                <li key={p.id}>
                  <button
                    onClick={() => p.id && navigate(`/purchases/${p.id}`)}
                    className="w-full text-left bg-white border border-gray-200 rounded-xl p-4 shadow-sm active:scale-[0.99] transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{p.name || "Compra"}</div>
                      <div className="font-semibold">{currency(total)}</div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{p.store || p.market || "-"}</div>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-gray-500">Nenhuma compra ainda.</p>
        )}
      </section>

      {/* CTAs no rodapé */}
      <div className="px-4 mt-8 space-y-3">
        <PrimaryButton onClick={() => navigate("/lists")}>+ Nova lista</PrimaryButton>
        <PrimaryButton onClick={() => navigate("/purchases/new")}>+ Nova compra</PrimaryButton>
      </div>

      <BottomNav activeTab="home" />
      
    </div>
  );
};

export default Dashboard;
