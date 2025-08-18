import React from "react";
import { useParams, Link } from "react-router-dom";
import { useData } from "../context/DataContext";
const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function PurchaseDetail() {
  const { id } = useParams();
  const { purchases } = useData();
  const p = purchases.find((x) => x.id === id);

  if (!p) {
    return (
      <div className="p-6">
        <p>Compra não encontrada.</p>
        <Link to="/purchases" className="text-yellow-600 underline">Voltar</Link>
      </div>
    );
  }

  const total =
    p.itens?.reduce((acc, it) => acc + (Number(it.preco) || 0) * (Number(it.quantidade) || 1), 0) || 0;

  return (
    <div className="mx-auto max-w-screen-sm p-6">
      <h1 className="mb-2 text-3xl font-extrabold">{p.name}</h1>
      <p className="mb-6 text-gray-500">{p.market ? `${p.market} · ` : ""}{new Date(p.date || p.createdAt).toLocaleString("pt-BR")}</p>

      <div className="divide-y overflow-hidden rounded-2xl border border-gray-200">
        {p.itens?.map((it, i) => (
          <div key={i} className="flex items-center justify-between p-4">
            <div>
              <p className="font-medium">{it.nome}</p>
              <p className="text-sm text-gray-500">
                {it.quantidade}x {it.peso ? `• ${it.peso} ${it.unidade}` : ""}
              </p>
            </div>
            <div className="font-semibold">{brl((Number(it.preco) || 0) * (Number(it.quantidade) || 1))}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <span className="text-lg font-bold">Total</span>
        <span className="text-lg font-extrabold">{brl(total)}</span>
      </div>
    </div>
  );
}
