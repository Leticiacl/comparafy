// src/pages/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, XIcon, TrendingUpIcon } from 'lucide-react';
import { useData } from '../context/DataContext';
import { showToast } from '../components/ui/Toaster';
import { fetchLists, createList } from '../services/firestoreService';

const Dashboard: React.FC = () => {
  const { data, reloadLists } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newListName, setNewListName] = useState('');
  const navigate = useNavigate();

  const { lists, savings } = data;
  const recentLists = lists.slice(0, 3);
  const totalSavings = savings.reduce((acc, curr) => acc + curr.amount, 0);

  const handleCreateList = async () => {
    const userId = sessionStorage.getItem("userId");
    if (!userId || !newListName.trim()) return;

    const newListId = await createList(userId, newListName.trim());
    setNewListName('');
    setIsModalOpen(false);
    reloadLists();
    navigate(`/lists/${newListId}`);
  };

  return (
    <div className="p-6 pb-28 min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Olá, {data.user?.name || 'usuário'} 👋</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Vamos economizar hoje?</p>
        </div>
        <img src="/LOGO_REDUZIDA.png" alt="Comparafy Logo" className="w-10 h-10 object-contain" />
      </header>

      <div className="bg-yellow-400 text-black p-5 rounded-2xl shadow-md mb-6">
        <p className="text-sm">Economia Total</p>
        <h2 className="text-3xl font-bold">R$ {totalSavings.toFixed(2)}</h2>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Suas listas</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="text-yellow-500 hover:underline text-sm"
        >
          Nova Lista
        </button>
      </div>

      <div className="grid gap-4">
        {recentLists.map(list => {
          const completedItems = list.items.filter(i => i.purchased).length;
          const totalItems = list.items.length;
          const totalSpent = list.items.filter(i => i.purchased).reduce((acc, i) => acc + (i.price * i.quantity), 0);
          const progress = totalItems ? (completedItems / totalItems) * 100 : 0;

          return (
            <div
              key={list.id}
              className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow border border-gray-200 dark:border-gray-700 cursor-pointer"
              onClick={() => navigate(`/lists/${list.id}`)}
            >
              <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-1">{list.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                {completedItems}/{totalItems} itens - R$ {totalSpent.toFixed(2)}
              </p>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-yellow-400 h-2 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Nova Lista</h2>
              <button onClick={() => setIsModalOpen(false)}>
                <XIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <input
              type="text"
              placeholder="Nome da lista"
              value={newListName}
              onChange={e => setNewListName(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded mb-4"
            />
            <button
              onClick={handleCreateList}
              className="w-full bg-yellow-500 text-black font-semibold py-2 rounded-lg"
            >
              Criar Lista
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 bg-yellow-500 text-black p-4 rounded-full shadow-lg z-50"
      >
        <PlusIcon className="w-6 h-6" />
      </button>
    </div>
  );
};

export default Dashboard;