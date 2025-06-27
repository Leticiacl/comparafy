// src/pages/Lists.tsx
console.log("Path atual:", import.meta.url);
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, XIcon, MoreVerticalIcon } from 'lucide-react';
import { fetchLists, createList } from '../services/firestoreService';  // Verifique o caminho
import { showToast } from '../components/ui/Toaster';

interface List {
  id: string;
  name: string;
  items: {
    name: string;
    quantity: number;
    price: number;
    purchased: boolean;
  }[];
}

const Lists: React.FC = () => {
  const [lists, setLists] = useState<List[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newListName, setNewListName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const userId = sessionStorage.getItem("userId");
    if (userId) {
      fetchLists(userId).then(setLists);
    }
  }, []);

  const handleCreateList = async () => {
    const userId = sessionStorage.getItem("userId");
    if (userId && newListName.trim()) {
      await createList(userId, newListName.trim());
      setNewListName('');
      setIsModalOpen(false);
      const updated = await fetchLists(userId);
      setLists(updated);
      showToast("Lista criada com sucesso", "success");
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Minhas Listas</h1>

      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-yellow-500 text-black py-2 px-4 rounded mb-6"
      >
        <PlusIcon className="inline-block w-4 h-4 mr-2" />
        Nova Lista
      </button>

      {lists.length > 0 ? (
        <div className="space-y-4">
          {lists.map((list) => (
            <div
              key={list.id}
              onClick={() => navigate(`/lists/${list.id}`)}
              className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow cursor-pointer border"
            >
              <div className="flex justify-between items-center">
                <h2 className="font-semibold">{list.name}</h2>
                <MoreVerticalIcon className="w-5 h-5 text-gray-500" />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {list.items.length} itens
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">Você ainda não possui listas.</p>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Nova lista</h2>
              <button onClick={() => setIsModalOpen(false)}>
                <XIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <input
              type="text"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              placeholder="Nome da lista"
              className="w-full p-2 border border-gray-300 rounded"
            />
            <div className="flex justify-end mt-4">
              <button
                onClick={handleCreateList}
                className="bg-yellow-500 text-black px-4 py-2 rounded"
              >
                Criar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Lists;