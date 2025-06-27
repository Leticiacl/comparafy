// src/services/firestoreService.ts
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "./firebase";

// Função para criar uma lista no Firestore
export const createList = async (userId: string, name: string) => {
  await addDoc(collection(db, "listas"), {
    userId,
    name,
    createdAt: new Date()
  });
};

// Função para buscar as listas de um usuário no Firestore
export const fetchLists = async (userId: string) => {
  const q = query(collection(db, "listas"), where("userId", "==", userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};
