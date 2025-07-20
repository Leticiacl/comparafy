// src/pages/Lists.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import BottomNav from '../components/BottomNav';

const Lists: React.FC = () => {
  const { data, createList } = useData();
  const navigate = useNavigate();

  const handleNewList = async () => {
    const name = prompt('Nome da nova lista:');
    if (name) {
      const newList = await createList(name);
      if (newList?.id) navigate(`/lista/${newList.id}`);
    }
  };

  return (
    <div className="p-4 pb-24">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold text-gray-900">Minhas Listas</h1>
        <img src="/LOGO_REDUZIDA.png" alt="Logo" className="w-8 h-8" />
      </div>

      <div className="space-y-4">
        {data.lists.map((list) => {
          const items = data.items[list.id] || [];
          const total = items.reduce((sum, item) => sum + (item.price || 0), 0);
          const purchased = items.filter((item) => item.purchased).length;

          return (
            <div
              key={list.id}
              onClick={() => navigate(`/lista/${list.id}`)}
              className="bg-white p-4 rounded-xl shadow cursor-pointer"
            >
              <h2 className="text-lg font-medium text-gray-900">{list.name}</h2>
              <div className="h-2 w-full bg-gray-200 rounded-full my-2">
                <div
                  className="h-2 bg-yellow-400 rounded-full"
                  style={{ width: `${(purchased / items.length || 0) * 100}%` }}
                />
              </div>
              <p className="text-sm text-gray-600">
                Total: R$ {total.toFixed(2)} — {items.length} itens
              </p>
            </div>
          );
        })}
      </div>

      <button
        onClick={handleNewList}
        className="mt-6 w-full bg-yellow-500 text-black font-semibold py-3 rounded-xl shadow flex items-center justify-center gap-2 text-base"
      >
        + Nova lista
      </button>

      <BottomNav activeTab="lists" />
    </div>
  );
};

export default Lists;
