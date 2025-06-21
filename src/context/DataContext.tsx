import React, { useEffect, useState, createContext, useContext } from 'react';
import { generateMockData } from '../data/mockData';
export type Item = {
  id: string;
  name: string;
  quantity: number;
  unit: 'un' | 'g' | 'kg';
  price: number;
  notes?: string;
  purchased: boolean;
  storeId: string;
};
export type ShoppingList = {
  id: string;
  name: string;
  createdAt: Date;
  items: Item[];
};
export type Store = {
  id: string;
  name: string;
  logo?: string;
};
export type PriceRecord = {
  productId: string;
  storeId: string;
  price: number;
  date: Date;
};
export type Product = {
  id: string;
  name: string;
  category: string;
};
export type User = {
  name: string;
  email: string;
  avatar?: string;
};
type DataContextType = {
  lists: ShoppingList[];
  stores: Store[];
  priceRecords: PriceRecord[];
  products: Product[];
  user: User;
  savings: {
    month: string;
    amount: number;
  }[];
  // Actions
  addList: (name: string) => ShoppingList;
  updateList: (list: ShoppingList) => void;
  deleteList: (id: string) => void;
  addItemToList: (listId: string, item: Omit<Item, 'id' | 'purchased'>) => void;
  updateItem: (listId: string, item: Item) => void;
  removeItem: (listId: string, itemId: string) => void;
  toggleItemPurchased: (listId: string, itemId: string) => void;
  updateUser: (userData: Partial<User>) => void;
};
const DataContext = createContext<DataContextType | undefined>(undefined);
export const DataProvider: React.FC<{
  children: React.ReactNode;
}> = ({
  children
}) => {
  const [data, setData] = useState(() => {
    const savedData = localStorage.getItem('comparifyData');
    return savedData ? JSON.parse(savedData) : generateMockData();
  });
  useEffect(() => {
    localStorage.setItem('comparifyData', JSON.stringify(data));
  }, [data]);
  const addList = (name: string) => {
    const newList: ShoppingList = {
      id: Date.now().toString(),
      name,
      createdAt: new Date(),
      items: []
    };
    setData((prev: any) => ({
      ...prev,
      lists: [...prev.lists, newList]
    }));
    return newList;
  };
  const updateList = (updatedList: ShoppingList) => {
    setData((prev: any) => ({
      ...prev,
      lists: prev.lists.map((list: ShoppingList) => list.id === updatedList.id ? updatedList : list)
    }));
  };
  const deleteList = (id: string) => {
    setData((prev: any) => ({
      ...prev,
      lists: prev.lists.filter((list: ShoppingList) => list.id !== id)
    }));
  };
  const addItemToList = (listId: string, itemData: Omit<Item, 'id' | 'purchased'>) => {
    const newItem: Item = {
      ...itemData,
      id: Date.now().toString(),
      purchased: false
    };
    setData((prev: any) => ({
      ...prev,
      lists: prev.lists.map((list: ShoppingList) => list.id === listId ? {
        ...list,
        items: [...list.items, newItem]
      } : list)
    }));
  };
  const updateItem = (listId: string, updatedItem: Item) => {
    setData((prev: any) => ({
      ...prev,
      lists: prev.lists.map((list: ShoppingList) => list.id === listId ? {
        ...list,
        items: list.items.map((item: Item) => item.id === updatedItem.id ? updatedItem : item)
      } : list)
    }));
  };
  const removeItem = (listId: string, itemId: string) => {
    setData((prev: any) => ({
      ...prev,
      lists: prev.lists.map((list: ShoppingList) => list.id === listId ? {
        ...list,
        items: list.items.filter((item: Item) => item.id !== itemId)
      } : list)
    }));
  };
  const toggleItemPurchased = (listId: string, itemId: string) => {
    setData((prev: any) => ({
      ...prev,
      lists: prev.lists.map((list: ShoppingList) => list.id === listId ? {
        ...list,
        items: list.items.map((item: Item) => item.id === itemId ? {
          ...item,
          purchased: !item.purchased
        } : item)
      } : list)
    }));
  };
  const updateUser = (userData: Partial<User>) => {
    setData((prev: any) => ({
      ...prev,
      user: {
        ...prev.user,
        ...userData
      }
    }));
  };
  return <DataContext.Provider value={{
    lists: data.lists,
    stores: data.stores,
    priceRecords: data.priceRecords,
    products: data.products,
    user: data.user,
    savings: data.savings,
    addList,
    updateList,
    deleteList,
    addItemToList,
    updateItem,
    removeItem,
    toggleItemPurchased,
    updateUser
  }}>
      {children}
    </DataContext.Provider>;
};
export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};