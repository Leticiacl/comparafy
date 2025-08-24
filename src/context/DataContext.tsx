import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/services/firebase";
import {
  // listas
  fetchUserLists,
  createNewList,
  fetchItemsFromList,
  addItemToList as addItemToListService,
  toggleItemPurchased,
  deleteItem as deleteItemFromFirestore,
  updateItem as updateItemInFirestore,
  updateListName,
  deleteListFromFirestore,
  duplicateList,
  markAllItemsPurchased,
  saveSuggestion,
  getSuggestionsForField,
  type NewItem,
  // compras
  fetchPurchasesForUser,
  createPurchaseFromList,
  createPurchaseFromReceipt,
  appendItemsToPurchase,
  appendItemsToPurchaseArray,
  updatePurchaseMeta,
  deletePurchase,
  updatePurchaseItem,
  deletePurchaseItem,
  type Purchase,
  type PurchaseItem,
} from "@/services/firestoreService";

/* ================== Tipos locais ================== */
export interface Item {
  id: string;
  nome: string;
  quantidade: number;
  unidade: string;
  preco: number;
  mercado?: string;
  observacoes?: string;
  comprado: boolean;
  peso?: number;
}

export interface Lista {
  id: string;
  nome: string;
  market?: string;
  itens: Item[];
  createdAt?: any;
}

interface DataContextType {
  // listas
  lists: Lista[];
  fetchUserData(): Promise<void>;
  createList(nome: string): Promise<Lista | null>;
  fetchItems(listId: string): Promise<void>;
  addItem(listId: string, item: NewItem): Promise<string>;
  addItemToList?(listId: string, item: NewItem): Promise<string>; // alias
  updateItem(listId: string, itemId: string, data: Omit<Item, "id" | "comprado">): Promise<void>;
  toggleItem(listId: string, itemId: string): Promise<void>;
  deleteItem(listId: string, itemId: string): Promise<void>;
  updateListNameInContext(listId: string, novoNome: string): void;
  deleteList(listId: string): Promise<void>;
  duplicateListInContext(listId: string): Promise<void>;
  markAllInList(listId: string): Promise<void>;
  saveSuggestions(field: string, value: string): Promise<void>;
  getSuggestions(field: string): Promise<string[]>;
  savings: number;

  // compras
  purchases: Purchase[];
  fetchPurchases(): Promise<void>;
  createPurchaseFromListInContext(params: {
    listId: string;
    name: string;
    market: string;
    date: Date;
    selectedItemIds?: string[];
    extras?: PurchaseItem[];
  }): Promise<Purchase>;
  createPurchaseFromReceiptInContext(params: {
    name: string;
    market: string;
    date: Date;
    itens?: PurchaseItem[];
  }): Promise<void>;
  renamePurchaseInContext(purchaseId: string, newName: string): Promise<void>;
  deletePurchaseInContext(purchaseId: string): Promise<void>;
  updatePurchaseItemInContext(purchaseId: string, index: number, item: PurchaseItem): Promise<void>;
  deletePurchaseItemInContext(purchaseId: string, index: number): Promise<void>;
  appendItemsToPurchaseById(purchaseId: string, items: PurchaseItem[]): Promise<void>;
  appendItemsToPurchaseInContext(items: PurchaseItem[]): Promise<string | null>;
}

