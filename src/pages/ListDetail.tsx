import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { showToast } from '../components/ui/Toaster';
import { fetchListDetails, updateList } from '../services/firestoreService';
import { ArrowLeftIcon, PlusIcon } from 'lucide-react';
import AddItemModal from '../components/AddItemModal';

const ListDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [list, setList] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const loadList = async () => {
      try {
        const fetchedList = await fetchListDetails(id);
        setList(fetchedList);
        setLoading(false);
      } catch (error) {
        console.error(error);
        showToast('Erro ao carregar lista', 'error');
      }
    };
    loadList();
  }, [id]);

  const handleAddItem = async (item: any) => {
    if (!list || !id) return;
    const updatedItems = [...list.items, { id: Date.now().toString(), ...item }];
    await updateList(id, { items: updatedItems });
    setList({ ...list, items: updatedItems });
    showToast('Item adicionado com sucesso!', 'success');
  };

  if (loading) return <div className="p-6 text-gray-500 dark:text-gray-400">Carregando...</div>;
  if (!list) return <div className="p-6 text-gray-500 dark:text-gray-400">Lista não encontrada.</div>;

  const completedItems = list.items.filter((i: any) => i.purchased).length;
  const totalItems = list.items.length;
  const totalSpent = list.items
    .filter((i: any) => i.purchased)
    .reduce((acc: number, i: any) => acc + i.price * i.quantity, 0);
  const progress = totalItems ? (completedItems / totalItems) * 100 : 0;

  return (
    <div className="p-6 pb-28 min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)}>
          <ArrowLeftIcon className="w-6 h-6 text-gray-700 dark:text-white" />
        </button>
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
          {list.name}
        </h1>
      </header>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow border border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {completedItems}/{totalItems} itens comprados
          </p>
          <p className="text-sm font-medium text-yellow-600">R$ {totalSpent.toFixed(2)}</p>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-yellow-400 h-2 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="grid gap-4">
        {list.items.map((item: any) => (
          <div
            key={item.id}
            className={`p-4 rounded-xl shadow border text-sm transition-all ${
              item.purchased
                ? 'bg-green-50 dark:bg-green-900 border-green-300 dark:border-green-700 text-green-800 dark:text-green-200'
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white'
            }`}
          >
            <div className="flex justify-between mb-1">
              <span className="font-medium">{item.name}</span>
              <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {item.quantity} {item.unit} x R$ {item.price.toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 bg-yellow-500 text-black p-4 rounded-full shadow-lg z-50"
      >
        <PlusIcon className="w-6 h-6" />
      </button>

      {isModalOpen && (
        <AddItemModal onClose={() => setIsModalOpen(false)} onSubmit={handleAddItem} />
      )}
    </div>
  );
};

export default ListDetail;
