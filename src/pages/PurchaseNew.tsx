import React from "react";
import { Link, useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import PageHeader from "@/components/ui/PageHeader";

const PurchaseNew: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="p-4 pb-32 max-w-xl mx-auto bg-white space-y-6">
      <PageHeader title="Nova compra" />

      <div className="space-y-4 mt-6">
        <Link
          to="/purchases/receipt"
          className="block rounded-2xl border border-gray-200 bg-white p-4 active:scale-[.995]"
        >
          <div className="font-semibold text-gray-900">Via QR Code (NFC-e)</div>
          <div className="text-sm text-gray-500">
            Escaneie o QR da nota fiscal e importe os itens.
          </div>
        </Link>

        <Link
          to="/purchases/from-list"
          className="block rounded-2xl border border-gray-200 bg-white p-4 active:scale-[.995]"
        >
          <div className="font-semibold text-gray-900">A partir de uma lista</div>
          <div className="text-sm text-gray-500">
            Selecione sua lista, escolha os itens e salve a compra.
          </div>
        </Link>
      </div>

      <BottomNav activeTab="purchases" />
    </div>
  );
};

export default PurchaseNew;
