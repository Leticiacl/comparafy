// src/services/firestoreService.ts
import { collection, addDoc, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

// 🔄 Obter listas do usuário
export const getLists = async (userId: string) => {
  const snapshot = await getDocs(collection(db, 'users', userId, 'lists'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// 🔄 Obter itens de uma lista
export const getListItems = async (userId: string, listId: string) => {
  const snapshot = await getDocs(collection(db, 'users', userId, 'lists', listId, 'items'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// 💰 Obter economias do usuário
export const getSavings = async (userId: string) => {
  const snapshot = await getDocs(collection(db, 'users', userId, 'savings'));
  return snapshot.docs.map(doc => doc.data());
};

// ➕ Criar nova lista
export const createList = async (userId: string, name: string) => {
  const docRef = await addDoc(collection(db, 'users', userId, 'lists'), {
    name,
    createdAt: new Date().toISOString(),
  });
  const docSnap = await getDoc(docRef);
  return { id: docRef.id, ...docSnap.data() };
};

// 📦 Obter dados de uma lista específica
export const fetchListDetails = async (userId: string, listId: string) => {
  const snapshot = await getDocs(collection(db, 'users', userId, 'lists', listId, 'items'));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
