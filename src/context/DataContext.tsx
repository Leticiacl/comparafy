// src/context/DataContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  createNewList,
  fetchUserLists,
  updateListName,
  createNewItem,
  fetchItemsFromList,
  toggleItemPurchased,
  deleteItem,
} from "../services/firestoreService";

interface List {
  id: string;
  name: string;
}

interface Item {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  price: number;
  market: string;
  notes?: string;
  purchased: boolean;
}

interface DataContextType {
  lists: List[];
  items: Item[];
  currentListId: string | null;
  setCurrentListId: (id: string | null) => void;
  addList: (name: string) => Promise<void>;
  renameList: (id: string, newName: string) => Promise<void>;
  loadItems: (listId: string) => Promise<void>;
  addItem: (listId: string, itemData: any) => Promise<void>;
  togglePurchased: (itemId: string, purchased: boolean) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  userId: string;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const [lists, setLists] = useState<List[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [currentListId, setCurrentListId] = useState<string | null>(null);

  const userId = sessionStorage.getItem("userUID") || "visitante";

  useEffect(() => {
    const loadLists = async () => {
      const result = await fetchUserLists(userId);
      setLists(result as List[]);
    };
    loadLists();
  }, [userId]);

  const addList = async (name: string) => {
    const newList = await createNewList(userId, name);
    setLists((prev) => [...prev, newList]);
  };

  const renameList = async (id: string, newName: string) => {
    await updateListName(userId, id, newName);
    setLists((prev) =>
      prev.map((list) => (list.id === id ? { ...list, name: newName } : list))
    );
  };

  const loadItems = async (listId: string) => {
    setCurrentListId(listId);
    const result = await fetchItemsFromList(userId, listId);
    setItems(result as Item[]);
  };

  const addItem = async (listId: string, itemData: any) => {
    await createNewItem(userId, listId, itemData);
    await loadItems(listId);
  };

  const togglePurchased = async (itemId: string, purchased: boolean) => {
    if (!currentListId) return;
    await toggleItemPurchased(userId, currentListId, itemId, purchased);
    await loadItems(currentListId);
  };

  const removeItem = async (itemId: string) => {
    if (!currentListId) return;
    await deleteItem(userId, currentListId, itemId);
    await loadItems(currentListId);
  };

  return (
    <DataContext.Provider
      value={{
        lists,
        items,
        currentListId,
        setCurrentListId,
        addList,
        renameList,
        loadItems,
        addItem,
        togglePurchased,
        removeItem,
        userId,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
