// src/services/firestoreService.ts
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from './firebase';

// CRIAÇÃO DE NOVA LISTA
export const createNewList = async (userId: string, name: string) => {
  const listRef = collection(db, 'users', userId, 'lists');
  const newList = {
    name,
    createdAt: new Date(),
    items: [],
  };
  const docRef = await addDoc(listRef, newList);
  return { id: docRef.id, ...newList };
};

// BUSCAR LISTAS DO FIRESTORE
export const fetchListsFromFirestore = async (userId: string) => {
  try {
    const listsRef = collection(db, 'users', userId, 'lists');
    const q = query(listsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Erro ao buscar listas:', error);
    return [];
  }
};

// BUSCAR ITENS DE UMA LISTA
export const fetchItemsFromList = async (userId: string, listId: string) => {
  const listRef = doc(db, 'users', userId, 'lists', listId);
  const listSnap = await getDoc(listRef);
  if (listSnap.exists()) {
    return listSnap.data().items || [];
  }
  return [];
};

// ADICIONAR ITEM A UMA LISTA
export const addItemToList = async (
  userId: string,
  listId: string,
  newItem: any
) => {
  const listRef = doc(db, 'users', userId, 'lists', listId);
  const listSnap = await getDoc(listRef);
  if (listSnap.exists()) {
    const data = listSnap.data();
    const updatedItems = [...(data.items || []), newItem];
    await updateDoc(listRef, { items: updatedItems });
    return updatedItems;
  }
  return [];
};

// ATUALIZAR NOME DE LISTA
export const updateListName = async (
  userId: string,
  listId: string,
  newName: string
) => {
  const listRef = doc(db, 'users', userId, 'lists', listId);
  await updateDoc(listRef, { name: newName });
};

// ATUALIZAR UM ITEM DENTRO DA LISTA
export const updateItemInList = async (
  userId: string,
  listId: string,
  itemIndex: number,
  updatedItem: any
) => {
  const listRef = doc(db, 'users', userId, 'lists', listId);
  const listSnap = await getDoc(listRef);
  if (listSnap.exists()) {
    const data = listSnap.data();
    const updatedItems = [...(data.items || [])];
    updatedItems[itemIndex] = updatedItem;
    await updateDoc(listRef, { items: updatedItems });
    return updatedItems;
  }
  return [];
};

// MARCAR ITEM COMO COMPRADO (TOGGLE)
export const toggleItemPurchased = async (
  userId: string,
  listId: string,
  itemIndex: number
) => {
  const listRef = doc(db, 'users', userId, 'lists', listId);
  const listSnap = await getDoc(listRef);
  if (listSnap.exists()) {
    const data = listSnap.data();
    const updatedItems = [...(data.items || [])];
    updatedItems[itemIndex].purchased = !updatedItems[itemIndex].purchased;
    await updateDoc(listRef, { items: updatedItems });
    return updatedItems;
  }
  return [];
};

// DELETAR UM ITEM DA LISTA
export const deleteItem = async (
  userId: string,
  listId: string,
  itemIndex: number
) => {
  const listRef = doc(db, 'users', userId, 'lists', listId);
  const listSnap = await getDoc(listRef);
  if (listSnap.exists()) {
    const data = listSnap.data();
    const updatedItems = [...(data.items || [])];
    updatedItems.splice(itemIndex, 1);
    await updateDoc(listRef, { items: updatedItems });
    return updatedItems;
  }
  return [];
};

// SUGESTÕES (Produtos / Mercados)

export const saveSuggestion = async (
  userId: string,
  type: 'products' | 'markets',
  value: string
) => {
  const suggestionRef = doc(db, 'users', userId, 'suggestions', type);
  const suggestionSnap = await getDoc(suggestionRef);

  let values = [];
  if (suggestionSnap.exists()) {
    values = suggestionSnap.data().values || [];
  }

  if (!values.includes(value)) {
    values.push(value);
    await setDoc(suggestionRef, { values });
  }
};

export const getSuggestions = async (
  userId: string,
  type: 'products' | 'markets'
) => {
  const suggestionRef = doc(db, 'users', userId, 'suggestions', type);
  const suggestionSnap = await getDoc(suggestionRef);
  if (suggestionSnap.exists()) {
    return suggestionSnap.data().values || [];
  }
  return [];
};
