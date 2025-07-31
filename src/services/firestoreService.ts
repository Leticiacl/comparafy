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
        nome: docSnap.data().name || "Sem nome",
        createdAt: docSnap.data().createdAt || null,
        itens: items,
      };
    })
  );
  return lists;
}

// Criar nova lista
export async function createNewList(userId: string, name: string) {
  const trimmed = name.trim();
  const listsRef = collection(db, "users", userId, "lists");
  const newDoc = await addDoc(listsRef, {
    name: trimmed,
    createdAt: new Date(),
  });
  return {
    id: newDoc.id,
    nome: trimmed,
    createdAt: new Date(),
    itens: [],
  };
}

// Atualizar nome da lista
export async function updateListName(
  userId: string,
  listId: string,
  newName: string
) {
  const listRef = doc(db, "users", userId, "lists", listId);
  await updateDoc(listRef, { name: newName.trim() });
}

// Buscar itens da lista
export async function fetchItemsFromList(userId: string, listId: string) {
  const itemsRef = collection(
    db,
    "users",
    userId,
    "lists",
    listId,
    "items"
  );
  const snapshot = await getDocs(itemsRef);
  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      comprado: data.purchased ?? false,
    };
  });
}

// Alternar item como comprado
export async function toggleItemPurchased(
  userId: string,
  listId: string,
  itemId: string
) {
  const itemRef = doc(
    db,
    "users",
    userId,
    "lists",
    listId,
    "items",
    itemId
  );
  const itemSnap = await getDoc(itemRef);
  const current = itemSnap.exists() ? itemSnap.data().purchased : false;
  await updateDoc(itemRef, { purchased: !current });
  return { comprado: !current };
}

// Deletar item
export async function deleteItem(
  userId: string,
  listId: string,
  itemId: string
) {
  const itemRef = doc(
    db,
    "users",
    userId,
    "lists",
    listId,
    "items",
    itemId
  );
  await deleteDoc(itemRef);
}

// Adicionar item
export async function addItemToList(
  userId: string,
  listId: string,
  item: any
) {
  const itemsRef = collection(
    db,
    "users",
    userId,
    "lists",
    listId,
    "items"
  );
  const docRef = await addDoc(itemsRef, {
    ...item,
    purchased: false,
  });
  return {
    id: docRef.id,
    ...item,
    comprado: false,
  };
}

// **Atualizar todos os campos de um item existente**
export async function updateItem(
  userId: string,
  listId: string,
  itemId: string,
  data: {
    nome?: string;
    quantidade?: number;
    unidade?: string;
    preco?: number;
    mercado?: string;
    observacoes?: string;
  }
) {
  const itemRef = doc(
    db,
    "users",
    userId,
    "lists",
    listId,
    "items",
    itemId
  );
  const toUpdate: any = {};
  if (data.nome !== undefined) toUpdate.nome = data.nome;
  if (data.quantidade !== undefined) toUpdate.quantidade = data.quantidade;
  if (data.unidade !== undefined) toUpdate.unidade = data.unidade;
  if (data.preco !== undefined) toUpdate.preco = data.preco;
  if (data.mercado !== undefined) toUpdate.mercado = data.mercado;
  if (data.observacoes !== undefined) toUpdate.observacoes = data.observacoes;
  await updateDoc(itemRef, toUpdate);
}

// Sugestões – salvar
export async function saveSuggestion(
  userId: string,
  field: string,
  value: string
) {
  const ref = doc(db, "users", userId, "suggestions", field);
  const snap = await getDoc(ref);
  const existing = snap.exists() ? (snap.data() as any).list || [] : [];
  if (!existing.includes(value)) {
    await setDoc(ref, { list: [...existing, value] });
  }
}

// Sugestões – buscar
export async function getSuggestionsForField(
  userId: string,
  field: string
) {
  const ref = doc(db, "users", userId, "suggestions", field);
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() as any).list || [] : [];
}

// Excluir lista e seus itens
export async function deleteListFromFirestore(
  userId: string,
  listId: string
) {
  const itemsRef = collection(
    db,
    "users",
    userId,
    "lists",
    listId,
    "items"
  );
  const snapshot = await getDocs(itemsRef);
  await Promise.all(snapshot.docs.map((d) => deleteDoc(d.ref)));
  const listRef = doc(db, "users", userId, "lists", listId);
  await deleteDoc(listRef);
}

// Duplicar lista
export async function duplicateList(
  userId: string,
  originalListId: string
) {
  const originalRef = doc(
    db,
    "users",
    userId,
    "lists",
    originalListId
  );
  const originalSnap = await getDoc(originalRef);
  if (!originalSnap.exists()) return;
  const originalData = originalSnap.data();
  const newRef = await addDoc(
    collection(db, "users", userId, "lists"),
    {
      name: originalData.name + " (cópia)",
      createdAt: new Date(),
    }
  );
  const items = await fetchItemsFromList(userId, originalListId);
  const itemsRef = collection(
    db,
    "users",
    userId,
    "lists",
    newRef.id,
    "items"
  );
  for (const item of items) {
    const { id, ...rest } = item;
    await addDoc(itemsRef, rest);
  }
  return newRef.id;
}

// Marcar todos como comprados
export async function markAllItemsPurchased(
  userId: string,
  listId: string
) {
  const itemsRef = collection(
    db,
    "users",
    userId,
    "lists",
    listId,
    "items"
  );
  const snapshot = await getDocs(itemsRef);
  for (const docSnap of snapshot.docs) {
    await updateDoc(docSnap.ref, { purchased: true });
  }
}
