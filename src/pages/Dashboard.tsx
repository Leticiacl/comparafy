// src/pages/Dashboard.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { ArrowUpRightIcon } from '@heroicons/react/24/outline';
import BottomNav from '../components/BottomNav';
import LOGO from '../assets/LOGO_REDUZIDA.png';

const Dashboard: React.FC = () => {
  const { data, createList } = useData();
  const navigate = useNavigate();

  const totalSavings = data.savings.reduce((acc, value) => acc + value, 0);

  const handleNewList = async () => {
    const name = prompt('Digite o nome da nova lista:');
    if (name) {
      const newListId = await createList(name);
      navigate(`/lista/${newListId}`);
    }
  };

  const handleOpenList = (id: string) => {
    navigate(`/lista/${id}`);
  };

  return (
    <div className="p-4 pb-24 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Olá!</h1>
          <p className="text-gray-500">Bem-vindo ao Comparify</p>
        </div>
        <img src={LOGO} alt="Logo Comparify" className="h-8 w-auto" />
      </div>

      <div className="bg-white rounded-xl shadow p-4 flex items-center gap-4">
        <div className="bg-yellow-100 p-3 rounded-full">
          <ArrowUpRightIcon className="h-6 w-6 text-yellow-500" />
        </div>
        <div>
          <p className="text-sm text-gray-500">Economia total</p>
          <p className="text-xl font-bold text-gray-900">R$ {totalSavings.toFixed(2)}</p>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold text-gray-900">Listas recentes</h2>
          <button onClick={() => navigate('/listas')} className="text-yellow-500 text-sm font-medium">
            Ver todas
          </button>
        </div>

        {data.lists.length === 0 ? (
          <p className="text-gray-500 text-center">Nenhuma lista criada ainda.</p>
        ) : (
          <div className="space-y-3">
            {data.lists.map((list) => {
              const items = data.items?.[list.id] || [];
              const total = items.reduce((acc, item) => acc + (item.price || 0), 0);
              const purchased = items.filter((i) => i.purchased).length;
              const progress = items.length > 0 ? (purchased / items.length) * 100 : 0;

              return (
                <div
                  key={list.id}
                  className="bg-white p-4 rounded-xl shadow cursor-pointer"
                  onClick={() => handleOpenList(list.id)}
                >
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900">{list.name}</h2>
                    <p className="text-sm text-gray-500">{purchased}/{items.length} itens</p>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
                    <div
                      className="h-2 bg-yellow-400 rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Total: R$ {total.toFixed(2)} — {items.length} itens
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <button
        onClick={handleNewList}
        className="w-full bg-yellow-500 text-black font-semibold py-3 rounded-xl shadow flex items-center justify-center gap-2 text-base"
      >
        + Nova lista
      </button>

      <BottomNav activeTab="home" />
    </div>
  );
};

export default Dashboard;
