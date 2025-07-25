import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import { useData } from '../context/DataContext';
import AddItemModal from '../components/ui/AddItemModal';

import {
  fetchItemsFromList,
  toggleItemPurchased,
  deleteItem,
} from '../services/firestoreService';

const ListDetail = () => {
  const { listId } = useParams();
  const { lists, user, updateListNameInContext } = useData();
  const [items, setItems] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);

  const list = lists.find((l) => l.id === listId);
  const totalItems = items.length;
  const purchasedItems = items.filter((item) => item.purchased).length;
  const progress = totalItems ? (purchasedItems / totalItems) * 100 : 0;

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
  };

  return (
    <div className="min-h-screen pb-20 px-4 pt-4 bg-white">
      <Header />

      <div className="flex justify-between items-center mt-4 mb-2">
        <h1 className="text-xl font-bold">{list?.name}</h1>
        <button
          onClick={handleEditTitle}
          className="text-sm text-blue-500 underline"
        >
          Editar nome
        </button>
      </div>

      <div className="mb-4">
        <div className="h-3 bg-gray-200 rounded-full">
          <div
            className="h-3 bg-yellow-400 rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          {purchasedItems} de {totalItems} itens comprados
        </p>
      </div>

      <button
        onClick={() => setShowModal(true)}
        className="w-full bg-yellow-500 text-black font-semibold py-3 rounded-xl shadow mb-4"
      >
        + Adicionar item
      </button>

      {items.length === 0 ? (
        <p className="text-center text-gray-500 mt-10">
          Nenhum item na lista ainda.
        </p>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className={`flex items-center justify-between p-3 rounded-lg shadow ${
                item.purchased ? 'bg-green-100' : 'bg-gray-100'
              }`}
            >
              <div>
                <p className="font-semibold">{item.name}</p>
                <p className="text-sm text-gray-600">
                  {item.quantity} {item.unit} • {item.market} • R${' '}
                  {item.price}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={item.purchased}
                  onChange={() =>
                    handleTogglePurchased(item.id, item.purchased)
                  }
                  className="w-5 h-5"
                />
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className="text-red-500 text-sm"
                >
                  Excluir
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <AddItemModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        listId={listId!}
        onItemAdded={fetchItems}
      />

      <BottomNav activeTab="lists" />
    </div>
  );
};

export default ListDetail;
