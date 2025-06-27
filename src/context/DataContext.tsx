// src/context/DataContext.tsx
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode
} from 'react';
import {
  addSavingsToFirestore,
  getSavingsFromFirestore,
  fetchLists
} from '../services/firestoreService';

// Tipos dos dados que estamos usando no contexto
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

type DataContextType = {
  data: {
    lists: ShoppingList[];
    stores: any[];
    priceRecords: any[];
    products: any[];
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

  // Carregar listas e savings do Firestore
  const loadData = async () => {
    try {
      const userId = sessionStorage.getItem('userId');
      if (!userId) return;

      const lists = await fetchLists(userId);
      const savings = await getSavingsFromFirestore();

      setData(prev => ({
        ...prev,
        lists,
        savings
      }));
    } catch (error) {
      console.error('Erro ao buscar dados do Firestore:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Adiciona uma nova economia
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

  if (!context) {
    console.error('useData must be used within a DataProvider');
    throw new Error('useData must be used within a DataProvider');
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('Contexto carregado:', context);
  }

  return context;
};
