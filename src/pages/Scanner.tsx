import React, { useState } from 'react';
import { CameraIcon, CheckCircleIcon, XIcon, CheckIcon, QrCodeIcon } from 'lucide-react';
import { useData } from '../context/DataContext';
import { showToast } from '../components/ui/Toaster';
type ReceiptItem = {
  id: string;
  name: string;
  quantity: number;
  unit: 'un' | 'g' | 'kg';
  price: number;
  storeId: string;
};
const Scanner: React.FC = () => {
  const {
    lists,
    stores,
    addList,
    updateList
  } = useData();
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scannedItems, setScannedItems] = useState<ReceiptItem[]>([]);
  const [selectedStore, setSelectedStore] = useState(stores[0]?.id || '');
  const [isAddingToList, setIsAddingToList] = useState(false);
  const [selectedListId, setSelectedListId] = useState<string>('');
  const [newListName, setNewListName] = useState('');
  const [isCreatingList, setIsCreatingList] = useState(false);
  const startScanning = () => {
    setIsScanning(true);
    // Simulate scanning process
    setTimeout(() => {
      setIsScanning(false);
      setIsProcessing(true);
      // Simulate processing
      setTimeout(() => {
        setIsProcessing(false);
        // Generate mock receipt data
        const mockItems: ReceiptItem[] = [{
          id: 'r1',
          name: 'Arroz Branco 5kg',
          quantity: 1,
          unit: 'un',
          price: 22.9,
          storeId: stores[0]?.id || ''
        }, {
          id: 'r2',
          name: 'Feijão Carioca 1kg',
          quantity: 2,
          unit: 'un',
          price: 8.75,
          storeId: stores[0]?.id || ''
        }, {
          id: 'r3',
          name: 'Açúcar Refinado 1kg',
          quantity: 1,
          unit: 'un',
          price: 4.99,
          storeId: stores[0]?.id || ''
        }, {
          id: 'r4',
          name: 'Café em Pó 500g',
          quantity: 1,
          unit: 'un',
          price: 12.5,
          storeId: stores[0]?.id || ''
        }];
        setScannedItems(mockItems);
        setSelectedStore(stores[0]?.id || '');
      }, 1500);
    }, 2000);
  };
  const handleAddToList = () => {
    setIsAddingToList(true);
  };
  const addToExistingList = (listId: string) => {
    const list = lists.find(l => l.id === listId);
    if (!list) return;
    // Add scanned items to the list
    const updatedItems = [...list.items, ...scannedItems.map(item => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      price: item.price,
      purchased: false,
      storeId: selectedStore
    }))];
    updateList({
      ...list,
      items: updatedItems
    });
    setIsAddingToList(false);
    setScannedItems([]);
    showToast(`Nota adicionada com sucesso à lista ${list.name}`, 'success');
  };
  const handleCreateNewList = () => {
    if (!newListName.trim()) return;
    // Create new list
    const newList = addList(newListName.trim());
    // Add scanned items to the new list
    const updatedItems = scannedItems.map(item => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      price: item.price,
      purchased: false,
      storeId: selectedStore
    }));
    updateList({
      ...newList,
      items: updatedItems
    });
    setIsAddingToList(false);
    setIsCreatingList(false);
    setNewListName('');
    setScannedItems([]);
    showToast(`Nota adicionada com sucesso à lista ${newListName}`, 'success');
  };
  const totalPrice = scannedItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  return <div>
      <header className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Scanner</h1>
          <div className="w-8 h-8 flex-shrink-0">
            <img src="/LOGO_REDUZIDA.png" alt="Comparify" className="w-full h-full object-contain" />
          </div>
        </div>
      </header>
      {!scannedItems.length && !isScanning && !isProcessing ? <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <QrCodeIcon className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-lg font-medium mb-2">Escanear QR Code</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Posicione o QR Code da nota fiscal no centro da câmera para escanear
          </p>
          <button onClick={startScanning} className="w-full bg-yellow-500 text-black font-medium py-3 rounded-lg flex items-center justify-center">
            Iniciar Scanner
          </button>
        </div> : <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {isScanning && <div className="p-6 text-center">
              <div className="w-full aspect-square bg-gray-900 relative mb-4 rounded-lg flex items-center justify-center">
                <div className="absolute inset-0 border-2 border-yellow-500 animate-pulse rounded-lg"></div>
                <p className="text-white">Aponte para o QR Code</p>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Mantenha o QR Code dentro da área de leitura
              </p>
            </div>}
          {isProcessing && <div className="p-6 text-center">
              <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">
                Processando nota fiscal...
              </p>
            </div>}
          {!isScanning && !isProcessing && scannedItems.length > 0 && <>
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-medium">Nota fiscal escaneada</h3>
                <div className="mt-2">
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Supermercado
                  </label>
                  <select value={selectedStore} onChange={e => setSelectedStore(e.target.value)} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900">
                    {stores.map(store => <option key={store.id} value={store.id}>
                        {store.name}
                      </option>)}
                  </select>
                </div>
              </div>
              <div className="max-h-80 overflow-auto">
                {scannedItems.map(item => <div key={item.id} className="p-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                    <div className="flex justify-between">
                      <div>
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {item.quantity} {item.unit} x R${' '}
                          {(item.price / item.quantity).toFixed(2)}
                        </p>
                      </div>
                      <div className="font-medium">
                        R$ {(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  </div>)}
              </div>
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-medium">Total</span>
                  <span className="font-bold">R$ {totalPrice.toFixed(2)}</span>
                </div>
                <button onClick={handleAddToList} className="w-full bg-yellow-500 text-black font-medium py-3 rounded-lg flex items-center justify-center">
                  <CheckCircleIcon className="w-5 h-5 mr-2" />
                  Adicionar à lista
                </button>
              </div>
            </>}
        </div>}
      {/* Select List Modal */}
      {isAddingToList && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Adicionar à lista</h2>
              <button onClick={() => setIsAddingToList(false)}>
                <XIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            {!isCreatingList ? <>
                <div className="space-y-3 mb-4">
                  {lists.length > 0 ? lists.map(list => <button key={list.id} onClick={() => addToExistingList(list.id)} className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <span>{list.name}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {list.items.length} itens
                        </span>
                      </button>) : <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                      Você ainda não tem listas
                    </p>}
                </div>
                <button onClick={() => setIsCreatingList(true)} className="w-full p-3 border border-yellow-500 text-yellow-500 rounded-lg">
                  Criar nova lista
                </button>
              </> : <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nome da lista
                  </label>
                  <input type="text" value={newListName} onChange={e => setNewListName(e.target.value)} placeholder="Ex: Compras do mês" className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900" autoFocus />
                </div>
                <div className="flex justify-end">
                  <button onClick={() => setIsCreatingList(false)} className="text-gray-600 dark:text-gray-400 mr-4">
                    Voltar
                  </button>
                  <button onClick={handleCreateNewList} className="bg-yellow-500 text-black font-medium px-4 py-2 rounded-lg" disabled={!newListName.trim()}>
                    Criar e adicionar
                  </button>
                </div>
              </>}
          </div>
        </div>}
    </div>;
};
export default Scanner;