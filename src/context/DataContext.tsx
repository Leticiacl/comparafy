// src/context/DataContext.tsx
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import {
  addSavingsToFirestore,
  getSavingsFromFirestore,
  fetchLists,
  fetchProducts,
  fetchStores,
  fetchPriceRecords
} from '../services/firestoreService';
import { auth } from '../services/firebase';

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

type User = {
  id: string;
  name: string;
  email: string;
};

type DataState = {
  lists: ShoppingList[];
  stores: Store[];
  priceRecords: PriceRecord[];
  products: Product[];
  user: User;
  savings: Savings[];
};

type DataContextType = {
  data: DataState;
  setData: React.Dispatch<React.SetStateAction<DataState>>;
  addSavings: (month: string, amount: number) => void;
  reloadLists: () => void;
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useState<DataState>({
    lists: [],
    stores: [],
    priceRecords: [],
    products: [],
    user: { id: '', name: '', email: '' },
    savings: []
  });

  const loadData = async () => {
    try {
      const user = auth.currentUser;
      if (!user || !user.uid) return;

      const [lists, savings, products, stores, priceRecords] = await Promise.all([
        fetchLists(user.uid),
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
        priceRecords,
        user: {
          id: user.uid,
          name: user.displayName || 'Usuário',
          email: user.email || 'visitante@exemplo.com'
        }
      }));
    } catch (error) {
      console.error('Erro ao buscar dados do Firestore:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(() => {
      loadData(); // reexecuta ao detectar login
    });

    return () => unsubscribe(); // cleanup
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
    <DataContext.Provider value={{ data, setData, addSavings, reloadLists: loadData }}>
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
