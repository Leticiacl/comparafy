import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "./firebase";

// Buscar todas as listas do usuário
export async function fetchUserLists(userId: string) {
  const listsRef = collection(db, "users", userId, "lists");
  const snapshot = await getDocs(listsRef);
  const lists = await Promise.all(
    snapshot.docs.map(async (docSnap) => {
      const items = await fetchItemsFromList(userId, docSnap.id);
      return { id: docSnap.id, ...docSnap.data(), items };
    })
  );
  return lists;
}

// Criar uma nova lista
export async function createNewList(userId: string, name: string) {
  const listsRef = collection(db, "users", userId, "lists");
  const newList = await addDoc(listsRef, {
    name,
    createdAt: new Date(),
  });
  return newList.id;
}

// Atualizar o nome da lista
export async function updateListName(userId: string, listId: string, newName: string) {
  const listRef = doc(db, "users", userId, "lists", listId);
  await updateDoc(listRef, { name: newName });
}

// Buscar itens da lista
export async function fetchItemsFromList(userId: string, listId: string) {
  const itemsRef = collection(db, "users", userId, "lists", listId, "items");
  const snapshot = await getDocs(itemsRef);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

// Alternar item como comprado
export async function toggleItemPurchased(userId: string, listId: string, itemId: string, purchased: boolean) {
  const itemRef = doc(db, "users", userId, "lists", listId, "items", itemId);
  await updateDoc(itemRef, { purchased });
}

// Deletar item da lista
export async function deleteItem(userId: string, listId: string, itemId: string) {
  const itemRef = doc(db, "users", userId, "lists", listId, "items", itemId);
  await deleteDoc(itemRef);
}

// Adicionar item na lista
export async function addItemToList(userId: string, listId: string, item: any) {
  const itemsRef = collection(db, "users", userId, "lists", listId, "items");
  await addDoc(itemsRef, { ...item, purchased: false });
}

// Sugestão de produto
export async function saveProductSuggestion(userId: string, productName: string) {
  const ref = doc(db, "users", userId, "suggestions", "products");
  const snapshot = await getDoc(ref);
  const existing = snapshot.exists() ? snapshot.data().list || [] : [];
  if (!existing.includes(productName)) {
    await setDoc(ref, { list: [...existing, productName] });
  }
}

// Sugestão de mercado
export async function saveMarketSuggestion(userId: string, marketName: string) {
  const ref = doc(db, "users", userId, "suggestions", "markets");
  const snapshot = await getDoc(ref);
  const existing = snapshot.exists() ? snapshot.data().list || [] : [];
  if (!existing.includes(marketName)) {
    await setDoc(ref, { list: [...existing, marketName] });
  }
}

// Buscar sugestões de produto e mercado
export async function fetchSuggestions(userId: string) {
  const productsRef = doc(db, "users", userId, "suggestions", "products");
  const marketsRef = doc(db, "users", userId, "suggestions", "markets");

  const [productsSnap, marketsSnap] = await Promise.all([
    getDoc(productsRef),
    getDoc(marketsRef),
  ]);

  return {
    products: productsSnap.exists() ? productsSnap.data().list || [] : [],
    markets: marketsSnap.exists() ? marketsSnap.data().list || [] : [],
  };
}

// Excluir lista e seus itens
export async function deleteList(userId: string, listId: string) {
  const itemsRef = collection(db, "users", userId, "lists", listId, "items");
  const snapshot = await getDocs(itemsRef);

  const deletePromises = snapshot.docs.map((doc) =>
    deleteDoc(doc.ref)
  );

  await Promise.all(deletePromises);

  const listRef = doc(db, "users", userId, "lists", listId);
  await deleteDoc(listRef);
}
