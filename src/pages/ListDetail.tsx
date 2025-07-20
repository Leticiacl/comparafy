// src/pages/ListDetail.tsx
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';

const ListDetail: React.FC = () => {
  const { id } = useParams();
  const { data, updateListNameInContext } = useData();

  const list = data.lists.find((l) => l.id === id);
  const items = data.items?.[id || ''] || [];

  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(list?.name || '');

  const handleRename = () => {
    if (id && newName) {
      updateListNameInContext(id, newName);
      setEditingName(false);
    }
  };

  if (!list) {
    return (
      <div className="p-4 space-y-4 pb-24">
        <Header title="Detalhes da Lista" />
        <p className="text-center text-gray-500">Lista não encontrada.</p>
        <BottomNav activeTab="" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 pb-24">
      <Header title="">
        <div className="flex justify-between items-center">
          {editingName ? (
            <div className="flex gap-2 w-full">
              <input
                type="text"
                className="border rounded px-2 py-1 w-full"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              <button onClick={handleRename} className="text-sm text-yellow-500 font-medium">
                Salvar
              </button>
            </div>
          ) : (
            <div className="flex justify-between items-center w-full">
              <h1 className="text-xl font-semibold text-gray-900">{list.name}</h1>
              <button onClick={() => setEditingName(true)} className="text-sm text-yellow-500 font-medium">
                Editar
              </button>
            </div>
          )}
        </div>
      </Header>

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

      <BottomNav activeTab="" />
    </div>
  );
};

export default ListDetail;
