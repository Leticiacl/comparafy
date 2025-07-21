// src/pages/Lists.tsx
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataContext } from '../DataContext';
import BottomNav from '../components/BottomNav';

const Lists = () => {
  const { userData, createListAndRedirect } = useContext(DataContext);
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-white pb-20">
      {/* Header personalizado */}
      <div className="flex justify-between items-center px-4 pt-6">
        <h1 className="text-xl font-semibold text-gray-800">Minhas Listas</h1>
        <img src="/LOGO_REDUZIDA.png" alt="Logo" className="w-10 h-10" />
      </div>

      {/* Botão nova lista */}
      <div className="px-4 mt-6">
        <button
          onClick={createListAndRedirect}
          className="w-full bg-yellow-500 text-black font-semibold py-3 rounded-xl shadow flex items-center justify-center gap-2 text-base"
        >
          + Nova lista
        </button>
      </div>

      {/* Listas */}
      {userData?.lists?.length > 0 ? (
        <div className="mt-8 px-4 space-y-4">
          {userData.lists.map((list: any) => {
            const itemCount = list.items?.length || 0;
            const checkedCount = list.items?.filter((item: any) => item.checked)?.length || 0;
            const total = list.items?.reduce((acc: number, curr: any) => acc + (curr.price || 0), 0) || 0;
            const progress = itemCount === 0 ? 0 : (checkedCount / itemCount) * 100;

            return (
              <div
                key={list.id}
                className="p-4 rounded-xl border border-gray-200 shadow cursor-pointer"
                onClick={() => navigate(`/lista/${list.id}`)}
              >
                <div className="flex justify-between items-center mb-1">
                  <h2 className="text-base font-semibold text-gray-800">{list.name || 'Lista Sem Nome'}</h2>
                  <p className="text-sm font-medium text-gray-600">R$ {total.toFixed(2)}</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {checkedCount} de {itemCount} itens
                </p>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-center text-gray-500 mt-8">Nenhuma lista encontrada.</p>
      )}

      <BottomNav activeTab="lists" />
    </div>
  );
};

export default Lists;
