import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  fetchUserLists,
  createNewList,
  addItemToList,
  fetchItemsFromList,
  toggleItemPurchased,
  deleteItem,
  saveSuggestion,
  updateListName,
} from '../services/firestoreService';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [lists, setLists] = useState([]);
  const [items, setItems] = useState([]);
  const [suggestions, setSuggestions] = useState({ products: [], markets: [] });

  const userId = JSON.parse(sessionStorage.getItem('user'))?.uid;

  useEffect(() => {
    if (userId) {
      fetchUserLists(userId).then(setLists);
    }
  }, [userId]);

  const addList = async (name) => {
    const newList = await createNewList(userId, name);
    setLists((prev) => [...prev, newList]);
    return newList;
  };

  const updateListNameInContext = async (listId, newName) => {
    await updateListName(userId, listId, newName);
    setLists((prev) =>
      prev.map((list) => (list.id === listId ? { ...list, name: newName } : list))
    );
  };

  const addItem = async (listId, item) => {
    await addItemToList(userId, listId, item);
    setItems((prev) => [...prev, item]);
    saveSuggestion(userId, item.name, item.market);
  };

  const loadItems = async (listId) => {
    const items = await fetchItemsFromList(userId, listId);
    setItems(items);
  };

  const toggleItem = async (listId, itemId, current) => {
    await toggleItemPurchased(userId, listId, itemId, current);
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, purchased: !item.purchased } : item
      )
    );
  };

  const removeItem = async (listId, itemId) => {
    await deleteItem(userId, listId, itemId);
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const value = {
    lists,
    items,
    suggestions,
    addList,
    updateListNameInContext,
    addItem,
    loadItems,
    toggleItem,
    removeItem,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => useContext(DataContext);
