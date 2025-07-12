// src/services/firestoreService.ts
import {
  collection,
  addDoc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  deleteDoc,
  doc,
  arrayUnion,
} from "firebase/firestore";
import { db } from "./firebase";
import { auth } from './firebase';

// ✅ Criação de lista
export const createList = async (_userId: string, name: string) => {
  const user = auth.currentUser;
  if (!user) throw new Error('Usuário não autenticado');

  const docRef = await addDoc(collection(db, "lists"), {
    userId: user.uid,
    name,
    items: [],
    createdAt: new Date()
  });

  const snapshot = await getDoc(docRef);
  return { id: snapshot.id, ...snapshot.data() };
};

// ✅ Buscar listas por usuário
export const fetchLists = async (userId: string) => {
  const q = query(collection(db, "lists"), where("userId", "==", userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// ✅ Buscar detalhes de uma lista (corrigido!)
export const fetchListDetails = async (listId: string) => {
  const listRef = doc(db, "lists", listId); // Corrigido aqui
  const snapshot = await getDoc(listRef);
  if (snapshot.exists()) {
    return { id: snapshot.id, ...snapshot.data() };
  }
  throw new Error("Lista não encontrada");
};

// ✅ Atualizar nome/metadados da lista
export const updateList = async (listId: string, data: Partial<{ name: string }>) => {
  const listRef = doc(db, "lists", listId);
  await updateDoc(listRef, data);
};

// ✅ Adicionar item
export const addItemToList = async (listId: string, newItem: any) => {
  const listRef = doc(db, "lists", listId);
  await updateDoc(listRef, {
    items: arrayUnion(newItem),
  });
};

// ✅ Adicionar economia
export const addSavingsToFirestore = async (savings: any) => {
  await addDoc(collection(db, "savings"), savings);
};

// ✅ Buscar economias
export const getSavingsFromFirestore = async () => {
  const snapshot = await getDocs(collection(db, "savings"));
  return snapshot.docs.map(doc => doc.data());
};

// ✅ Buscar produtos
export const fetchProducts = async () => {
  const snapshot = await getDocs(collection(db, "products"));
  return snapshot.docs.map(doc => doc.data());
};

// ✅ Buscar lojas
export const fetchStores = async () => {
  const snapshot = await getDocs(collection(db, "stores"));
  return snapshot.docs.map(doc => doc.data());
};

// ✅ Buscar registros de preço
export const fetchPriceRecords = async () => {
  const snapshot = await getDocs(collection(db, "prices"));
  return snapshot.docs.map(doc => doc.data());
};
