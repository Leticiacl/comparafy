import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import {
  addSavingsToFirestore,
  getSavingsFromFirestore,
  fetchLists,
  fetchProducts,
  fetchStores,
  fetchPriceRecords
} from '../services/firestoreService';

// Tipagens

type Item = {
  id: string;
  name: string;
  quantity: number;
  unit: 'un' | 'g' | 'kg';
  price: number;
  notes?: string;
  purchased: boolean;
  storeId: string;
};

type ShoppingList = {
  id: string;
  name: string;
  createdAt: Date;
  items: Item[];
};

type Savings = {
  month: string;
  amount: number;
};

type Product = {
  id: string;
  name: string;
  category: string;
};

type Store = {
  id: string;
  name: string;
};

type PriceRecord = {
  id: string;
  productId: string;
  storeId: string;
  price: number;
};

type DataContextType = {
  data: {
    lists: ShoppingList[];
    stores: Store[];
    priceRecords: PriceRecord[];
    products: Product[];
    user: { name: string; email: string };
    savings: Savings[];
  };
  addSavings: (month: string, amount: number) => void;
  reloadLists: () => void;
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useState({
    lists: [],
    stores: [],
    priceRecords: [],
    products: [],
    user: { name: '', email: '' },
    savings: []
  });

  const loadData = async () => {
    try {
      const userId = sessionStorage.getItem("userId");
      if (!userId) return;

      const [lists, savings, products, stores, priceRecords] = await Promise.all([
        fetchLists(userId),
        getSavingsFromFirestore(),
        fetchProducts(),
        fetchStores(),
        fetchPriceRecords()
      ]);

      setData(prev => ({
        ...prev,
        lists,
        savings,
        products,
        stores,
        priceRecords
      }));
    } catch (error) {
      console.error('Erro ao buscar dados do Firestore:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const addSavings = async (month: string, amount: number) => {
    const newSavings = { month, amount };
    await addSavingsToFirestore(newSavings);

    setData(prev => ({
      ...prev,
      savings: [...prev.savings, newSavings]
    }));
  };

  return (
    <DataContext.Provider value={{ data, addSavings, reloadLists: loadData }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    console.error('useData must be used within a DataProvider');
    throw new Error('useData must be used within a DataProvider');
  }

  return context;
};