/* ================== Contexto ================== */
const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lists, setLists] = useState<Lista[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const uidRef = useRef<string | null>(null);

  /* -------- exige UID atual -------- */
  const requireUid = () => {
    const u = auth.currentUser?.uid || uidRef.current;
    if (!u) throw new Error("missing-user");
    return u;
  };

  /* -------- escuta mudanças de auth e (re)carrega dados -------- */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      const newUid = user?.uid ?? null;
      uidRef.current = newUid;

      if (!newUid) {
        // Logout: limpa estado
        setLists([]);
        setPurchases([]);
        return;
      }

      // Login: carrega dados do usuário
      const [l, p] = await Promise.all([
        fetchUserLists(newUid),
        fetchPurchasesForUser(newUid),
      ]);

      setLists(l);
      setPurchases(
        [...p].sort((a, b) => {
          const ta = new Date(a.createdAt?.seconds ? a.createdAt.seconds * 1000 : a.createdAt).getTime();
          const tb = new Date(b.createdAt?.seconds ? b.createdAt.seconds * 1000 : b.createdAt).getTime();
          return tb - ta;
        })
      );
    });
    return () => unsub();
  }, []);

  /* ======== Listas ======== */
  const fetchUserData = async () => {
    const userId = uidRef.current;
    if (!userId) return;
    const data = await fetchUserLists(userId);
    setLists(data);
  };

  const createList = async (nome: string) => {
    const userId = requireUid();
    const newList = await createNewList(userId, nome);
    setLists((prev) => [...prev, newList]);
    return newList;
  };

  const fetchItems = async (listId: string) => {
    const userId = requireUid();
    const itens = await fetchItemsFromList(userId, listId);
    setLists((prev) => prev.map((l) => (l.id === listId ? { ...l, itens } : l)));
  };

  const addItem = async (listId: string, item: NewItem) => {
    const userId = requireUid();
    const newId = await addItemToListService(userId, listId, item);
    await fetchItems(listId);
    return newId;
  };

  const updateItem = async (listId: string, itemId: string, data: Omit<Item, "id" | "comprado">) => {
    const userId = requireUid();
    await updateItemInFirestore(userId, listId, itemId, data);
    setLists((prev) =>
      prev.map((l) =>
        l.id === listId ? { ...l, itens: (l.itens || []).map((i) => (i.id === itemId ? { ...i, ...data } : i)) } : l
      )
    );
  };

  const toggleItem = async (listId: string, itemId: string) => {
    const userId = requireUid();
    const updated = await toggleItemPurchased(userId, listId, itemId);
    setLists((prev) =>
      prev.map((l) =>
        l.id === listId
          ? { ...l, itens: (l.itens || []).map((i) => (i.id === itemId ? { ...i, comprado: updated.comprado } : i)) }
          : l
      )
    );
  };

  const deleteItem = async (listId: string, itemId: string) => {
    const userId = requireUid();
    await deleteItemFromFirestore(userId, listId, itemId);
    setLists((prev) =>
      prev.map((l) => (l.id === listId ? { ...l, itens: (l.itens || []).filter((i) => i.id !== itemId) } : l))
    );
  };

  const updateListNameInContext = (listId: string, novoNome: string) => {
    const userId = requireUid();
    updateListName(userId, listId, novoNome);
    setLists((prev) => prev.map((l) => (l.id === listId ? { ...l, nome: novoNome } : l)));
  };

  const deleteList = async (listId: string) => {
    const userId = requireUid();
    await deleteListFromFirestore(userId, listId);
    setLists((prev) => prev.filter((l) => l.id !== listId));
  };

  const duplicateListInContext = async (listId: string) => {
    const userId = requireUid();
    await duplicateList(userId, listId);
    await fetchUserData();
  };

  const markAllInList = async (listId: string) => {
    const userId = requireUid();
    await markAllItemsPurchased(userId, listId);
    const itens = await fetchItemsFromList(userId, listId);
    setLists((prev) => prev.map((l) => (l.id === listId ? { ...l, itens } : l)));
  };

  const saveSuggestions = async (field: string, value: string) => {
    const userId = requireUid();
    await saveSuggestion(userId, field, value);
  };
  const getSuggestions = async (field: string) => {
    const userId = requireUid();
    return await getSuggestionsForField(userId, field);
  };

  const savings = lists.reduce((sum, l) => {
    const itens = l.itens || [];
    return sum + itens.reduce((acc, i) => (i.comprado ? acc + i.preco : acc), 0);
  }, 0);

  /* ======== Compras ======== */
  const fetchPurchases = async () => {
    const userId = uidRef.current;
    if (!userId) return;
    const data = await fetchPurchasesForUser(userId);
    setPurchases(
      data.sort((a, b) => {
        const ta = new Date(a.createdAt?.seconds ? a.createdAt.seconds * 1000 : a.createdAt).getTime();
        const tb = new Date(b.createdAt?.seconds ? b.createdAt.seconds * 1000 : b.createdAt).getTime();
        return tb - ta;
      })
    );
  };

  const createPurchaseFromListInContext = async (params: {
    listId: string;
    name: string;
    market: string;
    date: Date;
    selectedItemIds?: string[];
    extras?: PurchaseItem[];
  }) => {
    const userId = requireUid();
    const p = await createPurchaseFromList({ userId, ...params } as any);
    setPurchases((prev) => [p, ...prev]);
    return p;
  };

  const createPurchaseFromReceiptInContext = async (params: {
    name: string;
    market: string;
    date: Date;
    itens?: PurchaseItem[];
  }) => {
    const userId = requireUid();
    const p = await createPurchaseFromReceipt({ userId, ...params } as any);
    setPurchases((prev) => [p, ...prev]);
  };

  const renamePurchaseInContext = async (purchaseId: string, newName: string) => {
    const userId = requireUid();
    await updatePurchaseMeta(userId, purchaseId, { name: newName.trim() });
    setPurchases((prev) => prev.map((p) => (p.id === purchaseId ? { ...p, name: newName.trim() } : p)));
  };

  const deletePurchaseInContext = async (purchaseId: string) => {
    const userId = requireUid();
    await deletePurchase(userId, purchaseId);
    setPurchases((prev) => prev.filter((p) => p.id !== purchaseId));
  };

  const updatePurchaseItemInContext = async (purchaseId: string, index: number, item: PurchaseItem) => {
    const userId = requireUid();
    await updatePurchaseItem(userId, purchaseId, index, item);
    setPurchases((prev) =>
      prev.map((p) => {
        if (p.id !== purchaseId) return p;
        const itens = p.itens.map((it, i) => (i === index ? { ...item } : it));
        const total = itens.reduce((s, it) => s + (Number(it.preco) || 0) * (Number(it.quantidade) || 1), 0);
        return { ...p, itens, itemCount: itens.length, total };
      })
    );
  };

  const deletePurchaseItemInContext = async (purchaseId: string, index: number) => {
    const userId = requireUid();
    await deletePurchaseItem(userId, purchaseId, index);
    setPurchases((prev) =>
      prev.map((p) => {
        if (p.id !== purchaseId) return p;
        const itens = p.itens.filter((_, i) => i !== index);
        const total = itens.reduce((s, it) => s + (Number(it.preco) || 0) * (Number(it.quantidade) || 1), 0);
        return { ...p, itens, itemCount: itens.length, total };
      })
    );
  };

  const appendItemsToPurchaseById = async (purchaseId: string, items: PurchaseItem[]) => {
    const userId = requireUid();
    await appendItemsToPurchaseArray(userId, purchaseId, items);
    setPurchases((prev) =>
      prev.map((p) =>
        p.id === purchaseId
          ? {
              ...p,
              itens: [...(p.itens || []), ...items],
              itemCount: (p.itemCount || 0) + items.length,
              total:
                (typeof p.total === "number" ? p.total : 0) +
                items.reduce((s, it) => s + (Number(it.preco) || 0) * (Number(it.quantidade) || 1), 0),
            }
          : p
      )
    );
  };

  const appendItemsToPurchaseInContext = async (items: PurchaseItem[]): Promise<string | null> => {
    const userId = requireUid();
    if (!purchases.length) return null;
    const purchaseId = purchases[0].id;
    await appendItemsToPurchase({ userId, purchaseId, items } as any);
    setPurchases((prev) => prev.map((p) => (p.id === purchaseId ? { ...p, itens: [...(p.itens || []), ...items] } : p)));
    return purchaseId;
  };

  return (
    <DataContext.Provider
      value={{
        // listas
        lists,
        fetchUserData,
        createList,
        fetchItems,
        addItem,
        addItemToList: (listId: string, item: NewItem) => addItem(listId, item),
        updateItem,
        toggleItem,
        deleteItem,
        updateListNameInContext,
        deleteList,
        duplicateListInContext,
        markAllInList,
        saveSuggestions,
        getSuggestions,
        savings,
        // compras
        purchases,
        fetchPurchases,
        createPurchaseFromListInContext,
        createPurchaseFromReceiptInContext,
        renamePurchaseInContext,
        deletePurchaseInContext,
        updatePurchaseItemInContext,
        deletePurchaseItemInContext,
        appendItemsToPurchaseById,
        appendItemsToPurchaseInContext,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
};
