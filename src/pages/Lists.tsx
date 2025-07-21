import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import BottomNav from '../components/BottomNav';

const Lists: React.FC = () => {
  const { lists, createNewList } = useData();
  const navigate = useNavigate();

  const handleCreateList = async () => {
    const name = prompt('Nome da nova lista:') || 'Nova lista';
    await createNewList(name);
  };

  const handleCardClick = (id: string) => {
    navigate(`/list/${id}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="flex items-center justify-between p-4">
        <h1 className="text-2xl font-bold text-gray-800">Minhas Listas</h1>
        <img src="/LOGO_REDUZIDA.png" alt="Logo" className="h-10 w-10" />
      </div>

      <div className="px-4 mb-4">
        <button
          onClick={handleCreateList}
          className="w-full bg-yellow-500 text-black font-semibold py-3 rounded-xl shadow flex items-center justify-center gap-2 text-base"
        >
          + Nova lista
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-24">
        {lists.length === 0 ? (
          <p className="text-gray-500 text-center mt-10">Nenhuma lista encontrada.</p>
        ) : (
          <div className="space-y-4">
            {lists.map((list) => {
              const total = list.items.reduce((sum, item) => sum + (item.price || 0), 0);
              const checkedCount = list.items.filter((item) => item.checked).length;
              const percentage = list.items.length
                ? Math.round((checkedCount / list.items.length) * 100)
                : 0;

              return (
                <div
                  key={list.id}
                  onClick={() => handleCardClick(list.id)}
                  className="border border-gray-200 rounded-xl p-4 shadow cursor-pointer hover:shadow-md transition"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="font-semibold text-gray-800">{list.name}</h2>
                    <span className="text-sm text-gray-500">
                      {checkedCount}/{list.items.length}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full mb-2">
                    <div
                      className="h-2 bg-yellow-500 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="text-sm text-gray-600">
                    Total: R$ {total.toFixed(2)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav activeTab="lists" />
    </div>
  );
};

export default Lists;
