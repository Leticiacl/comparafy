// src/pages/Dashboard.tsx
import React, { useContext, useState } from 'react';
import { DataContext } from '../context/DataContext';
import { ArrowUpRightIcon } from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';
import { NewListModal } from '../components/ui/NewListModal';
import BottomNav from '../components/BottomNav';

const Dashboard: React.FC = () => {
  const { lists, createNewList } = useContext(DataContext);
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const handleCreateList = async (name: string) => {
    setShowModal(false);
    const newListId = await createNewList(name);
    if (newListId) navigate(`/lists/${newListId}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="p-5">
        <img src="/LOGO_REDUZIDA.png" alt="Logo" className="w-24 mb-4" />
        <h1 className="text-2xl font-bold mb-1">Olá!</h1>
        <p className="text-gray-500 mb-6">Bem-vindo ao Comparify</p>

        <div className="bg-white rounded-2xl p-4 shadow flex items-center">
          <div className="bg-yellow-100 rounded-full p-3 mr-4">
            <ArrowUpRightIcon className="h-6 w-6 text-yellow-500" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Economia total</p>
            <p className="text-2xl font-bold text-gray-900">
              R$ 0,00 {/* valor estático por enquanto, já que savings não existe */}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="w-full bg-yellow-400 text-black font-semibold py-3 mt-6 rounded-xl shadow flex items-center justify-center gap-2"
        >
          + Nova lista
        </button>

        {lists.length > 0 ? (
          <div className="mt-6 space-y-4">
            {lists.map((list) => (
              <div
                key={list.id}
                className="p-4 bg-white rounded-xl shadow border cursor-pointer"
                onClick={() => navigate(`/lists/${list.id}`)}
              >
                <p className="font-semibold text-lg">{list.name}</p>
                <p className="text-sm text-gray-500">{list.items.length} itens</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400 mt-6">Nenhuma lista ainda. Crie sua primeira!</p>
        )}
      </div>

      <NewListModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onCreate={handleCreateList}
      />

      <BottomNav activeTab="home" />
    </div>
  );
};

export default Dashboard;
