// src/services/firestoreService.ts
import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  setDoc,
} from "firebase/firestore";
import { db } from "./firebase";

// Buscar todas as listas do usuário
export async function fetchUserLists(userId: string) {
  const listsRef = collection(db, "users", userId, "lists");
  const snapshot = await getDocs(listsRef);
  const lists = await Promise.all(
    snapshot.docs.map(async (docSnap) => {
      const items = await fetchItemsFromList(userId, docSnap.id);
      return {
        id: docSnap.id,
        name: docSnap.data().name || "Sem nome",
        createdAt: docSnap.data().createdAt || null,
        items,
      };
    })
  );
  return lists;
}

// Criar nova lista
export async function createNewList(userId: string, name: string) {
  const listsRef = collection(db, "users", userId, "lists");
  const newDoc = await addDoc(listsRef, {
    name,
    createdAt: new Date(),
  });
  return {
    id: newDoc.id,
    name,
    createdAt: new Date(),
    items: [],
  };
}

// Atualizar nome da lista
export async function updateListName(userId: string, listId: string, newName: string) {
  const listRef = doc(db, "users", userId, "lists", listId);
  await updateDoc(listRef, { name: newName });
}

// Buscar itens da lista
export async function fetchItemsFromList(userId: string, listId: string) {
  const itemsRef = collection(db, "users", userId, "lists", listId, "items");
  const snapshot = await getDocs(itemsRef);
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      purchased: data.purchased ?? false,
    };
  });
}

// Alternar item como comprado
export async function toggleItemPurchased(userId: string, listId: string, itemId: string) {
  const itemRef = doc(db, "users", userId, "lists", listId, "items", itemId);
  const itemSnap = await getDoc(itemRef);
  const current = itemSnap.exists() ? itemSnap.data().purchased : false;
  await updateDoc(itemRef, { purchased: !current });
  return { purchased: !current };
}

// Deletar item
export async function deleteItem(userId: string, listId: string, itemId: string) {
  const itemRef = doc(db, "users", userId, "lists", listId, "items", itemId);
  await deleteDoc(itemRef);
}

// Adicionar item
export async function addItemToList(userId: string, listId: string, item: any) {
  const itemsRef = collection(db, "users", userId, "lists", listId, "items");
  const docRef = await addDoc(itemsRef, {
    ...item,
    purchased: false,
  });

  return {
    id: docRef.id,
    ...item,
    purchased: false,
  };
}

// Sugestões – salvar
export async function saveSuggestion(userId: string, field: string, value: string) {
  const ref = doc(db, "users", userId, "suggestions", field);
  const snap = await getDoc(ref);
  const existing = snap.exists() ? snap.data().list || [] : [];

  if (!existing.includes(value)) {
    await setDoc(ref, { list: [...existing, value] });
  }
}

// Sugestões – buscar
export async function getSuggestionsForField(userId: string, field: string) {
  const ref = doc(db, "users", userId, "suggestions", field);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data().list || [] : [];
}

// Excluir lista e seus itens
export async function deleteListFromFirestore(userId: string, listId: string) {
  const itemsRef = collection(db, "users", userId, "lists", listId, "items");
  const snapshot = await getDocs(itemsRef);
  const deletePromises = snapshot.docs.map((doc) => deleteDoc(doc.ref));
  await Promise.all(deletePromises);

  const listRef = doc(db, "users", userId, "lists", listId);
  await deleteDoc(listRef);
}

// Duplicar lista
export async function duplicateList(userId: string, originalListId: string) {
  const originalRef = doc(db, "users", userId, "lists", originalListId);
  const originalSnap = await getDoc(originalRef);
  if (!originalSnap.exists()) return;

  const originalData = originalSnap.data();
  const newRef = await addDoc(collection(db, "users", userId, "lists"), {
    name: originalData.name + " (cópia)",
    createdAt: new Date(),
  });

  const items = await fetchItemsFromList(userId, originalListId);
  const itemsRef = collection(db, "users", userId, "lists", newRef.id, "items");

  for (const item of items) {
    const { id, ...rest } = item;
    await addDoc(itemsRef, rest);
  }

  return newRef.id;
}

// Marcar todos como comprados
export async function markAllItemsPurchased(userId: string, listId: string) {
  const itemsRef = collection(db, "users", userId, "lists", listId, "items");
  const snapshot = await getDocs(itemsRef);
  for (const docSnap of snapshot.docs) {
    await updateDoc(docSnap.ref, { purchased: true });
  }
}
