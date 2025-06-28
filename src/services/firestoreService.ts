// src/services/firestoreService.ts
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "./firebase";  // Certifique-se de que o db está correto

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

// Função para adicionar uma economia ao Firestore
export const addSavingsToFirestore = async (savings) => {
  try {
    const docRef = await addDoc(collection(db, "savings"), savings);
    console.log('Economia adicionada com ID:', docRef.id);
  } catch (error) {
    console.error('Erro ao adicionar economia:', error);
  }
};

// Função para obter economias do Firestore
export const getSavingsFromFirestore = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "savings"));
    return querySnapshot.docs.map((doc) => doc.data());
  } catch (error) {
    console.error('Erro ao buscar economias:', error);
    return [];
  }
};
