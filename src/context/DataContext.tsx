// DataContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { getLists, getListItems, getSavings, createList } from '../services/firestoreService';
import { auth } from '../services/firebase';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [data, setData] = useState({
    user: null,
    lists: [],
    items: {},
    savings: [],
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        const userData = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
        };

        setUser(userData);

        // Carrega dados do Firestore
        const lists = await getLists(userData.id);
        const savings = await getSavings(userData.id);

        const items = {};
        for (const list of lists) {
          items[list.id] = await getListItems(userData.id, list.id);
        }

        setData({
          user: userData,
          lists,
          items,
          savings,
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const reloadLists = async () => {
    if (!user?.id) return;
    const lists = await getLists(user.id);
    const items = {};
    for (const list of lists) {
      items[list.id] = await getListItems(user.id, list.id);
    }

    setData((prev) => ({
      ...prev,
      lists,
      items,
    }));
  };

  return (
    <DataContext.Provider value={{ data, reloadLists }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
