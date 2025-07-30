import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  fetchUserLists,
  createNewList,
  fetchItemsFromList,
  addItemToList,
  toggleItemPurchased,
  deleteItem as deleteItemFromFirestore,
  updateItem as updateItemInFirestore,
  updateListName,
  deleteListFromFirestore,
  duplicateList,
  markAllItemsPurchased,
  saveSuggestion,
  getSuggestionsForField,
} from '../services/firestoreService';

export interface Item {
  id: string;
  nome: string;
  quantidade: number;
  unidade: string;
  preco: number;
  mercado: string;
  observacoes?: string;
  comprado: boolean;
}

export interface Lista {
  id: string;
  nome: string;
  itens: Item[];
  createdAt?: any;
}

interface DataContextType {
  lists: Lista[];
  fetchUserData: () => Promise<void>;
  createList: (nome: string) => Promise<Lista | null>;
  fetchItems: (listId: string) => Promise<void>;
  addItem: (listId: string, item: Omit<Item, 'id' | 'comprado'>) => Promise<void>;
  updateItem: (
    listId: string,
    itemId: string,
    data: Omit<Item, 'id' | 'comprado'>
  ) => Promise<void>;
  toggleItem: (listId: string, itemId: string) => Promise<void>;
  deleteItem: (listId: string, itemId: string) => Promise<void>;
  updateListNameInContext: (listId: string, novoNome: string) => void;
  deleteList: (listId: string) => Promise<void>;
  duplicateListInContext: (listId: string) => Promise<void>;
  markAllInList: (listId: string) => Promise<void>;
  saveSuggestions: (field: string, value: string) => Promise<void>;
  getSuggestions: (field: string) => Promise<string[]>;
  savings: number;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lists, setLists] = useState<Lista[]>([]);
  const userId = sessionStorage.getItem('userId');

  // carrega listas iniciais
  const fetchUserData = async () => {
    if (!userId) return;
    const data = await fetchUserLists(userId);
    setLists(data);
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  // cria lista nova
  const createList = async (nome: string) => {
    if (!userId) return null;
    const newList = await createNewList(userId, nome);
    setLists(prev => [...prev, newList]);
    return newList;
  };

  // busca itens de uma lista
  const fetchItems = async (listId: string) => {
    if (!userId) return;
    const itens = await fetchItemsFromList(userId, listId);
    setLists(prev =>
      prev.map(l => (l.id === listId ? { ...l, itens } : l))
    );
  };

  // --- ações OTIMISTAS para não depender de round-trip ---
  const addItem = async (listId: string, item: Omit<Item, 'id' | 'comprado'>) => {
    if (!userId) return;
    const tempId = `temp-${Date.now()}`;
    const optimistic: Item = { id: tempId, comprado: false, ...item };
    setLists(prev =>
      prev.map(l =>
        l.id === listId ? { ...l, itens: [...l.itens, optimistic] } : l
      )
    );
    try {
      const saved = await addItemToList(userId, listId, item);
      setLists(prev =>
        prev.map(l =>
          l.id === listId
            ? {
                ...l,
                itens: l.itens.map(i =>
                  i.id === tempId ? saved : i
                ),
              }
            : l
        )
      );
    } catch (e) {
      console.warn('❌ addItem falhou no Firestore', e);
    }
  };

  const updateItem = async (
    listId: string,
    itemId: string,
    data: Omit<Item, 'id' | 'comprado'>
  ) => {
    // atualiza imediatamente
    setLists(prev =>
      prev.map(l =>
        l.id === listId
          ? {
              ...l,
              itens: l.itens.map(i =>
                i.id === itemId ? { ...i, ...data } : i
              ),
            }
          : l
      )
    );
    if (!userId) return;
    try {
      await updateItemInFirestore(userId, listId, itemId, data);
    } catch (e) {
      console.warn('❌ updateItem falhou no Firestore', e);
    }
  };

  const toggleItem = async (listId: string, itemId: string) => {
    console.log('🔔 toggleItem disparou', { listId, itemId });
    setLists(prev =>
      prev.map(l =>
        l.id === listId
          ? {
              ...l,
              itens: l.itens.map(i =>
                i.id === itemId ? { ...i, comprado: !i.comprado } : i
              ),
            }
          : l
      )
    );
    if (!userId) return;
    try {
      await toggleItemPurchased(userId, listId, itemId);
    } catch (e) {
      console.warn('❌ toggleItem falhou no Firestore', e);
    }
  };

  const deleteItem = async (listId: string, itemId: string) => {
    setLists(prev =>
      prev.map(l =>
        l.id === listId
          ? { ...l, itens: l.itens.filter(i => i.id !== itemId) }
          : l
      )
    );
    if (!userId) return;
    try {
      await deleteItemFromFirestore(userId, listId, itemId);
    } catch (e) {
      console.warn('❌ deleteItem falhou no Firestore', e);
    }
  };

  // renomeia lista
  const updateListNameInContext = (listId: string, novoNome: string) => {
    if (!userId) return;
    updateListName(userId, listId, novoNome);
    setLists(prev =>
      prev.map(l => (l.id === listId ? { ...l, nome: novoNome } : l))
    );
  };

  // deleta lista
  const deleteList = async (listId: string) => {
    setLists(prev => prev.filter(l => l.id !== listId));
    if (!userId) return;
    try {
      await deleteListFromFirestore(userId, listId);
    } catch (e) {
      console.warn('❌ deleteList falhou no Firestore', e);
    }
  };

  // duplicar lista
  const duplicateListInContext = async (listId: string) => {
    if (!userId) return;
    await duplicateList(userId, listId);
    await fetchUserData();
  };

  // marcar todos itens
  const markAllInList = async (listId: string) => {
    if (!userId) return;
    await markAllItemsPurchased(userId, listId);
    const itens = await fetchItemsFromList(userId, listId);
    setLists(prev =>
      prev.map(l => (l.id === listId ? { ...l, itens } : l))
    );
  };

  // sugestões
  const saveSuggestions = async (field: string, value: string) => {
    if (!userId) return;
    await saveSuggestion(userId, field, value);
  };
  const getSuggestions = async (field: string) => {
    if (!userId) return [];
    return getSuggestionsForField(userId, field);
  };

  const savings = lists.reduce((sum, l) =>
    sum + l.itens.reduce((acc, i) => (i.comprado ? acc + i.preco : acc), 0)
  , 0);

  return (
    <DataContext.Provider
      value={{
        lists,
        fetchUserData,
        createList,
        fetchItems,
        addItem,
        updateItem,
        toggleItem,
        deleteItem,
        updateListNameInContext,
        deleteList,
        duplicateListInContext,
        markAllInList,
        saveSuggestions,
        getSuggestions,
        savings,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData deve ser usado dentro do DataProvider');
  return ctx;
};
