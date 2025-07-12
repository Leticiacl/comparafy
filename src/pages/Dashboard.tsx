// src/pages/Dashboard.tsx
import React from 'react';
import { useData } from '../context/DataContext';
import { ArrowUpRightIcon, PlusIcon } from 'lucide-react';
import { createList } from '../services/firestoreService';

const Dashboard: React.FC = () => {
  const { data, reloadLists } = useData();
  const hasLists = data.lists && data.lists.length > 0;
  const totalSavings =
    data.savings?.reduce((acc, curr) => acc + curr.amount, 0) || 0;

  const handleCreateList = async () => {
    alert('🟡 Clique detectado no botão');
    console.log('✅ Botão clicado');

    try {
      if (!data?.user?.id) {
        alert('⚠️ Usuário não identificado');
        console.warn('⚠️ ID do usuário ausente:', data.user);
        return;
      }

      console.log('📤 Criando lista para o usuário:', data.user.id);
      const newList = await createList(data.user.id, 'Nova Lista');

      if (!newList?.id) {
        alert('❌ Lista não foi criada corretamente');
        console.error('❌ Objeto retornado inválido:', newList);
        return;
      }

      console.log('📦 Nova lista criada com sucesso:', newList);
      await reloadLists();
      console.log('🔄 Listas recarregadas');

      // Redireciona para nova lista
      window.location.href = `/lists/${newList.id}`;
    } catch (error: any) {
      console.error('❌ Erro ao criar nova lista:', error);
      alert(`❌ Erro ao criar lista: ${error?.message || error}`);
    }
  };

  return (
    <div className="p-4 space-y-6 pb-24">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Olá!</h1>
          <p className="text-gray-500">Bem-vindo ao Comparify</p>
        </div>
        <img
          src="/LOGO_REDUZIDA.png"
          alt="Logo Comparify"
          className="w-10 h-10"
        />
      </div>

      {/* Economia Total */}
      <div className="bg-white p-4 rounded-xl shadow flex items-center gap-4">
        <div className="bg-yellow-100 p-3 rounded-full">
          <ArrowUpRightIcon className="text-yellow-500 w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-gray-500">Economia total</p>
          <p className="text-2xl font-bold text-gray-900">
            R$ {totalSavings.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Listas Recentes */}
      {hasLists && (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold text-gray-900">Listas recentes</h2>
            <span className="text-sm text-yellow-500 cursor-pointer">Ver todas</span>
          </div>

          {data.lists.map((list: any) => {
            const completed = list.items?.filter((i: any) => i.purchased).length || 0;
            const total = list.items?.length || 0;
            const totalValue =
              list.items?.reduce(
                (acc: number, i: any) => acc + (i.price || 0) * (i.quantity || 0),
                0
              ) || 0;

            return (
              <div key={list.id} className="bg-white p-4 rounded-xl shadow">
                <div className="flex justify-between items-center">
                  <p className="text-gray-900 font-medium">{list.name}</p>
                  <p className="text-sm text-gray-500">
                    {completed}/{total} itens
                  </p>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded mt-2 overflow-hidden">
                  <div
                    className="h-full bg-yellow-500"
                    style={{
                      width: `${(completed / total) * 100 || 0}%`,
                    }}
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
      <div className="pt-4">
        <button
          onClick={handleCreateList}
          className="w-full bg-yellow-500 text-black font-semibold py-3 rounded-xl shadow flex items-center justify-center gap-2 text-base"
        >
          <PlusIcon className="w-5 h-5" />
          Nova lista
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
