import React from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav";

const PurchaseNew: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="p-4 pb-32 max-w-xl mx-auto bg-white space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Nova compra</h1>
        <img src="/LOGO_REDUZIDA.png" alt="Logo" className="h-8 w-8" />
      </div>

      <div className="space-y-4 mt-6">
        <button
          onClick={() => navigate("/purchases/receipt")}
          className="w-full rounded-xl border border-gray-200 p-4 text-left hover:bg-gray-50"
        >
          <div className="text-lg font-semibold text-gray-800">Via QR Code</div>
          <div className="text-sm text-gray-500">
            Escaneie a NFC-e e importe os itens automaticamente.
          </div>
        </button>

        <button
          onClick={() => navigate("/purchases/from-list")}
          className="w-full rounded-xl border border-gray-200 p-4 text-left hover:bg-gray-50"
        >
          <div className="text-lg font-semibold text-gray-800">A partir de uma lista</div>
          <div className="text-sm text-gray-500">
            Selecione sua lista, escolha os itens comprados e salve.
          </div>
        </button>
      </div>

      <BottomNav activeTab="purchases" />
    </div>
  );
};

export default PurchaseNew;
