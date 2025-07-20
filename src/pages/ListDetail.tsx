// src/pages/ListDetail.tsx
import React from 'react';
import { useParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import { Pencil } from 'lucide-react';

const ListDetail: React.FC = () => {
  const { id } = useParams();
  const { data, updateListNameInContext } = useData();

  const list = data.lists.find((l) => l.id === id);
  const items = data.items?.[id || ''] || [];

  const handleRename = () => {
    const newName = prompt('Digite o novo nome da lista:', list?.name || '');
    if (newName && newName !== list?.name) {
      updateListNameInContext(list.id, newName);
    }
  };

  if (!list) {
    return (
      <div className="p-4 space-y-4 pb-24">
        <Header title="Detalhes da Lista" />
        <p className="text-center text-gray-500">Lista não encontrada.</p>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 pb-24">
      {/* Título com botão de editar */}
      <div className="flex items-center justify-between">
        <Header title={list.name} />
        <button
          onClick={handleRename}
          className="text-gray-500 hover:text-yellow-500"
          title="Editar nome"
        >
          <Pencil className="w-5 h-5" />
        </button>
      </div>

      {/* Lista de itens */}
      {items.length === 0 ? (
        <p className="text-center text-gray-500">Nenhum item nesta lista.</p>
      ) : (
        items.map((item, index) => (
          <div key={index} className="bg-white p-4 rounded-xl shadow">
            <p className="font-medium text-gray-900">{item.name}</p>
            <p className="text-sm text-gray-600">
              Quantidade: {item.quantity} | Preço: R$ {item.price?.toFixed(2) || '0.00'}
            </p>
            {item.purchased && <p className="text-green-600 text-xs mt-1">Comprado</p>}
          </div>
        ))
      )}

      <BottomNav />
    </div>
  );
};

export default ListDetail;
