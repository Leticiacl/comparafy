import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import NewListModal from '../components/ui/NewListModal';
import ListaCard from '../components/ListaCard';
import BottomNav from '../components/BottomNav';

const Dashboard: React.FC = () => {
  const { lists, savings } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Se savings for número, usa direto; se for array (versões antigas), faz reduce; senão 0.
  const totalEconomizado = typeof savings === 'number'
    ? savings
    : Array.isArray(savings)
      ? savings.reduce((acc, cur) => acc + (typeof cur === 'number' ? cur : 0), 0)
      : 0;

  const listasRecentes = [...lists]
    .filter(l => l.createdAt)
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 2);

  return (
    <div className="p-4 pb-32 max-w-xl mx-auto bg-white">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Olá!</h1>
          <p className="text-gray-500 text-base">Bem-vindo ao Comparify</p>
        </div>
        <img src="/LOGO_REDUZIDA.png" alt="Logo" className="h-10" />
      </div>

      {/* Cartão de economia */}
      <div className="bg-white rounded-2xl shadow p-4 flex items-center gap-4 mb-6">
        <div className="bg-yellow-300 rounded-full p-2">
          {/* ícone importado de Heroicons */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 7l4-4m0 0l4 4m-4-4v18"
            />
          </svg>
        </div>
        <div>
          <p className="text-gray-500 text-sm">Economia total</p>
          <p className="text-lg font-semibold text-gray-900">
            R$ {totalEconomizado.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Botão nova lista */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full bg-yellow-500 text-black font-semibold py-3 rounded-xl shadow flex items-center justify-center gap-2 text-base mb-6"
      >
        + Nova lista
      </button>

      {/* Listas recentes */}
      {listasRecentes.length > 0 && (
        <>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Listas recentes</h2>
          {listasRecentes.map(lista => {
            const comprados = lista.itens.filter(i => i.comprado).length;
            const total = lista.itens.reduce((sum, i) => sum + (i.preco || 0), 0);
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
