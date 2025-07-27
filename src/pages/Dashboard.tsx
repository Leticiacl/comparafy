import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { formatCurrency } from '../utils/formatCurrency';
import BottomNav from '../components/BottomNav';
import NewListModal from '../components/ui/NewListModal';

const Dashboard = () => {
  const { lists, savings } = useData();
  const [showModal, setShowModal] = useState(false);

  const totalSavings = savings?.reduce((acc, val) => acc + val, 0) || 0;

  return (
    <div className="min-h-screen bg-white flex flex-col px-6 pb-24">
      {/* Logo no topo */}
      <div className="flex justify-end mt-6">
        <img src="/LOGO_REDUZIDA.png" alt="Logo" className="w-10 h-10" />
      </div>

      {/* Saudação */}
      <div className="mt-4">
        <h1 className="text-2xl font-semibold text-gray-800">Olá!</h1>
        <p className="text-gray-500 text-base">Bem-vindo ao Comparify</p>
      </div>

      {/* Economia Total */}
      <div className="mt-6 bg-white rounded-xl p-4 shadow flex items-center gap-4 border border-gray-200">
        <div className="bg-yellow-400 rounded-full w-12 h-12 flex items-center justify-center text-white font-bold text-xl">
          ↑
        </div>
        <div>
          <p className="text-gray-500 text-sm">Economia total</p>
          <p className="text-xl font-semibold text-gray-800">
            {formatCurrency(totalSavings)}
          </p>
        </div>
      </div>

      {/* Botão Nova Lista */}
      <button
        onClick={() => setShowModal(true)}
        className="mt-6 w-full bg-yellow-400 text-black font-semibold py-3 rounded-xl shadow flex items-center justify-center gap-2 text-base"
      >
        + Nova lista
      </button>

      {/* Listas recentes */}
      {lists && lists.length > 0 ? (
        <div className="mt-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">Listas recentes</h2>
          {lists.map((list) => {
            const total = list.items?.reduce((acc, item) => acc + item.price, 0) || 0;
            const completedCount = list.items?.filter((item) => item.purchased).length || 0;
            const totalCount = list.items?.length || 0;
            const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

            return (
              <div key={list.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-base font-semibold text-gray-800">{list.name}</h3>
                  <span className="text-sm text-gray-500">{formatCurrency(total)}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div
                    className="bg-yellow-400 h-2.5 rounded-full"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {completedCount}/{totalCount} itens comprados
                </p>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-gray-500 text-center mt-10">Você ainda não criou nenhuma lista.</p>
      )}

      {/* Modal */}
      <NewListModal isOpen={showModal} onClose={() => setShowModal(false)} />

      {/* Navegação inferior */}
      <BottomNav activeTab="home" />
    </div>
  );
};

export default Dashboard;
