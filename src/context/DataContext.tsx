// src/context/DataContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
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
} from "../services/firestoreService";

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
  addItem: (
    listId: string,
    item: Omit<Item, "id" | "comprado">
  ) => Promise<void>;
  updateItem: (
    listId: string,
    itemId: string,
    data: Omit<Item, "id" | "comprado">
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

const DataContext = createContext<DataContextType | undefined>(
  undefined
);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [lists, setLists] = useState<Lista[]>([]);
  const userId = sessionStorage.getItem("userId");

  // Load all lists on mount
  const fetchUserData = async () => {
    if (!userId) return;
    const data = await fetchUserLists(userId);
    setLists(data);
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  // Create a new list
  const createList = async (nome: string) => {
    if (!userId) return null;
    const newList = await createNewList(userId, nome);
    setLists((prev) => [...prev, newList]);
    return newList;
  };

  // Load items of a specific list
  const fetchItems = async (listId: string) => {
    if (!userId) return;
    const itens = await fetchItemsFromList(userId, listId);
    setLists((prev) =>
      prev.map((l) => (l.id === listId ? { ...l, itens } : l))
    );
  };

  // Add item
  const addItem = async (
    listId: string,
    item: Omit<Item, "id" | "comprado">
  ) => {
    if (!userId) return;
    const newItem = await addItemToList(userId, listId, item);
    setLists((prev) =>
      prev.map((l) =>
        l.id === listId
          ? { ...l, itens: [...l.itens, newItem] }
          : l
      )
    );
  };

  // Update item
  const updateItem = async (
    listId: string,
    itemId: string,
    data: Omit<Item, "id" | "comprado">
  ) => {
    if (!userId) return;
    await updateItemInFirestore(userId, listId, itemId, data);
    setLists((prev) =>
      prev.map((l) =>
        l.id === listId
          ? {
              ...l,
              itens: l.itens.map((i) =>
                i.id === itemId ? { ...i, ...data } : i
              ),
            }
          : l
      )
    );
  };

  // Toggle purchased state
  const toggleItem = async (listId: string, itemId: string) => {
    if (!userId) return;
    const updated = await toggleItemPurchased(
      userId,
      listId,
      itemId
    );
    setLists((prev) =>
      prev.map((l) =>
        l.id === listId
          ? {
              ...l,
              itens: l.itens.map((i) =>
                i.id === itemId
                  ? { ...i, comprado: updated.comprado }
                  : i
              ),
            }
          : l
      )
    );
  };

  // Delete item
  const deleteItem = async (listId: string, itemId: string) => {
    if (!userId) return;
    await deleteItemFromFirestore(userId, listId, itemId);
    setLists((prev) =>
      prev.map((l) =>
        l.id === listId
          ? { ...l, itens: l.itens.filter((i) => i.id !== itemId) }
          : l
      )
    );
  };

  // Rename list
  const updateListNameInContext = (
    listId: string,
    novoNome: string
  ) => {
    if (!userId) return;
    updateListName(userId, listId, novoNome);
    setLists((prev) =>
      prev.map((l) =>
        l.id === listId ? { ...l, nome: novoNome } : l
      )
    );
  };

  // Delete list
  const deleteList = async (listId: string) => {
    if (!userId) return;
    await deleteListFromFirestore(userId, listId);
    setLists((prev) => prev.filter((l) => l.id !== listId));
  };

  // Duplicate list
  const duplicateListInContext = async (listId: string) => {
    if (!userId) return;
    await duplicateList(userId, listId);
    await fetchUserData();
  };

  // Mark all as purchased
  const markAllInList = async (listId: string) => {
    if (!userId) return;
    await markAllItemsPurchased(userId, listId);
    const itens = await fetchItemsFromList(userId, listId);
    setLists((prev) =>
      prev.map((l) => (l.id === listId ? { ...l, itens } : l))
    );
  };

  // Suggestions
  const saveSuggestions = async (field: string, value: string) => {
    if (!userId) return;
    await saveSuggestion(userId, field, value);
  };
  const getSuggestions = async (field: string) => {
    if (!userId) return [];
    return await getSuggestionsForField(userId, field);
  };

  // Total savings (sum of purchased item prices)
  const savings = lists.reduce((sum, l) => {
    return (
      sum +
      l.itens.reduce(
        (acc, i) => (i.comprado ? acc + i.preco : acc),
        0
      )
    );
  }, 0);

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
  if (!ctx)
    throw new Error("useData must be used within DataProvider");
  return ctx;
};
