import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import NewListModal from '../components/ui/NewListModal';
import ListaCard from '../components/ListaCard';
import { ArrowUpRightIcon } from '@heroicons/react/24/outline';
import BottomNav from '../components/BottomNav';

const Dashboard: React.FC = () => {
  const { lists, savings } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const totalEconomizado = savings.reduce((acc, cur) => acc + (typeof cur === 'number' ? cur : 0), 0);

  const listasRecentes = [...lists]
    .filter((l) => l.createdAt)
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 2);

  return (
    <div className="p-4 pb-32 max-w-xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Olá!</h1>
          <p className="text-gray-500 text-base">Bem-vindo ao Comparify</p>
        </div>
        <img src="/LOGO_REDUZIDA.png" alt="Logo" className="h-10" />
      </div>

      <div className="bg-white rounded-2xl shadow p-4 flex items-center gap-4 mb-6">
        <div className="bg-yellow-300 rounded-full p-2">
          <ArrowUpRightIcon className="h-6 w-6 text-white" />
        </div>
        <div>
          <p className="text-gray-500 text-sm">Economia total</p>
          <p className="text-lg font-semibold text-gray-900">R$ {totalEconomizado.toFixed(2)}</p>
        </div>
      </div>

      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full bg-yellow-500 text-black font-semibold py-3 rounded-xl shadow flex items-center justify-center gap-2 text-base mb-6"
      >
        + Nova lista
      </button>

      {listasRecentes.length > 0 && (
        <>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Listas recentes</h2>
          {listasRecentes.map((lista) => {
            const comprados = lista.itens?.filter((item) => item.comprado).length || 0;
            const total = lista.itens?.reduce((acc, item) => acc + (item.preco || 0), 0) || 0;

            return (
              <ListaCard
                key={lista.id}
                id={lista.id}
                nome={lista.nome}
                total={total}
                itens={lista.itens.length}
                comprados={comprados}
              />
            );
          })}
        </>
      )}

      <NewListModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <BottomNav activeTab="home" />
    </div>
  );
};

export default Dashboard;
