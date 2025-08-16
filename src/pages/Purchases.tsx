import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav";
import { useData } from "../context/DataContext";

const currency = (n: number) => `R$ ${Number(n || 0).toFixed(2).replace(".", ",")}`;

export default function Purchases() {
  const { purchases, fetchPurchases } = useData();
  const nav = useNavigate();

  useEffect(() => {
    fetchPurchases();
  }, []);

  return (
    <div className="p-4 pb-28 max-w-xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Compras</h1>
        <img src="/LOGO_REDUZIDA.png" alt="Logo" className="h-8" />
      </div>

      <button
        onClick={() => nav("/purchases/new")} // ← garante que abre a tela de escolha
        className="mt-4 w-full bg-yellow-500 text-black py-3 rounded-xl font-medium shadow"
      >
        Nova compra
      </button>

      <ul className="mt-4 space-y-3">
        {(purchases || []).map((p) => {
          const total = (p.itens || []).reduce(
            (s, it) => s + Number(it.preco || 0) * Number(it.quantidade || 1),
            0
          );
          const title =
            p.source === "list"
              ? p.sourceRefName || p.nome || "Compra de lista"
              : p.market || p.nome || "Compra (cupom)";

          const when = new Date(
            p.createdAt?.seconds ? p.createdAt.seconds * 1000 : p.createdAt
          ).toLocaleString();

          return (
            <li key={p.id} className="border rounded-xl p-4">
              {/* pode apontar para a futura tela de detalhes da compra */}
              <Link to={`/purchases`} className="block">
                <div className="flex justify-between">
                  <div>
                    <div className="font-semibold">{title}</div>
                    <div className="text-sm text-gray-500">{when}</div>
                  </div>
                    <div className="font-semibold">{currency(total)}</div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>

      <BottomNav activeTab="purchases" />
    </div>
  );
}
