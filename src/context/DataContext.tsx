// src/context/DataContext.tsx
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { addSavingsToFirestore, getSavingsFromFirestore, getListsFromFirestore } from '../services/firebase'; // Importando as funções do Firebase

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
    stores: any[];  // Coloque o tipo correto para stores se souber
    priceRecords: any[];  // Coloque o tipo correto para priceRecords se souber
    products: any[];  // Coloque o tipo correto para products se souber
    user: { name: string; email: string };
    savings: Savings[];
  };
  addSavings: (month: string, amount: number) => void;
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Buscar listas
        const lists = await getListsFromFirestore(); // Obter listas
        const savings = await getSavingsFromFirestore(); // Obter economias
        setData(prev => ({
          ...prev,
          lists: lists,
          savings: savings
        }));
      } catch (error) {
        console.error('Erro ao buscar dados do Firestore:', error);
      }
    };

    fetchData();
  }, []);

  // Função para adicionar economia no Firestore e no estado local
  const addSavings = async (month: string, amount: number) => {
    const newSavings = { month, amount };

    // Salvar economia no Firestore
    await addSavingsToFirestore(newSavings);

    // Atualiza o estado local
    setData(prev => ({
      ...prev,
      savings: [...prev.savings, newSavings]
    }));
  };

  return (
    <DataContext.Provider value={{ data, addSavings }}>
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

  // Apenas logar no modo de desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    console.log(context);  // Verifique se o contexto está correto
  }

  return context;
};
