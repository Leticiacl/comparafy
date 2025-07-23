// src/pages/Lists.tsx
import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataContext } from '../context/DataContext';
import NewListModal from '../components/ui/NewListModal';
import BottomNav from '../components/BottomNav';

const Lists: React.FC = () => {
  const { lists, createList } = useContext(DataContext);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleCreateList = async (name: string) => {
    setShowModal(false);
    const newListId = await createList(name);
    if (newListId) navigate(`/lists/${newListId}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="p-5">
        <img src="/LOGO_REDUZIDA.png" alt="Logo" className="w-24 mb-4" />
        <h1 className="text-2xl font-bold mb-4">Minhas Listas</h1>

        <button
          onClick={() => setShowModal(true)}
          className="w-full bg-yellow-400 text-black font-semibold py-3 mb-6 rounded-xl shadow flex items-center justify-center gap-2"
        >
          + Nova lista
        </button>

        {lists.length > 0 ? (
          <div className="space-y-4">
            {lists.map((list) => (
              <div
                key={list.id}
                className="p-4 bg-white rounded-xl shadow border cursor-pointer"
                onClick={() => navigate(`/lists/${list.id}`)}
              >
                <p className="font-semibold text-lg">{list.name}</p>
                <p className="text-sm text-gray-500">
                  {list.items.length} itens
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Nenhuma lista encontrada.</p>
        )}
      </div>

      <NewListModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onCreate={handleCreateList}
      />

      <BottomNav activeTab="lists" />
    </div>
  );
};

export default Lists;
