import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import { useData } from '../context/DataContext';
import AddItemModal from '../components/ui/AddItemModal';
import { fetchItemsFromList, toggleItemPurchased, deleteItem, deleteList } from '../services/firestoreService';
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import { formatCurrency } from "../utils/formatCurrency";

const ListDetail = () => {
  const { listId } = useParams();
  const navigate = useNavigate();
  const { lists, user, updateListNameInContext } = useData();
  const [items, setItems] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const list = lists.find((l) => l.id === listId);
  const totalItems = items.length;
  const purchasedItems = items.filter((item) => item.purchased).length;
  const progress = totalItems ? (purchasedItems / totalItems) * 100 : 0;
  const totalPrice = items.reduce((acc, item) => acc + (item.price || 0), 0);

  const fetchItems = async () => {
    if (user?.uid && listId) {
      const fetchedItems = await fetchItemsFromList(user.uid, listId);
      setItems(fetchedItems);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [listId, user?.uid]);

  const handleTogglePurchased = async (itemId: string, current: boolean) => {
    if (user?.uid && listId) {
      await toggleItemPurchased(user.uid, listId, itemId, !current);
      fetchItems();
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (user?.uid && listId) {
      await deleteItem(user.uid, listId, itemId);
      fetchItems();
    }
  };

  const handleEditTitle = async () => {
    const newName = prompt('Novo nome da lista:', list?.name);
    if (newName && listId) {
      await updateListNameInContext(listId, newName);
    }
    setMenuOpen(false);
  };

  const handleDeleteList = async () => {
    if (user?.uid && listId) {
      await deleteList(user.uid, listId);
      navigate('/lists');
    }
  };

  return (
    <div className="min-h-screen pb-20 px-4 pt-4 bg-white">
      <Header />

      <div className="flex justify-between items-center mt-4 mb-2 relative">
        <h1 className="text-xl font-bold">{list?.name}</h1>
        <div className="relative">
          <button onClick={() => setMenuOpen(!menuOpen)}>
            <EllipsisVerticalIcon className="h-6 w-6 text-gray-600" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-md z-10 w-36">
              <button onClick={handleEditTitle} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Editar nome
              </button>
              <button onClick={handleDeleteList} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                Excluir lista
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mb-4">
        <div className="h-3 bg-gray-200 rounded-full">
          <div className="h-3 bg-yellow-400 rounded-full" style={{ width: `${progress}%` }}></div>
        </div>
        <div className="flex justify-between text-sm text-gray-600 mt-1">
          <span>{purchasedItems}/{totalItems} itens comprados</span>
          <span>{formatCurrency(totalPrice)}</span>
        </div>
      </div>

      <button onClick={() => setShowModal(true)} className="w-full bg-yellow-500 text-black font-semibold py-3 rounded-xl shadow mb-4">
        + Adicionar item
      </button>

      {items.length === 0 ? (
        <p className="text-center text-gray-500 mt-10">Nenhum item na lista ainda.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between p-4 bg-gray-100 rounded-xl shadow">
              <div className="flex items-start gap-3">
                <input type="checkbox" checked={item.purchased} onChange={() => handleTogglePurchased(item.id, item.purchased)} className="w-5 h-5 mt-1" />
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-gray-600">{item.quantity} {item.unit} • {item.market}</p>
                </div>
              </div>
              <div className="text-right text-sm text-gray-700">
                <p className="font-semibold">{formatCurrency(item.price)}</p>
                <p className="text-gray-500 text-xs">{formatCurrency(item.price / item.quantity)} / {item.unit}</p>
                <div className="flex gap-2 justify-end mt-2">
                  <button className="text-xs text-blue-600">Editar</button>
                  <button onClick={() => handleDeleteItem(item.id)} className="text-xs text-red-500">Excluir</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <AddItemModal isOpen={showModal} onClose={() => setShowModal(false)} listId={listId!} onItemAdded={fetchItems} />
      <BottomNav activeTab="lists" />
    </div>
  );
};

export default ListDetail;
