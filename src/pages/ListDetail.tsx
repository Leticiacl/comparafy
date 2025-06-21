import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, PlusIcon, XIcon, CheckIcon, TrashIcon, PencilIcon } from 'lucide-react';
import { useData, Item } from '../context/DataContext';
import { showToast } from '../components/ui/Toaster';
const ListDetail: React.FC = () => {
  const {
    id
  } = useParams<{
    id: string;
  }>();
  const navigate = useNavigate();
  const {
    lists,
    stores,
    updateList
  } = useData();
  const list = lists.find(l => l.id === id);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [newItem, setNewItem] = useState<Omit<Item, 'id' | 'purchased'>>({
    name: '',
    quantity: 1,
    unit: 'un',
    price: 0,
    notes: '',
    storeId: stores[0]?.id || ''
  });
  if (!list) {
    return <div className="text-center py-10">
        <p className="text-gray-500 dark:text-gray-400">Lista não encontrada</p>
        <button onClick={() => navigate('/lists')} className="mt-4 text-yellow-500">
          Voltar para listas
        </button>
      </div>;
  }
  const completedItems = list.items.filter(item => item.purchased).length;
  const progress = list.items.length > 0 ? completedItems / list.items.length * 100 : 0;
  const totalPrice = list.items.filter(item => item.purchased).reduce((acc, item) => acc + item.price * item.quantity, 0);
  const handleToggleItem = (itemId: string) => {
    const updatedItems = list.items.map(item => item.id === itemId ? {
      ...item,
      purchased: !item.purchased
    } : item);
    updateList({
      ...list,
      items: updatedItems
    });
  };
  const handleAddItem = () => {
    if (newItem.name.trim() && newItem.price > 0) {
      const updatedItems = [...list.items, {
        id: Date.now().toString(),
        purchased: false,
        ...newItem
      }];
      updateList({
        ...list,
        items: updatedItems
      });
      setIsAddModalOpen(false);
      setNewItem({
        name: '',
        quantity: 1,
        unit: 'un',
        price: 0,
        notes: '',
        storeId: stores[0]?.id || ''
      });
      showToast('Item adicionado com sucesso', 'success');
    } else {
      showToast('Preencha os campos obrigatórios', 'error');
    }
  };
  const handleEditItem = () => {
    if (editingItemId && newItem.name.trim() && newItem.price > 0) {
      const updatedItems = list.items.map(item => item.id === editingItemId ? {
        ...item,
        ...newItem
      } : item);
      updateList({
        ...list,
        items: updatedItems
      });
      setIsEditModalOpen(false);
      setEditingItemId(null);
      showToast('Item atualizado com sucesso', 'success');
    }
  };
  const handleDeleteItem = (itemId: string) => {
    const updatedItems = list.items.filter(item => item.id !== itemId);
    updateList({
      ...list,
      items: updatedItems
    });
    showToast('Item removido com sucesso', 'success');
  };
  const openEditModal = (item: Item) => {
    setEditingItemId(item.id);
    setNewItem({
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      price: item.price,
      notes: item.notes || '',
      storeId: item.storeId
    });
    setIsEditModalOpen(true);
  };
  return <div>
      <header className="mb-6">
        <button onClick={() => navigate('/lists')} className="flex items-center text-gray-500 mb-4">
          <ArrowLeftIcon className="w-5 h-5 mr-1" />
          <span>Voltar</span>
        </button>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{list.name}</h1>
          <div className="w-8 h-8 flex-shrink-0">
            <img src="/LOGO_REDUZIDA.png" alt="Comparify" className="w-full h-full object-contain" />
          </div>
        </div>
      </header>
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {completedItems}/{list.items.length} itens comprados
          </span>
          <span className="text-sm font-medium">
            R$ {totalPrice.toFixed(2)}
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div className="bg-yellow-500 h-2 rounded-full transition-all duration-300" style={{
          width: `${progress}%`
        }}></div>
        </div>
      </div>
      <button onClick={() => setIsAddModalOpen(true)} className="w-full py-3 bg-yellow-500 text-black font-medium rounded-lg flex items-center justify-center mb-6">
        <PlusIcon className="w-5 h-5 mr-2" />
        Adicionar item
      </button>
      {list.items.length > 0 ? <div className="space-y-3 mb-4">
          {list.items.map(item => {
        const store = stores.find(s => s.id === item.storeId);
        return <div key={item.id} className={`flex items-center p-4 rounded-lg border ${item.purchased ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
                <button onClick={() => handleToggleItem(item.id)} className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center mr-3 ${item.purchased ? 'bg-yellow-500' : 'border-2 border-gray-300 dark:border-gray-600'}`}>
                  {item.purchased && <CheckIcon className="w-4 h-4 text-black" />}
                </button>
                <div className="flex-grow">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className={`font-medium ${item.purchased ? 'line-through text-gray-500 dark:text-gray-400' : ''}`}>
                        {item.name}
                      </h3>
                      <div className="flex gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
                        <span>
                          {item.quantity} {item.unit}
                        </span>
                        {store && <span>• {store.name}</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        R$ {(item.price * item.quantity).toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        R$ {item.price.toFixed(2)}/{item.unit}
                      </div>
                    </div>
                  </div>
                  {item.notes && <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      {item.notes}
                    </p>}
                  <div className="mt-2 flex gap-3">
                    <button onClick={() => openEditModal(item)} className="text-gray-500 dark:text-gray-400 flex items-center text-xs">
                      <PencilIcon className="w-3.5 h-3.5 mr-1" />
                      Editar
                    </button>
                    <button onClick={() => handleDeleteItem(item.id)} className="text-red-500 flex items-center text-xs">
                      <TrashIcon className="w-3.5 h-3.5 mr-1" />
                      Excluir
                    </button>
                  </div>
                </div>
              </div>;
      })}
        </div> : <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Esta lista ainda não tem itens
          </p>
          <button onClick={() => setIsAddModalOpen(true)} className="text-yellow-500 font-medium">
            Adicionar primeiro item
          </button>
        </div>}
      {/* Add Item Modal */}
      {isAddModalOpen && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Adicionar item</h2>
              <button onClick={() => setIsAddModalOpen(false)}>
                <XIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nome do produto *
                </label>
                <input type="text" value={newItem.name} onChange={e => setNewItem({
              ...newItem,
              name: e.target.value
            })} placeholder="Ex: Arroz integral" className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900" autoFocus />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Quantidade *
                  </label>
                  <input type="number" min="1" value={newItem.quantity} onChange={e => setNewItem({
                ...newItem,
                quantity: parseInt(e.target.value) || 1
              })} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Unidade *
                  </label>
                  <select value={newItem.unit} onChange={e => setNewItem({
                ...newItem,
                unit: e.target.value as 'un' | 'g' | 'kg'
              })} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900">
                    <option value="un">unidade (un)</option>
                    <option value="g">gramas (g)</option>
                    <option value="kg">quilos (kg)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Preço (R$) *
                </label>
                <input type="number" min="0" step="0.01" value={newItem.price} onChange={e => setNewItem({
              ...newItem,
              price: parseFloat(e.target.value) || 0
            })} placeholder="0,00" className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Mercado
                </label>
                <select value={newItem.storeId} onChange={e => setNewItem({
              ...newItem,
              storeId: e.target.value
            })} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900">
                  {stores.map(store => <option key={store.id} value={store.id}>
                      {store.name}
                    </option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Observações (opcional)
                </label>
                <textarea value={newItem.notes} onChange={e => setNewItem({
              ...newItem,
              notes: e.target.value
            })} placeholder="Ex: Marca preferida, localização no mercado" className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900" rows={2} />
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-600 dark:text-gray-400 mr-4">
                Cancelar
              </button>
              <button onClick={handleAddItem} className="bg-yellow-500 text-black font-medium px-4 py-2 rounded-lg" disabled={!newItem.name.trim() || newItem.price <= 0}>
                Adicionar
              </button>
            </div>
          </div>
        </div>}
      {/* Edit Item Modal */}
      {isEditModalOpen && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Editar item</h2>
              <button onClick={() => setIsEditModalOpen(false)}>
                <XIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nome do produto *
                </label>
                <input type="text" value={newItem.name} onChange={e => setNewItem({
              ...newItem,
              name: e.target.value
            })} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900" autoFocus />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Quantidade *
                  </label>
                  <input type="number" min="1" value={newItem.quantity} onChange={e => setNewItem({
                ...newItem,
                quantity: parseInt(e.target.value) || 1
              })} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Unidade *
                  </label>
                  <select value={newItem.unit} onChange={e => setNewItem({
                ...newItem,
                unit: e.target.value as 'un' | 'g' | 'kg'
              })} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900">
                    <option value="un">unidade (un)</option>
                    <option value="g">gramas (g)</option>
                    <option value="kg">quilos (kg)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Preço (R$) *
                </label>
                <input type="number" min="0" step="0.01" value={newItem.price} onChange={e => setNewItem({
              ...newItem,
              price: parseFloat(e.target.value) || 0
            })} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Mercado
                </label>
                <select value={newItem.storeId} onChange={e => setNewItem({
              ...newItem,
              storeId: e.target.value
            })} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900">
                  {stores.map(store => <option key={store.id} value={store.id}>
                      {store.name}
                    </option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Observações (opcional)
                </label>
                <textarea value={newItem.notes} onChange={e => setNewItem({
              ...newItem,
              notes: e.target.value
            })} className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900" rows={2} />
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-600 dark:text-gray-400 mr-4">
                Cancelar
              </button>
              <button onClick={handleEditItem} className="bg-yellow-500 text-black font-medium px-4 py-2 rounded-lg" disabled={!newItem.name.trim() || newItem.price <= 0}>
                Salvar
              </button>
            </div>
          </div>
        </div>}
    </div>;
};
export default ListDetail;