// src/pages/Lists.tsx
import React from 'react';
import { PlusIcon } from 'lucide-react';
import { useData } from '../context/DataContext';
import { createList } from '../services/firestoreService';

const Lists: React.FC = () => {
  const { data, reloadLists } = useData();

  const handleCreateList = async () => {
    alert('🟡 Clique detectado no botão'); // Para teste visual

    try {
      if (!data.user?.id) {
        console.warn('⚠️ Usuário não encontrado:', data.user);
        return;
      }

      const newList = await createList(data.user.id, 'Nova Lista');
      await reloadLists();

      // ✅ Corrigido: usar redirecionamento direto
      window.location.href = `/lists/${newList.id}`;
    } catch (error) {
      console.error('❌ Erro ao criar nova lista:', error);
    }
  };

  return (
    <div className="p-4 space-y-6 pb-24">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Minhas Listas</h1>
        <img
          src="/LOGO_REDUZIDA.png"
          alt="Logo Comparify"
          className="w-10 h-10"
        />
      </div>

      {/* Listas */}
      {data.lists.length === 0 ? (
        <p className="text-gray-500 text-center mt-12">Nenhuma lista encontrada.</p>
      ) : (
        <div className="space-y-4">
          {data.lists.map((list: any) => {
            const completed = list.items.filter((i: any) => i.purchased).length;
            const total = list.items.length;
            const totalValue = list.items.reduce(
              (acc: number, i: any) => acc + i.price * i.quantity,
              0
            );

            return (
              <div
                key={list.id}
                className="bg-white p-4 rounded-xl shadow cursor-pointer"
                onClick={() => (window.location.href = `/lists/${list.id}`)}
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
          })}
        </div>
      )}

      {/* Botão Nova Lista */}
      <button
        onClick={handleCreateList}
        className="w-full bg-yellow-500 text-black font-semibold py-3 rounded-xl shadow flex items-center justify-center gap-2 text-base mt-6"
      >
        <PlusIcon className="w-5 h-5" /> Nova lista
      </button>
    </div>
  );
};

export default Lists;
