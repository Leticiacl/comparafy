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
  fetchLists,
  fetchProducts,
  fetchStores,
  fetchPriceRecords
} from '../services/firestoreService';
import { auth } from '../services/firebase';

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
  addSavings: (month: string, amount: number) => Promise<void>;
  reloadLists: () => Promise<void>;
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
    const user = auth.currentUser;
    if (!user || !user.uid) {
      console.warn('Usuário não autenticado');
      return;
    }

    try {
      const [lists, savings, products, stores, priceRecords] = await Promise.all([
        fetchLists(user.uid),
        getSavingsFromFirestore(),
        fetchProducts(),
        fetchStores(),
        fetchPriceRecords()
      ]);

      setData({
        lists,
        savings,
        products,
        stores,
        priceRecords,
        user: {
          id: user.uid,
          name: user.displayName || 'Visitante',
          email: user.email || 'visitante@exemplo.com'
        }
      });
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(() => {
      loadData();
    });

    return () => unsubscribe();
  }, []);

  const addSavings = async (month: string, amount: number) => {
    try {
      const newSavings = { month, amount };
      await addSavingsToFirestore(newSavings);
      setData(prev => ({
        ...prev,
        savings: [...prev.savings, newSavings]
      }));
    } catch (error) {
      console.error('Erro ao adicionar economia:', error);
    }
  };

  return (
    <DataContext.Provider value={{ data, setData, addSavings, reloadLists: loadData }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
