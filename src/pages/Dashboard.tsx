import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRightIcon } from '@heroicons/react/24/outline';
import { useData } from '../context/DataContext';
import BottomNav from '../components/BottomNav';

export default function Dashboard() {
  const { data, addNewList } = useData();
  const navigate = useNavigate();

  const totalSavings = data.savings.reduce(
    (acc, item) => acc + (item.value || 0),
    0
  );

  return (
    <div className="min-h-screen pb-28 bg-white flex flex-col items-center px-4">
      {/* Logo */}
      <img
        src="/LOGO_REDUZIDA.png"
        alt="Comparify"
        className="w-20 h-auto mt-8 mb-4"
      />

      {/* Título */}
      <h1 className="text-2xl font-semibold text-gray-800">Olá!</h1>
      <p className="text-gray-500 mb-6">Bem-vindo ao Comparify</p>

      {/* Bloco de economia */}
      <div className="bg-yellow-100 w-full p-4 rounded-xl flex items-center justify-between shadow">
        <div>
          <p className="text-gray-500 text-sm">Você economizou</p>
          <p className="text-2xl font-bold text-gray-800">
            R$ {totalSavings.toFixed(2)}
          </p>
        </div>
        <ArrowUpRightIcon className="h-8 w-8 text-yellow-500" />
      </div>

      {/* Botão Nova Lista */}
      <button
        onClick={addNewList}
        className="w-full bg-yellow-500 text-black font-semibold py-3 rounded-xl shadow flex items-center justify-center gap-2 text-base mt-6"
      >
        + Nova lista
      </button>

      {/* Listas recentes */}
      {data.lists.length > 0 && (
        <div className="w-full mt-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">
            Minhas listas
          </h2>
          <div className="space-y-3">
            {data.lists.map((list) => {
              const items = data.items[list.id] || [];
              const checkedCount = items.filter((item) => item.checked).length;
              const total = items.length;
              const totalValue = items.reduce(
                (sum, item) => sum + (item.price || 0),
                0
              );

              const percentage = total === 0 ? 0 : (checkedCount / total) * 100;

              return (
                <div
                  key={list.id}
                  className="bg-white p-4 rounded-xl shadow border border-gray-200"
                  onClick={() => navigate(`/list/${list.id}`)}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-gray-800">{list.name}</h3>
                    <p className="text-sm text-gray-500">
                      {checkedCount}/{total}
                    </p>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5 mb-2">
                    <div
                      className="bg-yellow-500 h-2.5 rounded-full"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-700 font-medium">
                    Total: R$ {totalValue.toFixed(2)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Navegação inferior */}
      <BottomNav activeTab="home" />
    </div>
  );
}
