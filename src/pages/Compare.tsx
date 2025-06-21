import React, { useState } from 'react';
import { SearchIcon, XIcon, ChevronDownIcon, BarChart4Icon, ShoppingCartIcon, StoreIcon, ArrowRightIcon, CheckIcon } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useTheme } from '../context/ThemeContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
const chartConfig = {
  grid: {
    stroke: '#E5E7EB',
    strokeDasharray: '5 5'
  },
  axis: {
    stroke: '#9CA3AF',
    strokeWidth: 1
  },
  tooltip: {
    light: {
      background: 'white',
      border: '#E5E7EB',
      text: '#111827'
    },
    dark: {
      background: '#1F2937',
      border: '#374151',
      text: '#F9FAFB'
    }
  }
};
const Compare: React.FC = () => {
  const {
    darkMode
  } = useTheme();
  const {
    products,
    stores,
    priceRecords,
    lists,
    savings
  } = useData();
  const [activeTab, setActiveTab] = useState<'prices' | 'lists' | 'stats'>('prices');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [selectedLists, setSelectedLists] = useState<string[]>([]);
  // Filter products based on search term
  const filteredProducts = products.filter(product => product.name.toLowerCase().includes(searchTerm.toLowerCase()));
  // Get price data for selected product
  const productPrices = selectedProduct ? stores.map(store => {
    const priceRecord = priceRecords.find(record => record.productId === selectedProduct && record.storeId === store.id);
    return {
      storeId: store.id,
      storeName: store.name,
      price: priceRecord?.price || 0
    };
  }).sort((a, b) => a.price - b.price) : [];
  // Get price evolution data for selected product
  const priceEvolutionData = [{
    month: 'Jan',
    price: 12.99
  }, {
    month: 'Fev',
    price: 13.5
  }, {
    month: 'Mar',
    price: 13.99
  }, {
    month: 'Abr',
    price: 12.75
  }, {
    month: 'Mai',
    price: 11.99
  }, {
    month: 'Jun',
    price: 12.25
  }];
  // Get most purchased items
  const mostPurchasedItems = [{
    name: 'Arroz Branco 5kg',
    count: 12
  }, {
    name: 'Feijão Carioca 1kg',
    count: 10
  }, {
    name: 'Leite Integral 1L',
    count: 8
  }, {
    name: 'Café em Pó 500g',
    count: 7
  }, {
    name: 'Papel Higiênico 12 rolos',
    count: 5
  }];
  // Get spending by store
  const spendingByStore = stores.map(store => ({
    name: store.name,
    value: Math.floor(Math.random() * 500) + 100
  }));
  // Compare two selected lists
  const compareListsData = () => {
    if (selectedLists.length !== 2) return null;
    const list1 = lists.find(list => list.id === selectedLists[0]);
    const list2 = lists.find(list => list.id === selectedLists[1]);
    if (!list1 || !list2) return null;
    // Find common items between lists
    const commonItems = list1.items.filter(item1 => list2.items.some(item2 => item2.name === item1.name));
    // Calculate price difference for each common item
    const comparisonData = commonItems.map(item1 => {
      const item2 = list2.items.find(item2 => item2.name === item1.name);
      if (!item2) return null;
      const price1 = item1.price * item1.quantity;
      const price2 = item2.price * item2.quantity;
      const difference = price1 - price2;
      return {
        name: item1.name,
        quantity1: `${item1.quantity} ${item1.unit}`,
        quantity2: `${item2.quantity} ${item2.unit}`,
        price1,
        price2,
        difference
      };
    }).filter(Boolean);
    // Calculate total difference
    const totalDifference = comparisonData.reduce((acc, item) => acc + (item?.difference || 0), 0);
    return {
      items: comparisonData,
      list1Name: list1.name,
      list2Name: list2.name,
      totalDifference
    };
  };
  const comparisonResult = compareListsData();
  const handleProductSelect = (productId: string) => {
    setSelectedProduct(productId);
    setIsSearchModalOpen(false);
  };
  const handleListToggle = (listId: string) => {
    setSelectedLists(prev => {
      if (prev.includes(listId)) {
        return prev.filter(id => id !== listId);
      } else if (prev.length < 2) {
        return [...prev, listId];
      } else {
        return [prev[1], listId]; // Remove the oldest selection
      }
    });
  };
  return <div>
      <header className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Comparar</h1>
          <div className="w-8 h-8 flex-shrink-0">
            <img src="/LOGO_REDUZIDA.png" alt="Comparify" className="w-full h-full object-contain" />
          </div>
        </div>
      </header>
      <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden mb-6">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button onClick={() => setActiveTab('prices')} className={`flex-1 py-3 text-center text-sm font-medium ${activeTab === 'prices' ? 'text-yellow-500 border-b-2 border-yellow-500' : 'text-gray-500 dark:text-gray-400'}`}>
            Preços
          </button>
          <button onClick={() => setActiveTab('lists')} className={`flex-1 py-3 text-center text-sm font-medium ${activeTab === 'lists' ? 'text-yellow-500 border-b-2 border-yellow-500' : 'text-gray-500 dark:text-gray-400'}`}>
            Listas
          </button>
          <button onClick={() => setActiveTab('stats')} className={`flex-1 py-3 text-center text-sm font-medium ${activeTab === 'stats' ? 'text-yellow-500 border-b-2 border-yellow-500' : 'text-gray-500 dark:text-gray-400'}`}>
            Estatísticas
          </button>
        </div>
        <div className="p-4">
          {activeTab === 'prices' && <div>
              <button onClick={() => setIsSearchModalOpen(true)} className="w-full flex items-center p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 mb-6">
                <SearchIcon className="w-5 h-5 mr-2" />
                <span>Buscar produto</span>
              </button>
              {selectedProduct ? <div>
                  <h3 className="font-medium mb-4">
                    {products.find(p => p.id === selectedProduct)?.name}
                  </h3>
                  <div className="space-y-3">
                    {productPrices.map((item, index) => <div key={item.storeId} className={`p-4 rounded-lg border ${index === 0 ? 'border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'}`}>
                        <div className="flex justify-between items-center">
                          <span>{item.storeName}</span>
                          <span className={`font-bold ${index === 0 ? 'text-green-600 dark:text-green-400' : ''}`}>
                            R$ {item.price.toFixed(2)}
                          </span>
                        </div>
                        {index === 0 && index < productPrices.length - 1 && <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                            Economia de R${' '}
                            {(productPrices[1].price - item.price).toFixed(2)}{' '}
                            em relação ao segundo mais barato
                          </div>}
                      </div>)}
                  </div>
                  <div className="mt-6">
                    <h3 className="font-medium mb-3">Evolução de preço</h3>
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={priceEvolutionData}>
                          <XAxis dataKey="month" stroke="#6B7280" axisLine={false} tickLine={false} />
                          <YAxis stroke="#6B7280" axisLine={false} tickLine={false} />
                          <Tooltip contentStyle={{
                      backgroundColor: '#1F2937',
                      borderColor: '#374151',
                      borderRadius: '0.375rem',
                      color: '#F9FAFB'
                    }} />
                          <Line type="monotone" dataKey="price" stroke="#FFD60A" strokeWidth={2} dot={{
                      fill: '#FFD60A',
                      r: 4
                    }} activeDot={{
                      fill: '#FFD60A',
                      r: 6
                    }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div> : <div className="text-center py-10">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Busque um produto para comparar preços
                  </p>
                  <button onClick={() => setIsSearchModalOpen(true)} className="text-yellow-500 font-medium">
                    Buscar produto
                  </button>
                </div>}
            </div>}
          {activeTab === 'lists' && <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Selecione duas listas para comparar
              </p>
              <div className="space-y-3 mb-6">
                {lists.map(list => <button key={list.id} onClick={() => handleListToggle(list.id)} className={`w-full flex items-center justify-between p-4 rounded-lg border ${selectedLists.includes(list.id) ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'}`}>
                    <span>{list.name}</span>
                    {selectedLists.includes(list.id) && <div className="w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center">
                        <CheckIcon className="w-4 h-4 text-black" />
                      </div>}
                  </button>)}
              </div>
              {comparisonResult && <div className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm font-medium">
                      {comparisonResult.list1Name}
                    </div>
                    <ArrowRightIcon className="w-5 h-5 text-gray-500" />
                    <div className="text-sm font-medium">
                      {comparisonResult.list2Name}
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="p-3 border-b border-gray-200 dark:border-gray-700 grid grid-cols-5 text-xs font-medium text-gray-500 dark:text-gray-400">
                      <div className="col-span-2">Produto</div>
                      <div className="text-right">
                        {comparisonResult.list1Name}
                      </div>
                      <div className="text-right">
                        {comparisonResult.list2Name}
                      </div>
                      <div className="text-right">Diferença</div>
                    </div>
                    {comparisonResult.items.map((item, index) => <div key={index} className="p-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0 grid grid-cols-5 items-center">
                        <div className="col-span-2">
                          <div className="font-medium">{item?.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 flex gap-2 mt-1">
                            <span>{item?.quantity1}</span>
                            <span>→</span>
                            <span>{item?.quantity2}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          R$ {item?.price1.toFixed(2)}
                        </div>
                        <div className="text-right">
                          R$ {item?.price2.toFixed(2)}
                        </div>
                        <div className={`text-right font-medium ${(item?.difference || 0) > 0 ? 'text-red-500' : (item?.difference || 0) < 0 ? 'text-green-500' : ''}`}>
                          {(item?.difference || 0) > 0 && '+'}
                          R$ {(item?.difference || 0).toFixed(2)}
                        </div>
                      </div>)}
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 grid grid-cols-5 items-center font-medium">
                      <div className="col-span-4 text-right">
                        Economia total:
                      </div>
                      <div className={`text-right ${comparisonResult.totalDifference > 0 ? 'text-red-500' : comparisonResult.totalDifference < 0 ? 'text-green-500' : ''}`}>
                        {comparisonResult.totalDifference > 0 && '+'}
                        R$ {comparisonResult.totalDifference.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>}
              {selectedLists.length < 2 && <div className="text-center py-6">
                  <p className="text-gray-500 dark:text-gray-400">
                    Selecione duas listas para ver a comparação
                  </p>
                </div>}
            </div>}
          {activeTab === 'stats' && <div>
              <div className="mb-6">
                <h3 className="font-medium mb-3 flex items-center">
                  <BarChart4Icon className="w-5 h-5 mr-2 text-yellow-500" />
                  Economia mensal
                </h3>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={savings} margin={{
                  top: 5,
                  right: 5,
                  bottom: 5,
                  left: 5
                }}>
                      <CartesianGrid strokeDasharray="5 5" stroke={chartConfig.grid.stroke} vertical={false} />
                      <XAxis dataKey="month" axisLine={chartConfig.axis} tickLine={false} dy={10} />
                      <YAxis axisLine={chartConfig.axis} tickLine={false} dx={-10} tickFormatter={value => `R$ ${value}`} />
                      <Tooltip contentStyle={{
                    backgroundColor: darkMode ? chartConfig.tooltip.dark.background : chartConfig.tooltip.light.background,
                    borderColor: darkMode ? chartConfig.tooltip.dark.border : chartConfig.tooltip.light.border,
                    borderRadius: '0.375rem',
                    color: darkMode ? chartConfig.tooltip.dark.text : chartConfig.tooltip.light.text
                  }} formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Economia']} labelStyle={{
                    color: darkMode ? chartConfig.tooltip.dark.text : chartConfig.tooltip.light.text
                  }} />
                      <Line type="monotone" dataKey="amount" stroke="#FFD60A" strokeWidth={2} dot={{
                    fill: '#FFD60A',
                    r: 4
                  }} activeDot={{
                    fill: '#FFD60A',
                    r: 6
                  }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="mb-6">
                <h3 className="font-medium mb-3 flex items-center">
                  <ShoppingCartIcon className="w-5 h-5 mr-2 text-yellow-500" />
                  Itens mais comprados
                </h3>
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                  {mostPurchasedItems.map((item, index) => <div key={index} className="flex justify-between p-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                      <span>{item.name}</span>
                      <span className="font-medium">{item.count}x</span>
                    </div>)}
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-3 flex items-center">
                  <StoreIcon className="w-5 h-5 mr-2 text-yellow-500" />
                  Gastos por supermercado
                </h3>
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={spendingByStore} margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5
                }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={chartConfig.grid.stroke} vertical={false} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tickFormatter={value => `R$ ${value}`} />
                      <Tooltip contentStyle={{
                    backgroundColor: darkMode ? chartConfig.tooltip.dark.background : chartConfig.tooltip.light.background,
                    borderColor: darkMode ? chartConfig.tooltip.dark.border : chartConfig.tooltip.light.border,
                    borderRadius: '0.375rem',
                    color: darkMode ? chartConfig.tooltip.dark.text : chartConfig.tooltip.light.text
                  }} formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Gastos']} labelStyle={{
                    color: darkMode ? chartConfig.tooltip.dark.text : chartConfig.tooltip.light.text
                  }} />
                      <Bar dataKey="value" fill="#FFD60A" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>}
        </div>
      </div>
      {/* Search Modal */}
      {isSearchModalOpen && <div className="fixed inset-0 bg-black/50 flex flex-col z-50">
          <div className="bg-white dark:bg-gray-800 p-4">
            <div className="flex items-center mb-4">
              <button onClick={() => setIsSearchModalOpen(false)} className="mr-3">
                <XIcon className="w-6 h-6 text-gray-500" />
              </button>
              <div className="relative flex-grow">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input type="text" placeholder="Buscar produto" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} autoFocus className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900" />
              </div>
            </div>
          </div>
          <div className="flex-grow overflow-auto bg-gray-50 dark:bg-gray-900">
            {filteredProducts.length > 0 ? <div className="divide-y divide-gray-200 dark:divide-gray-800">
                {filteredProducts.map(product => <button key={product.id} onClick={() => handleProductSelect(product.id)} className="w-full text-left p-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {product.category}
                    </div>
                  </button>)}
              </div> : <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                Nenhum produto encontrado
              </div>}
          </div>
        </div>}
    </div>;
};
export default Compare;