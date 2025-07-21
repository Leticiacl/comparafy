import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import BottomNav from '../components/BottomNav';

const ListDetail: React.FC = () => {
  const { listId } = useParams<{ listId: string }>();
  const { lists, updateListNameInContext } = useData();
  const list = lists.find((l) => l.id === listId);

  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(list?.name || '');

  const handleEditName = async () => {
    if (list && newName.trim()) {
      await updateListNameInContext(list.id, newName.trim());
      setIsEditingName(false);
    }
  };

  if (!list) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-gray-600">
        Lista não encontrada.
      </div>
    );
  }

  const total = list.items.reduce((sum, item) => sum + (item.price || 0), 0);

  return (
    <div className="flex flex-col min-h-screen bg-white pb-20">
      <div className="flex items-center justify-between p-4">
        {isEditingName ? (
          <div className="flex gap-2 w-full">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="flex-1 border rounded px-3 py-2 text-gray-800"
              placeholder="Nome da lista"
            />
            <button
              onClick={handleEditName}
              className="bg-yellow-500 text-black px-4 py-2 rounded font-semibold"
            >
              Salvar
            </button>
          </div>
        ) : (
          <>
            <h1 className="text-xl font-bold text-gray-800">{list.name}</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditingName(true)}
                className="text-sm text-blue-600"
              >
                Editar
              </button>
              <img src="/LOGO_REDUZIDA.png" alt="Logo" className="h-8 w-8" />
            </div>
          </>
        )}
      </div>

      <div className="px-4 text-sm text-gray-600 mb-2">
        Total: <span className="font-semibold text-black">R$ {total.toFixed(2)}</span>
      </div>

      <div className="px-4">
        {list.items.length === 0 ? (
          <p className="text-center text-gray-500 mt-8">Sua lista está vazia.</p>
        ) : (
          <ul className="space-y-2">
            {list.items.map((item, index) => (
              <li
                key={index}
                className="border rounded-xl p-3 shadow flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold text-gray-800">{item.name}</p>
                  <p className="text-sm text-gray-500">R$ {item.price?.toFixed(2)}</p>
                </div>
                <input
                  type="checkbox"
                  checked={item.checked}
                  disabled
                  className="h-5 w-5 accent-yellow-500"
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      <BottomNav activeTab="lists" />
    </div>
  );
};

export default ListDetail;
