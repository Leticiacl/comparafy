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
import { db, auth } from "./firebase";

export async function fetchUserLists(userId: string) {
  const listsRef = collection(db, "users", userId, "lists");
  const snapshot = await getDocs(listsRef);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function createNewList(userId: string, name: string) {
  const listsRef = collection(db, "users", userId, "lists");
  const newList = await addDoc(listsRef, {
    name,
    createdAt: new Date(),
  });
  return newList.id;
}

export async function updateListName(userId: string, listId: string, newName: string) {
  const listRef = doc(db, "users", userId, "lists", listId);
  await updateDoc(listRef, { name: newName });
}

export async function fetchItemsFromList(userId: string, listId: string) {
  const itemsRef = collection(db, "users", userId, "lists", listId, "items");
  const snapshot = await getDocs(itemsRef);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function toggleItemPurchased(userId: string, listId: string, itemId: string, purchased: boolean) {
  const itemRef = doc(db, "users", userId, "lists", listId, "items", itemId);
  await updateDoc(itemRef, { purchased });
}

export async function deleteItem(userId: string, listId: string, itemId: string) {
  const itemRef = doc(db, "users", userId, "lists", listId, "items", itemId);
  await deleteDoc(itemRef);
}

export async function addItemToList(userId: string, listId: string, item: any) {
  const itemsRef = collection(db, "users", userId, "lists", listId, "items");
  await addDoc(itemsRef, { ...item, purchased: false });
}

export async function saveProductSuggestion(userId: string, productName: string) {
  const ref = doc(db, "users", userId, "suggestions", "products");
  const snapshot = await getDoc(ref);
  const existing = snapshot.exists() ? snapshot.data().list || [] : [];
  if (!existing.includes(productName)) {
    await setDoc(ref, { list: [...existing, productName] });
  }
}

export async function saveMarketSuggestion(userId: string, marketName: string) {
  const ref = doc(db, "users", userId, "suggestions", "markets");
  const snapshot = await getDoc(ref);
  const existing = snapshot.exists() ? snapshot.data().list || [] : [];
  if (!existing.includes(marketName)) {
    await setDoc(ref, { list: [...existing, marketName] });
  }
}

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
