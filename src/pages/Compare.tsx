import React, { useState, useMemo } from 'react';
import {
  ArrowLeftIcon,
  StarIcon
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';

const Compare: React.FC = () => {
  const { lists } = useData();
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const navigate = useNavigate();

  const comparisons = useMemo(() => {
    if (!selectedProduct) return [];
    const results: any[] = [];
    lists.forEach(list => {
      list.items.forEach(item => {
        if (item.name.toLowerCase() === selectedProduct.toLowerCase()) {
          results.push({
            listName: list.name,
            price: item.price * item.quantity,
            item,
          });
        }
      });
    });
    return results.sort((a, b) => a.price - b.price);
  }, [lists, selectedProduct]);

  return (
    <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <header className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)}>
          <ArrowLeftIcon className="w-6 h-6 text-gray-700 dark:text-white" />
        </button>
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
          Comparar Produtos
        </h1>
      </header>

      <input
        type="text"
        placeholder="Digite o nome do produto"
        value={selectedProduct}
        onChange={e => setSelectedProduct(e.target.value)}
        className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-xl mb-6"
      />

      {comparisons.length > 0 && (
        <div className="grid gap-4">
          {comparisons.map((comp, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl shadow border relative transition-all ${
                idx === 0
                  ? 'bg-yellow-100 dark:bg-yellow-900 border-yellow-300 dark:border-yellow-700'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
              }`}
            >
              {idx === 0 && (
                <div className="absolute top-2 right-2">
                  <StarIcon className="w-5 h-5 text-yellow-500" />
                </div>
              )}
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{comp.listName}</p>
              <p className="text-base font-medium text-gray-800 dark:text-white">{comp.item.name}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {comp.item.quantity} {comp.item.unit} - R$ {comp.item.price.toFixed(2)} un.
              </p>
              <p className="text-lg font-bold text-yellow-700 dark:text-yellow-400 mt-1">
                Total: R$ {comp.price.toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Compare;