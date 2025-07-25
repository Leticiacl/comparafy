import React, { useState } from 'react';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import { useData } from '../context/DataContext';
import NewListModal from '../components/ui/NewListModal';
import { ArrowUpRightIcon } from '@heroicons/react/24/solid';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { userLists } = useData();
  const [modalOpen, setModalOpen] = useState(false);

  const totalEconomy = userLists.reduce((acc, list) => acc + (list.savings || 0), 0);

  return (
    <div className="min-h-screen pb-20 px-4 pt-4 bg-white">
      <Header />

      <h1 className="text-2xl font-bold mb-2">Olá!</h1>
      <p className="text-gray-600 mb-4">Bem-vindo ao Comparify</p>

      <div className="bg-white rounded-xl shadow p-4 mb-6 flex items-center gap-4">
        <ArrowUpRightIcon className="h-10 w-10 text-yellow-500" />
        <div>
          <p className="text-gray-600 text-sm">Economia total</p>
          <p className="text-xl font-semibold text-black">R$ {totalEconomy.toFixed(2)}</p>
        </div>
      </div>

      <button
        onClick={() => setModalOpen(true)}
        className="w-full bg-yellow-500 text-black font-semibold py-3 rounded-xl shadow mb-6 flex items-center justify-center gap-2 text-base"
      >
        + Nova Lista
      </button>

      {userLists.length > 0 && (
        <>
          <h2 className="text-lg font-semibold mb-2">Listas recentes</h2>
          <div className="space-y-4">
            {userLists.map((list) => (
              <Link to={`/list/${list.id}`} key={list.id} className="block">
                <div className="bg-white rounded-xl p-4 shadow hover:bg-yellow-50 transition">
                  <p className="font-semibold text-lg">{list.name}</p>
                  <div className="h-2 bg-gray-200 rounded-full my-2">
                    <div
                      className="h-2 bg-yellow-400 rounded-full"
                      style={{ width: `0%` }} // Pode ser substituído por progresso real
                    />
                  </div>
                  <p className="text-sm text-gray-600">0 de 0 itens comprados</p>
                  <p className="text-sm text-gray-600">Total: R$ 0,00</p>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}

      <NewListModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      <BottomNav activeTab="home" />
    </div>
  );
};

export default Dashboard;
