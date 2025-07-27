import React, { useState } from 'react';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import { useData } from '../context/DataContext';
import NewListModal from '../components/ui/NewListModal';
import { Link } from 'react-router-dom';

const Lists = () => {
  const { userLists } = useData();
  const [modalOpen, setModalOpen] = useState(false);

  const getProgress = (items: any[]) => {
    const total = items.length;
    const done = items.filter((i) => i.purchased).length;
    return total ? (done / total) * 100 : 0;
  };

  const getTotal = (items: any[]) =>
    items.reduce((acc, item) => acc + (item.price || 0), 0);

  return (
    <div className="min-h-screen pb-20 px-4 pt-4 bg-white">
      <Header />

      <h1 className="text-2xl font-bold mb-4">Minhas Listas</h1>

      <button
        onClick={() => setModalOpen(true)}
        className="w-full bg-yellow-500 text-black font-semibold py-3 rounded-xl shadow mb-6"
      >
        + Nova Lista
      </button>

      {userLists.length === 0 ? (
        <p className="text-center text-gray-500 mt-10">Nenhuma lista encontrada.</p>
      ) : (
        userLists.map((list) => {
          const progress = getProgress(list.items || []);
          const total = getTotal(list.items || []);
          const done = (list.items || []).filter((i) => i.purchased).length;
          const count = (list.items || []).length;

          return (
            <Link to={`/list/${list.id}`} key={list.id} className="block mb-4">
              <div className="bg-white rounded-xl p-4 shadow hover:bg-yellow-50 transition">
                <p className="font-semibold text-lg">{list.name}</p>
                <div className="h-2 bg-gray-200 rounded-full my-2">
                  <div
                    className="h-2 bg-yellow-400 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600">
                  {done}/{count} itens comprados
                </p>
                <p className="text-sm text-gray-600">Total: R$ {total.toFixed(2)}</p>
              </div>
            </Link>
          );
        })
      )}

      <NewListModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      <BottomNav activeTab="lists" />
    </div>
  );
};

export default Lists;
