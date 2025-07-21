// src/pages/Dashboard.tsx

import React from "react";
import { useData } from "../context/DataContext";
import { useNavigate } from "react-router-dom";
import { ArrowUpRightIcon } from "@heroicons/react/24/outline";
import BottomNav from "../components/BottomNav";
import logo from "../assets/LOGO_REDUZIDA.png";

const Dashboard = () => {
  const { createNewList, lists } = useData();
  const navigate = useNavigate();

  const handleNovaLista = async () => {
    const nome = prompt("Digite o nome da nova lista:");
    if (!nome) return;
    await createNewList(nome);
    navigate("/listas");
  };

  const economiaTotal = lists.reduce((acc, list) => {
    return acc + (list.items?.reduce((a: number, item: any) => a + (item.saving || 0), 0) || 0);
  }, 0);

  return (
    <div className="flex flex-col h-screen">
      <div className="flex items-center justify-between p-4">
        <div>
          <h1 className="text-2xl font-bold">Olá!</h1>
          <p className="text-gray-500">Bem-vindo ao Comparify</p>
        </div>
        <img src={logo} alt="Logo" className="w-10 h-10" />
      </div>

      <div className="px-4 space-y-6 flex-1 overflow-y-auto">
        <div className="bg-[#FFF8D6] rounded-2xl p-4 shadow flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm">Economia total</p>
            <p className="text-2xl font-bold text-yellow-600">R$ {economiaTotal.toFixed(2)}</p>
          </div>
          <ArrowUpRightIcon className="h-6 w-6 text-yellow-600" />
        </div>

        <button
          onClick={handleNovaLista}
          className="w-full bg-yellow-500 text-black font-semibold py-3 rounded-xl shadow flex items-center justify-center gap-2 text-base"
        >
          + Nova lista
        </button>
      </div>

      <BottomNav activeTab="home" />
    </div>
  );
};

export default Dashboard;
