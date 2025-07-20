// src/pages/Lists.tsx
import React from 'react';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';

const Lists = () => {
  const { data, addNewList } = useData();
  const navigate = useNavigate();

  return (
    <div className="pb-20 px-4 pt-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Minhas Listas</h1>
        <img src="/COMPARAFY.png" alt="Logo" className="h-8" />
      </div>

      <button
        onClick={addNewList}
        className="w-full bg-yellow-500 text-black font-semibold py-3 rounded-xl shadow flex items-center justify-center gap-2 text-base mb-6"
      >
        + Nova lista
      </button>

      <div className="space-y-4">
        {data.lists.map((list) => (
          <div
            key={list.id}
            onClick={() => navigate(`/list/${list.id}`)}
            className="bg-white p-4 rounded-lg shadow cursor-pointer"
          >
            <h2 className="text-lg font-medium">{list.name}</h2>
            <div className="text-sm text-gray-500">
              {data.items[list.id]?.length || 0} itens
            </div>
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
};

export default Lists;
