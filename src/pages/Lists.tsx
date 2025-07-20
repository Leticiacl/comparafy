// src/pages/Lists.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { PlusIcon } from 'lucide-react';
import { createList } from '../services/firestoreService';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';

const Lists: React.FC = () => {
  const { data, reloadLists } = useData();
  const navigate = useNavigate();

  const handleCreateList = async () => {
    try {
      if (!data?.user?.id) {
        alert('⚠️ Usuário não identificado');
        return;
      }

      const newList = await createList(data.user.id, 'Nova Lista');

      if (!newList?.id) {
        alert('❌ Erro ao criar lista');
        return;
      }

      await reloadLists();
      navigate(`/lists/${newList.id}`);
    } catch (error: any) {
      console.error('Erro ao criar nova lista:', error);
      alert(`Erro: ${error?.message || error}`);
    }
  };

  return (
    <div className="p-4 space-y-6 pb-24">
      <Header title="Minhas Listas" />

      <button
        onClick={handleCreateList}
        className="w-full bg-yellow-500 text-black font-semibold py-3 rounded-xl shadow flex items-center justify-center gap-2 text-base"
      >
        <PlusIcon className="w-5 h-5" />
        Nova lista
      </button>

      <div className="space-y-4">
        {data.lists.length === 0 ? (
          <p className="text-gray-500 text-center mt-6">Você ainda não criou nenhuma lista.</p>
        ) : (
          data.lists.map((list) => {
            const completed = list.items?.filter((i) => i.purchased).length || 0;
            const total = list.items?.length || 0;
            const totalValue =
              list.items?.reduce(
                (acc, i) => acc + (i.price || 0) * (i.quantity || 0),
                0
              ) || 0;

            return (
              <div
                key={list.id}
                className="bg-white p-4 rounded-xl shadow cursor-pointer"
                onClick={() => navigate(`/lists/${list.id}`)}
              >
                <div className="flex justify-between items-center">
                  <p className="text-gray-900 font-medium">{list.name}</p>
                  <p className="text-sm text-gray-500">
                    {completed}/{total} itens
                  </p>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded mt-2 overflow-hidden">
                  <div
                    className="h-full bg-yellow-500"
                    style={{ width: `${(completed / total) * 100 || 0}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Total: R$ {totalValue.toFixed(2)}
                </p>
              </div>
            );
          })
        )}
      </div>

      <BottomNav activeTab="lists" />
    </div>
  );
};

export default Lists;
