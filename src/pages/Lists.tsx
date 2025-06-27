import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, XIcon, MoreVerticalIcon } from 'lucide-react';
import { fetchLists, createList } from '../services/firestoreService';
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

  const loadLists = async () => {
    const userId = sessionStorage.getItem("userId");
    if (userId) {
      const fetchedLists = await fetchLists(userId);
      setLists(fetchedLists);
    }
  };

  useEffect(() => {
    loadLists();
  }, []);

  const handleCreateList = async () => {
    const userId = sessionStorage.getItem("userId");
    if (userId && newListName.trim()) {
      await createList(userId, newListName.trim());
      showToast("Lista criada com sucesso", "success");
      setNewListName('');
      setIsModalOpen(false);
      await loadLists();
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Minhas Listas</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-yellow-500 text-black py-2 px-4 rounded flex items-center"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Nova Lista
        </button>
      </div>

      {lists.length > 0 ? (
        <div className="space-y-4">
          {lists.map((list) => (
            <div
              key={list.id}
              onClick={() => navigate(`/lists/${list.id}`)}
              className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 cursor-pointer"
            >
              <div className="flex justify-between items-center">
                <h2 className="font-medium">{list.name}</h2>
                <MoreVerticalIcon className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {list.items.length} item{list.items.length !== 1 && 's'}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 dark:text-gray-400">Você ainda não possui listas.</p>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-sm">
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
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white"
              autoFocus
            />
            <div className="flex justify-end mt-4">
              <button
                onClick={handleCreateList}
                className="bg-yellow-500 text-black font-medium px-4 py-2 rounded-lg"
                disabled={!newListName.trim()}
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
