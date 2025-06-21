import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, XIcon, TrendingUpIcon } from 'lucide-react';
import { useData } from '../context/DataContext';
import { showToast } from '../components/ui/Toaster';
const Dashboard: React.FC = () => {
  const {
    lists,
    savings,
    addList
  } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newListName, setNewListName] = useState('');
  const navigate = useNavigate();
  const recentLists = lists.slice(0, 3);
  const totalSavings = savings.reduce((acc, curr) => acc + curr.amount, 0);
  const handleCreateList = () => {
    if (newListName.trim()) {
      addList(newListName.trim());
      setNewListName('');
      setIsModalOpen(false);
      showToast('Lista criada com sucesso', 'success');
    }
  };
  return <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Olá!</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Bem-vindo ao Comparify
          </p>
        </div>
        <div className="w-10 h-10 flex-shrink-0">
          <img src="/LOGO_REDUZIDA.png" alt="Comparify" className="w-full h-full object-contain" />
        </div>
      </header>
      <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 flex items-center">
        <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900/30 mr-4">
          <TrendingUpIcon className="w-6 h-6 text-yellow-500" />
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Economia total
          </p>
          <p className="text-2xl font-bold">R$ {totalSavings.toFixed(2)}</p>
        </div>
      </div>
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium">Listas recentes</h2>
          <button onClick={() => navigate('/lists')} className="text-sm text-yellow-500 font-medium">
            Ver todas
          </button>
        </div>
        {recentLists.length > 0 ? <div className="space-y-3">
            {recentLists.map(list => {
          const completedItems = list.items.filter(item => item.purchased).length;
          const totalItems = list.items.length;
          const progress = totalItems > 0 ? completedItems / totalItems * 100 : 0;
          const totalPrice = list.items.filter(item => item.purchased).reduce((acc, item) => acc + item.price * item.quantity, 0);
          return <div key={list.id} onClick={() => navigate(`/lists/${list.id}`)} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">{list.name}</h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {completedItems}/{totalItems} itens
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{
                width: `${progress}%`
              }}></div>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Total: R$ {totalPrice.toFixed(2)}
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
      </section>
      <button onClick={() => navigate('/lists')} className="w-full py-3 bg-yellow-500 text-black font-medium rounded-lg flex items-center justify-center">
        <PlusIcon className="w-5 h-5 mr-2" />
        Nova lista
      </button>
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
    </div>;
};
export default Dashboard;