// src/services/firestoreService.ts
import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc
} from "firebase/firestore";

// LISTS
export const createNewList = async (userId: string, name: string) => {
  const newListRef = await addDoc(collection(db, "users", userId, "lists"), {
    name,
    createdAt: new Date(),
  });
  return { id: newListRef.id, name };
};

export const fetchUserLists = async (userId: string) => {
  const listsRef = collection(db, "users", userId, "lists");
  const querySnapshot = await getDocs(listsRef);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

export const updateListName = async (userId: string, listId: string, newName: string) => {
  const listRef = doc(db, "users", userId, "lists", listId);
  await updateDoc(listRef, { name: newName });
};

// ITEMS
export const createNewItem = async (userId: string, listId: string, itemData: any) => {
  const itemsRef = collection(db, "users", userId, "lists", listId, "items");
  const newItem = await addDoc(itemsRef, {
    ...itemData,
    createdAt: new Date(),
    purchased: false,
  });
  return newItem;
};

export const fetchItemsFromList = async (userId: string, listId: string) => {
  const itemsRef = collection(db, "users", userId, "lists", listId, "items");
  const snapshot = await getDocs(itemsRef);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

export const toggleItemPurchased = async (userId: string, listId: string, itemId: string, purchased: boolean) => {
  const itemRef = doc(db, "users", userId, "lists", listId, "items", itemId);
  await updateDoc(itemRef, { purchased });
};

export const deleteItem = async (userId: string, listId: string, itemId: string) => {
  const itemRef = doc(db, "users", userId, "lists", listId, "items", itemId);
  await deleteDoc(itemRef);
};
