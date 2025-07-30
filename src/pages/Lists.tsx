import React, { useEffect, useState } from 'react';
import { useData } from '../context/DataContext';
import BottomNav from '../components/BottomNav';
import NewListModal from '../components/ui/NewListModal';
import ListaCard from '../components/ListaCard';

const Lists: React.FC = () => {
  const { lists, fetchUserData } = useData();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white pb-24">
      <div className="flex justify-between items-center px-4 pt-6 mb-4">
        <h1 className="text-2xl font-semibold text-gray-800">Minhas Listas</h1>
        <img src="/LOGO_REDUZIDA.png" alt="Logo" className="w-10 h-10" />
      </div>

      <div className="px-4 mb-6">
        <button
          onClick={() => setShowModal(true)}
          className="w-full bg-yellow-400 text-black font-semibold py-3 rounded-xl shadow"
        >
          + Nova lista
        </button>
      </div>

      <div className="px-4 space-y-4">
        {lists.length === 0 && <p className="text-center text-gray-500">Nenhuma lista encontrada.</p>}
        {lists.map((list) => {
          const totalItems = list.itens.length;
          const purchased = list.itens.filter((item) => item.comprado).length;
          const total = list.itens.reduce((acc, item) => acc + Number(item.preco || 0), 0);

          return (
            <ListaCard
              key={list.id}
              id={list.id}
              nome={list.nome}
              total={total}
              itens={totalItems}
              comprados={purchased}
            />
          );
        })}
      </div>

      <NewListModal isOpen={showModal} onClose={() => setShowModal(false)} />
      <BottomNav activeTab="lists" />
    </div>
  );
};

export default Lists;
