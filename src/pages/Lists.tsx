import React, { useEffect, useState } from 'react';
import { useData } from '../context/DataContext';
import BottomNav from '../components/BottomNav';
import NewListModal from '../components/ui/NewListModal';
import { useNavigate } from 'react-router-dom';

const Lists: React.FC = () => {
  const { lists, fetchUserData } = useData();
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white pb-24">
      {/* Header com logo */}
      <div className="flex justify-between items-center px-4 pt-6 mb-4">
        <h1 className="text-2xl font-semibold text-gray-800">Minhas Listas</h1>
        <img src="/LOGO_REDUZIDA.png" alt="Logo" className="w-10 h-10" />
      </div>

      {/* Botão Nova Lista */}
      <div className="px-4 mb-6">
        <button
          onClick={() => setShowModal(true)}
          className="w-full bg-yellow-400 text-black font-semibold py-3 rounded-xl shadow"
        >
          + Nova lista
        </button>
      </div>

      {/* Listas */}
      <div className="px-4 space-y-4">
        {lists.length === 0 && (
          <p className="text-center text-gray-500">Nenhuma lista encontrada.</p>
        )}
        {lists.map((list) => {
          const totalItems = list.items?.length || 0;
          const purchased = list.items?.filter((item) => item.purchased).length || 0;
          const total = list.items?.reduce((acc, item) => acc + Number(item.price || 0), 0);

          return (
            <div
              key={list.id}
              className="border border-gray-200 rounded-lg p-4 shadow cursor-pointer"
              onClick={() => navigate(`/list/${list.id}`)}
            >
              <div className="flex justify-between mb-1">
                <p className="font-medium text-gray-800">{list.name}</p>
                <p className="text-sm text-gray-500">
                  {purchased}/{totalItems} itens
                </p>
              </div>
              {/* Barra de progresso */}
              <div className="w-full h-2 bg-gray-100 rounded-full mb-1">
                <div
                  className="h-2 bg-yellow-400 rounded-full"
                  style={{ width: `${(purchased / totalItems) * 100 || 0}%` }}
                />
              </div>
              <p className="text-sm text-gray-600">Total: R$ {total.toFixed(2)}</p>
            </div>
          );
        })}
      </div>

      {/* Modal de Nova Lista */}
      <NewListModal isOpen={showModal} onClose={() => setShowModal(false)} />

      {/* Navegação inferior */}
      <BottomNav activeTab="lists" />
    </div>
  );
};

export default Lists;
