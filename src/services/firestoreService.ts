// src/services/firestoreService.ts

import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "./firebase";

// Cria uma nova lista para o usuário
export const createList = async (userId: string, listName: string = "Nova lista") => {
  try {
    const docRef = await addDoc(collection(db, "lists"), {
      name: listName,
      userId,
      items: [],
      createdAt: new Date().toISOString(),
    });
    return { id: docRef.id, name: listName, items: [] };
  } catch (error) {
    console.error("Erro ao criar lista:", error);
    return null;
  }
};

// Busca listas do Firestore para o usuário autenticado
export const fetchLists = async (userId: string) => {
  try {
    const q = query(collection(db, "lists"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    const lists = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return lists;
  } catch (error) {
    console.error("Erro ao buscar listas:", error);
    return [];
  }
};

// Atualiza o nome da lista
export const updateListName = async (userId: string, listId: string, newName: string) => {
  try {
    const listRef = doc(db, "lists", listId);
    await updateDoc(listRef, {
      name: newName,
    });
  } catch (error) {
    console.error("Erro ao atualizar nome da lista:", error);
  }
};
