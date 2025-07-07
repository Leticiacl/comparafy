import React, { useState, useMemo } from 'react';
import {
  SearchIcon,
  XIcon
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';

const Compare: React.FC = () => {
  const { darkMode } = useTheme();
  const { products, stores, priceRecords } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  const filteredProducts = useMemo(() => {
    return products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  const productPrices = useMemo(() => {
    if (!selectedProduct) return [];
    return stores
      .map(store => {
        const priceRecord = priceRecords.find(
          record => record.productId === selectedProduct && record.storeId === store.id
        );
        return {
          storeId: store.id,
          storeName: store.name,
          price: priceRecord?.price || 0
        };
      })
      .filter(record => record.price > 0)
      .sort((a, b) => a.price - b.price);
  }, [selectedProduct, priceRecords, stores]);

  const handleProductSelect = (productId: string) => {
    setSelectedProduct(productId);
    setIsSearchModalOpen(false);
  };

  return (
    <div>
      <header className="mb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-600 dark:text-gray-300">Comparar</h1>
          <div className="w-8 h-8">
            <img src="/LOGO_REDUZIDA.png" alt="Comparify" className="w-full h-full object-contain" />
          </div>
        </div>
      </header>

      <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden mb-6">
        <div className="p-4">
          <button
            onClick={() => setIsSearchModalOpen(true)}
            className="w-full flex items-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-400 text-sm mb-6"
          >
            <SearchIcon className="w-5 h-5 mr-2" />
            Buscar produto
          </button>

          {selectedProduct ? (
            <>
              <h3 className="font-medium mb-4">
                {products.find(p => p.id === selectedProduct)?.name}
              </h3>

              {productPrices.length > 0 ? (
                <div className="space-y-3">
                  {productPrices.map((item, index) => (
                    <div
                      key={item.storeId}
                      className={`p-4 rounded-lg border ${
                        index === 0
                          ? 'border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-900/20'
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span>{item.storeName}</span>
                        <span
                          className={`font-bold ${index === 0 ? 'text-green-600 dark:text-green-400' : ''}`}
                        >
                          R$ {item.price.toFixed(2)}
                        </span>
                      </div>
                      {index === 0 && index < productPrices.length - 1 && (
                        <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                          Economia de R$ {(productPrices[1].price - item.price).toFixed(2)} em relação ao segundo mais barato
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 mt-4">Nenhum preço registrado para este produto ainda.</p>
              )}
            </>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-400 mb-2 text-sm">Busque um produto para comparar preços</p>
              <button
                onClick={() => setIsSearchModalOpen(true)}
                className="text-yellow-600 text-sm font-medium underline"
              >
                Buscar produto
              </button>
            </div>
          )}
        </div>
      </div>

      {isSearchModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex flex-col z-50">
          <div className="bg-white dark:bg-gray-800 p-4 shadow-md">
            <div className="flex items-center mb-4">
              <button onClick={() => setIsSearchModalOpen(false)} className="mr-3">
                <XIcon className="w-6 h-6 text-gray-500" />
              </button>
              <div className="relative flex-grow">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Buscar produto"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  autoFocus
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900"
                />
              </div>
            </div>
          </div>

          <div className="flex-grow overflow-auto bg-gray-50 dark:bg-gray-900">
            {filteredProducts.length > 0 ? (
              <div className="divide-y divide-gray-200 dark:divide-gray-800">
                {filteredProducts.map(product => (
                  <button
                    key={product.id}
                    onClick={() => handleProductSelect(product.id)}
                    className="w-full text-left p-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{product.category}</div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                Nenhum produto encontrado
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Compare;