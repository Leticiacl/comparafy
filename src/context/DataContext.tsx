import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  getLists,
  getListItems,
  getSavings,
  createList,
  updateListName,
} from '../services/firestoreService';
import { auth } from '../services/firebase';
import { useNavigate } from 'react-router-dom';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const userId = auth.currentUser?.uid;
  const navigate = useNavigate();

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

  const addNewList = async () => {
    if (!userId) return;

    const name = prompt('Digite o nome da nova lista:');
    if (!name) return;

    const newList = await createList(userId, name);
    setData((prev) => ({
      ...prev,
      lists: [...prev.lists, newList],
      items: { ...prev.items, [newList.id]: [] },
    }));

    navigate(`/list/${newList.id}`);
  };

  const updateListNameInContext = async (listId, newName) => {
    if (!userId) return;
    await updateListName(userId, listId, newName);

    setData((prev) => ({
      ...prev,
      lists: prev.lists.map((list) =>
        list.id === listId ? { ...list, name: newName } : list
      ),
    }));
  };

  return (
    <DataContext.Provider value={{ data, addNewList, updateListNameInContext }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
