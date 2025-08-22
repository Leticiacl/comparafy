// src/components/ListaCard.tsx
import React from "react";

type ListItem = {
  id: string;
  nome: string;
  quantidade?: number;
  unidade?: string;
  preco?: number;
  peso?: number;
  comprado?: boolean;
  mercado?: string;
};

type List = {
  id: string;
  nome: string;
  itens?: ListItem[];
};

type Props = {
  list: List;
  onClick?: () => void;
};

const brl = (n: number) =>
  (Number(n) || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const ListaCard: React.FC<Props> = ({ list, onClick }) => {
  const itens = Array.isArray(list.itens) ? list.itens : [];

  const totalItems = itens.length;
  const purchased = itens.filter((i) => !!i.comprado).length;

  const totalValue = itens.reduce((sum, it) => {
    const preco = Number(it.preco) || 0;
    const qnt = Number(it.quantidade) || 1;
    return sum + preco * qnt;
  }, 0);

  const progress =
    totalItems > 0 ? Math.min(100, Math.round((purchased / totalItems) * 100)) : 0;

  return (
    <button
      onClick={onClick}
      className="w-full rounded-xl border border-gray-200 p-4 text-left hover:bg-gray-50 active:scale-[.999]"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{list.nome || "Lista"}</h3>
          <p className="text-sm text-gray-600">
            {purchased}/{totalItems} itens
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Total estimado</div>
          <div className="text-base font-semibold text-gray-900">{brl(totalValue)}</div>
        </div>
      </div>

      <div className="mt-3 h-2 w-full rounded bg-gray-200">
        <div
          className="h-2 rounded bg-yellow-400"
          style={{ width: `${progress}%` }}
        />
      </div>
    </button>
  );
};

export default ListaCard;
