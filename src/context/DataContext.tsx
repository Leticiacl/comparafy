// src/context/DataContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createNewList,
  fetchUserLists,
  updateListName,
  fetchItemsFromList,
  addItemToList,
  toggleItemPurchased,
  deleteItem,
  saveProductSuggestion,
  saveMarketSuggestion,
  fetchSuggestions,
} from '../services/firestoreService';

export const DataContext = createContext<any>(null);

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const [lists, setLists] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  const fetchUserData = async () => {
    const stored = sessionStorage.getItem('user');
    const user = stored ? JSON.parse(stored) : null;
    if (user?.uid) {
      setUserId(user.uid);
      const userLists = await fetchUserLists(user.uid);
      setLists(userLists);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const createList = async (name: string) => {
    if (!userId) return;
    const newList = await createNewList(userId, name);
    setLists((prev) => [...prev, newList]);
    return newList;
  };

  const updateListNameInContext = async (listId: string, newName: string) => {
    if (!userId) return;
    await updateListName(userId, listId, newName);
    setLists((prev) =>
      prev.map((list) => (list.id === listId ? { ...list, name: newName } : list))
    );
  };

  const fetchItems = async (listId: string) => {
    if (!userId) return [];
    return await fetchItemsFromList(userId, listId);
  };

  const addItem = async (listId: string, item: any) => {
    if (!userId) throw new Error('Usuário não identificado');
    await addItemToList(userId, listId, item);
    await fetchUserData(); // para atualizar economia total
  };

  const toggleItem = async (listId: string, itemId: string) => {
    if (!userId) return;
    await toggleItemPurchased(userId, listId, itemId);
    await fetchUserData();
  };

  const deleteItemFromList = async (listId: string, itemId: string) => {
    if (!userId) return;
    await deleteItem(userId, listId, itemId);
    await fetchUserData();
  };

  const saveSuggestions = async (product: string, market: string) => {
    if (!userId) return;
    await saveProductSuggestion(userId, product);
    await saveMarketSuggestion(userId, market);
  };

  const getSuggestions = async () => {
    if (!userId) return { products: [], markets: [] };
    return await fetchSuggestions(userId);
  };

  const value = {
    lists,
    userLists: lists,
    fetchUserData,
    createList,
    fetchItems,
    addItem,
    toggleItem,
    deleteItem: deleteItemFromList,
    updateListNameInContext,
    saveSuggestions,
    getSuggestions,
    savings: lists.map((list) =>
      list.items?.reduce((acc: number, item: any) => {
        return item.purchased ? acc + Number(item.price || 0) : acc;
      }, 0) || 0
    ),
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => useContext(DataContext);
