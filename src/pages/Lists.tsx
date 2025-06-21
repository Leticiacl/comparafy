import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, XIcon, MoreVerticalIcon, PencilIcon, CopyIcon, TrashIcon, CheckIcon } from 'lucide-react';
import { useData, ShoppingList } from '../context/DataContext';
import { showToast } from '../components/ui/Toaster';
const Lists: React.FC = () => {
  const {
    lists,
    addList,
    updateList,
    deleteList
  } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [activeListId, setActiveListId] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editListName, setEditListName] = useState('');
  const navigate = useNavigate();
  const handleCreateList = () => {
    if (newListName.trim()) {
      const list = addList(newListName.trim());
      setNewListName('');
      setIsModalOpen(false);
      showToast('Lista criada com sucesso', 'success');
      // Reset state after creating list
      setActiveListId(null);
      setIsMenuOpen(false);
      setIsEditModalOpen(false);
      setEditListName('');
    }
  };
  const handleListClick = (listId: string) => {
    navigate(`/lists/${listId}`);
  };
  const handleMenuClick = (e: React.MouseEvent, listId: string) => {
    e.stopPropagation();
    setActiveListId(listId);
    setIsMenuOpen(true);
  };
  const handleEditClick = () => {
    const list = lists.find(l => l.id === activeListId);
    if (list) {
      setEditListName(list.name);
      setIsMenuOpen(false);
      setIsEditModalOpen(true);
    }
  };
  const handleDuplicateList = () => {
    const list = lists.find(l => l.id === activeListId);
    if (list) {
      const newList = addList(`${list.name} (Cópia)`);
      list.items.forEach(item => {
        // Clone items without purchased state
        const {
          id,
          purchased,
          ...itemData
        } = item;
        // @ts-ignore - we're handling the ID in the addItemToList function
        updateList({
          ...newList,
          items: [...newList.items, {
            ...itemData,
            purchased: false
          }]
        });
      });
      setIsMenuOpen(false);
      showToast('Lista duplicada com sucesso', 'success');
    }
  };
  const handleDeleteList = () => {
    if (activeListId) {
      deleteList(activeListId);
      setIsMenuOpen(false);
      showToast('Lista excluída com sucesso', 'success');
    }
  };
  const handleSaveEdit = () => {
    if (activeListId && editListName.trim()) {
      const list = lists.find(l => l.id === activeListId);
      if (list) {
        updateList({
          ...list,
          name: editListName.trim()
        });
        setIsEditModalOpen(false);
        showToast('Lista renomeada com sucesso', 'success');
      }
    }
  };
  return <div>
      <header className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Minhas Listas</h1>
          <div className="w-8 h-8 flex-shrink-0">
            <img src="/LOGO_REDUZIDA.png" alt="Comparify" className="w-full h-full object-contain" />
          </div>
        </div>
      </header>
      <button onClick={() => setIsModalOpen(true)} className="w-full py-3 bg-yellow-500 text-black font-medium rounded-lg flex items-center justify-center mb-6">
        <PlusIcon className="w-5 h-5 mr-2" />
        Nova lista
      </button>
      {lists.length > 0 ? <div className="space-y-3">
          {lists.map(list => {
        const completedItems = list.items.filter(item => item.purchased).length;
        const totalItems = list.items.length;
        const progress = totalItems > 0 ? completedItems / totalItems * 100 : 0;
        const totalPrice = list.items.filter(item => item.purchased).reduce((acc, item) => acc + item.price * item.quantity, 0);
        return <div key={list.id} onClick={() => handleListClick(list.id)} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">{list.name}</h3>
                  <button onClick={e => handleMenuClick(e, list.id)} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                    <MoreVerticalIcon className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{
              width: `${progress}%`
            }}></div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    {completedItems}/{totalItems} itens
                  </span>
                  <span className="text-gray-600 dark:text-gray-300">
                    R$ {totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>;
      })}
        </div> : <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Você ainda não tem listas de compras
          </p>
          <button onClick={() => setIsModalOpen(true)} className="text-yellow-500 font-medium">
            Criar primeira lista
          </button>
        </div>}
      {/* Create List Modal */}
      {isModalOpen && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Nova lista</h2>
              <button onClick={() => setIsModalOpen(false)}>
                <XIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nome da lista
              </label>
              <input type="text" value={newListName} onChange={e => setNewListName(e.target.value)} placeholder="Ex: Compras do mês" className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900" autoFocus />
            </div>
            <div className="flex justify-end">
              <button onClick={() => setIsModalOpen(false)} className="text-gray-600 dark:text-gray-400 mr-4">
                Cancelar
              </button>
              <button onClick={handleCreateList} className="bg-yellow-500 text-black font-medium px-4 py-2 rounded-lg" disabled={!newListName.trim()}>
                Criar
              </button>
            </div>
          </div>
        </div>}
      {/* List Menu Modal */}
      {isMenuOpen && <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black/30" onClick={() => setIsMenuOpen(false)}></div>
          <div className="bg-white dark:bg-gray-800 rounded-lg w-72 overflow-hidden z-10">
            <div className="p-2">
              <button onClick={handleEditClick} className="flex items-center w-full px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <PencilIcon className="w-5 h-5 mr-3 text-gray-500" />
                <span>Renomear lista</span>
              </button>
              <button onClick={handleDuplicateList} className="flex items-center w-full px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <CopyIcon className="w-5 h-5 mr-3 text-gray-500" />
                <span>Duplicar lista</span>
              </button>
              <button onClick={handleDeleteList} className="flex items-center w-full px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-red-500">
                <TrashIcon className="w-5 h-5 mr-3" />
                <span>Excluir lista</span>
              </button>
            </div>
          </div>
        </div>}
      {/* Edit List Modal */}
      {isEditModalOpen && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Renomear lista</h2>
              <button onClick={() => setIsEditModalOpen(false)}>
                <XIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nome da lista
              </label>
              <input type="text" value={editListName} onChange={e => setEditListName(e.target.value)} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900" autoFocus />
            </div>
            <div className="flex justify-end">
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-600 dark:text-gray-400 mr-4">
                Cancelar
              </button>
              <button onClick={handleSaveEdit} className="bg-yellow-500 text-black font-medium px-4 py-2 rounded-lg" disabled={!editListName.trim()}>
                Salvar
              </button>
            </div>
          </div>
        </div>}
    </div>;
};
export default Lists;