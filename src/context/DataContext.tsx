import React, { createContext, useState, useContext, useEffect } from 'react';
import { addSavingsToFirestore, getSavingsFromFirestore } from '../services/firebase'; // Importando as funções do firebase

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
  const [data, setData] = useState({
    lists: [],
    stores: [],
    priceRecords: [],
    products: [],
    user: { name: '', email: '' },
    savings: []
  });

  // Buscando os dados ao carregar o app
  useEffect(() => {
    const fetchData = async () => {
      // Buscar listas
      const lists = await getListsFromFirestore();
      // Buscar economias
      const savings = await getSavingsFromFirestore();

      setData(prev => ({
        ...prev,
        lists: lists,
        savings: savings
      }));
    };

    fetchData();
  }, []);

  // Função para adicionar economia no Firestore e no estado local
  const addSavings = async (month, amount) => {
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

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
