// DataContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { getLists, getListItems, getSavings, createList } from '../services/firestoreService';
import { auth } from '../services/firebase';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const userId = auth.currentUser?.uid;

  const [data, setData] = useState({
    lists: [],
    items: {},
    savings: [],
  });

  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      const lists = await getLists(userId);
      const savings = await getSavings(userId);

      const items = {};
      for (const list of lists) {
        items[list.id] = await getListItems(userId, list.id);
      }

      setData({ lists, items, savings });
    };

    fetchData();
  }, [userId]);

  const addNewList = async (name) => {
    if (!userId) return;
    const newList = await createList(userId, name);
    setData((prev) => ({
      ...prev,
      lists: [...prev.lists, newList],
      items: { ...prev.items, [newList.id]: [] },
    }));
  };

  return (
    <DataContext.Provider value={{ data, addNewList }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);