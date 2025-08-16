import React from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav";

const PurchaseNew: React.FC = () => {
  const nav = useNavigate();

  return (
    <div className="p-4 pb-28 max-w-xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Nova compra</h1>
        <img src="/LOGO_REDUZIDA.png" alt="Logo" className="h-8" />
      </div>

      <div className="mt-6 grid gap-4">
        <button
          onClick={() => nav("/purchases/new/receipt")}
          className="w-full rounded-2xl border p-5 text-left hover:bg-gray-50"
        >
          <div className="font-semibold text-lg">Cupom fiscal (QR Code)</div>
          <p className="text-sm text-gray-500">
            Escaneie o cupom e importe os itens automaticamente.
          </p>
        </button>

        <button
          onClick={() => nav("/purchases/new/list")}
          className="w-full rounded-2xl border p-5 text-left hover:bg-gray-50"
        >
          <div className="font-semibold text-lg">A partir de uma lista</div>
          <p className="text-sm text-gray-500">
            Escolha uma lista e selecione os itens comprados.
          </p>
        </button>
      </div>

      <BottomNav activeTab="purchases" />
    </div>
  );
};

export default PurchaseNew;
