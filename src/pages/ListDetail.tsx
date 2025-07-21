import React from 'react';
import { useParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import BottomNav from '../components/BottomNav';

const ListDetail = () => {
  const { listId } = useParams();
  const { data, updateListNameInContext } = useData();

  const list = data.lists.find((l) => l.id === listId);
  const items = data.items[listId] || [];

  const handleRename = () => {
    const newName = prompt('Digite o novo nome da lista:', list?.name);
    if (newName && newName !== list.name) {
      updateListNameInContext(listId, newName);
    }
  };

  if (!list) return <p>Lista não encontrada.</p>;

  return (
    <div className="p-4 pb-24">
      <div className="flex justify-between items-center mb-4">
        <img src="/LOGO_REDUZIDA.png" alt="Comparify" className="h-10" />
        <button
          onClick={handleRename}
          className="text-sm text-blue-600 underline"
        >
          Editar nome
        </button>
      </div>

      <h1 className="text-xl font-bold mb-2">{list.name}</h1>

      {items.length === 0 ? (
        <p className="text-gray-500">Sua lista ainda está vazia.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id} className="p-3 bg-white rounded shadow">
              <div className="font-medium">{item.name}</div>
              <div className="text-sm text-gray-500">
                {item.quantity} × R$ {item.price?.toFixed(2)}
              </div>
            </li>
          ))}
        </ul>
      )}

      <BottomNav activeTab="lists" />
    </div>
  );
};

export default ListDetail;
