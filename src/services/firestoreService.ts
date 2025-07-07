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

// =================== EXPORTS CORRETOS ===================

// Criação de lista
export const createList = async (userId: string, name: string) => {
  // ...
};

// Buscar listas por usuário
export const fetchLists = async (userId: string) => {
  // ...
};

// Adicionar economia
export const addSavingsToFirestore = async (savings: any) => {
  // ...
};

// Buscar economias
export const getSavingsFromFirestore = async () => {
  // ...
};

// Buscar detalhes de uma lista
export const fetchListDetails = async (listId: string) => {
  // ...
};

// Adicionar item
export const addItemToList = async (listId: string, newItem: any) => {
  // ...
};

// Atualizar item
export const updateItemInList = async (listId: string, updatedItem: any) => {
  // ...
};

// Deletar item
export const deleteItemFromList = async (listId: string, itemId: string) => {
  // ...
};

// Buscar produtos
export const fetchProducts = async () => {
  // ...
};

// Buscar lojas
export const fetchStores = async () => {
  // ...
};

// Buscar registros de preço
export const fetchPriceRecords = async () => {
  // ...
};
