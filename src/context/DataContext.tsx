import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  addItemToList,
  createNewList,
  fetchUserLists,
  fetchItemsFromList,
  toggleItemPurchased,
  deleteItem,
  updateListName,
  saveSuggestion,
  getSuggestionsForField,
  deleteListFromFirestore,
  duplicateList,
  markAllItemsPurchased,
} from '../services/firestoreService';

interface Item {
  id: string;
  nome: string;
  quantidade: number;
  unidade: string;
  preco: number;
  mercado: string;
  observacoes?: string;
  comprado: boolean;
}

interface Lista {
  id: string;
  nome: string;
  itens: Item[];
  createdAt?: any;
}

interface DataContextType {
  lists: Lista[];
  userLists: Lista[];
  fetchUserData: () => void;
  createList: (name: string) => Promise<Lista | null>;
  fetchItems: (listId: string) => Promise<void>;
  addItem: (listId: string, item: Item) => Promise<void>;
  toggleItem: (listId: string, itemId: string) => Promise<void>;
  deleteItem: (listId: string, itemId: string) => Promise<void>;
  updateListNameInContext: (listId: string, newName: string) => void;
  deleteList: (listId: string) => Promise<void>;
  duplicateListInContext: (listId: string) => Promise<void>;
  markAllInList: (listId: string) => Promise<void>;
  saveSuggestions: (field: string, value: string) => Promise<void>;
  getSuggestions: (field: string) => Promise<string[]>;
  savings: number[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lists, setLists] = useState<Lista[]>([]);
  const userId = sessionStorage.getItem('userId');

  const fetchUserData = async () => {
    if (!userId) return;
    const data = await fetchUserLists(userId);
    setLists(data);
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const createList = async (name: string): Promise<Lista | null> => {
    if (!userId) return null;
    const newList = await createNewList(userId, name);
    setLists((prev) => [...prev, newList]);
    return newList;
  };

  const fetchItems = async (listId: string) => {
    if (!userId) return;
    const items = await fetchItemsFromList(userId, listId);
    setLists((prevLists) =>
      prevLists.map((list) =>
        list.id === listId ? { ...list, itens: items } : list
      )
    );
  };

  const addItem = async (listId: string, item: Item) => {
    if (!userId) return;
    const newItem = await addItemToList(userId, listId, item);
    setLists((prevLists) =>
      prevLists.map((list) =>
        list.id === listId
          ? { ...list, itens: [...(list.itens || []), newItem] }
          : list
      )
    );
  };

  const toggleItem = async (listId: string, itemId: string) => {
    if (!userId) return;
    const updatedItem = await toggleItemPurchased(userId, listId, itemId);
    setLists((prevLists) =>
      prevLists.map((list) =>
        list.id === listId
          ? {
              ...list,
              itens: list.itens.map((item) =>
                item.id === itemId ? { ...item, comprado: updatedItem.comprado } : item
              ),
            }
          : list
      )
    );
  };

  const deleteItemFromList = async (listId: string, itemId: string) => {
    if (!userId) return;
    await deleteItem(userId, listId, itemId);
    setLists((prevLists) =>
      prevLists.map((list) =>
        list.id === listId
          ? {
              ...list,
              itens: list.itens.filter((item) => item.id !== itemId),
            }
          : list
      )
    );
  };

  const updateListNameInContext = (listId: string, newName: string) => {
    if (!userId) return;
    updateListName(userId, listId, newName);
    setLists((prevLists) =>
      prevLists.map((list) =>
        list.id === listId ? { ...list, nome: newName } : list
      )
    );
  };  

  const deleteList = async (listId: string) => {
    if (!userId) return;
    await deleteListFromFirestore(userId, listId);
    setLists((prev) => prev.filter((l) => l.id !== listId));
  };

  const duplicateListInContext = async (listId: string) => {
    if (!userId) return;
    const newId = await duplicateList(userId, listId);
    if (newId) {
      await fetchUserData(); // recarrega tudo incluindo duplicada
    }
  };

  const markAllInList = async (listId: string) => {
    if (!userId) return;
    await markAllItemsPurchased(userId, listId);
    await fetchItems(listId); // recarrega os itens atualizados
  };

  const saveSuggestions = async (field: string, value: string) => {
    if (!userId) return;
    await saveSuggestion(userId, field, value);
  };

  const getSuggestions = async (field: string) => {
    if (!userId) return [];
    return await getSuggestionsForField(userId, field);
  };

  const value: DataContextType = {
    lists,
    userLists: lists,
    fetchUserData,
    createList,
    fetchItems,
    addItem,
    toggleItem,
    deleteItem: deleteItemFromList,
    updateListNameInContext,
    deleteList,
    duplicateListInContext,
    markAllInList,
    saveSuggestions,
    getSuggestions,
    savings: lists.map((list) =>
      list.itens?.reduce((acc: number, item: any) => {
        return item.comprado ? acc + Number(item.preco || 0) : acc;
      }, 0) || 0
    ),
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
