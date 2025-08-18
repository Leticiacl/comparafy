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

/* =========================================================
 * TIPOS
 * =======================================================*/

export type PurchaseItem = {
  id?: string;
  nome: string;
  quantidade?: number;
  unidade?: string;
  preco: number;
  mercado?: string;
  observacoes?: string;
  peso?: number;
};

export type Purchase = {
  id: string;
  nome?: string; // nome da compra
  createdAt: any;
  source: "list" | "receipt";
  sourceRefId?: string;
  sourceRefName?: string;
  market?: string;
  itens: PurchaseItem[];
};

/* =========================================================
 * LISTAS
 * =======================================================*/

// Buscar todas as listas do usuário
export async function fetchUserLists(userId: string) {
  const listsRef = collection(db, "users", userId, "lists");
  const snapshot = await getDocs(listsRef);
  const lists = await Promise.all(
    snapshot.docs.map(async (docSnap) => {
      const items = await fetchItemsFromList(userId, docSnap.id);
      const data = docSnap.data() as any;
      return {
        id: docSnap.id,
        nome: data.name || "Sem nome",
        createdAt: data.createdAt || null,
        market: data.market || "",
        itens: items,
      };
    })
  );
  return lists;
}

// Criar nova lista (apenas nome, como combinado)
export async function createNewList(userId: string, name: string) {
  const trimmed = name.trim();
  const listsRef = collection(db, "users", userId, "lists");
  const createdAt = new Date();
  const newDoc = await addDoc(listsRef, {
    name: trimmed,
    createdAt,
  });
  return {
    id: newDoc.id,
    nome: trimmed,
    createdAt,
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
  const itemsRef = collection(db, "users", userId, "lists", listId, "items");
  const snapshot = await getDocs(itemsRef);
  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data() as any;
    return {
      id: docSnap.id,
      nome: data.nome,
      quantidade: data.quantidade,
      unidade: data.unidade,
      preco: data.preco,
      mercado: data.mercado,
      observacoes: data.observacoes,
      comprado: data.purchased ?? false,
      peso: data.peso,
    };
  });
}

// Alternar item como comprado
export async function toggleItemPurchased(
  userId: string,
  listId: string,
  itemId: string
) {
  const itemRef = doc(db, "users", userId, "lists", listId, "items", itemId);
  const itemSnap = await getDoc(itemRef);
  const current = itemSnap.exists()
    ? (itemSnap.data() as any).purchased
    : false;
  await updateDoc(itemRef, { purchased: !current });
  return { comprado: !current };
}

// Deletar item
export async function deleteItem(
  userId: string,
  listId: string,
  itemId: string
) {
  const itemRef = doc(db, "users", userId, "lists", listId, "items", itemId);
  await deleteDoc(itemRef);
}

// Adicionar item
export async function addItemToList(
  userId: string,
  listId: string,
  item: any
) {
  const itemsRef = collection(db, "users", userId, "lists", listId, "items");
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

// Atualizar/merge de um item
export async function updateItem(
  userId: string,
  listId: string,
  itemId: string,
  data: {
    nome?: string;
    quantidade?: number;
    unidade?: string;
    peso?: number;
    preco?: number;
    mercado?: string;
    observacoes?: string;
  }
) {
  const itemRef = doc(db, "users", userId, "lists", listId, "items", itemId);
  const snap = await getDoc(itemRef);
  const existingPurchased = snap.exists()
    ? (snap.data() as any).purchased
    : false;
  await setDoc(
    itemRef,
    {
      ...(data.nome !== undefined && { nome: data.nome }),
      ...(data.quantidade !== undefined && { quantidade: data.quantidade }),
      ...(data.unidade !== undefined && { unidade: data.unidade }),
      ...(data.peso !== undefined && { peso: data.peso }),
      ...(data.preco !== undefined && { preco: data.preco }),
      ...(data.mercado !== undefined && { mercado: data.mercado }),
      ...(data.observacoes !== undefined && { observacoes: data.observacoes }),
      purchased: existingPurchased,
    },
    { merge: true }
  );
}

// Sugestões (autocomplete)
export async function saveSuggestion(
  userId: string,
  field: string,
  value: string
) {
  const ref = doc(db, "users", userId, "suggestions", field);
  const snap = await getDoc(ref);
  const existing = snap.exists() ? ((snap.data() as any).list || []) : [];
  if (!existing.includes(value)) {
    await setDoc(ref, { list: [...existing, value] });
  }
}
export async function getSuggestionsForField(userId: string, field: string) {
  const ref = doc(db, "users", userId, "suggestions", field);
  const snap = await getDoc(ref);
  return snap.exists() ? ((snap.data() as any).list || []) : [];
}

// Excluir lista e seus itens
export async function deleteListFromFirestore(
  userId: string,
  listId: string
) {
  const itemsRef = collection(db, "users", userId, "lists", listId, "items");
  const snapshot = await getDocs(itemsRef);
  await Promise.all(snapshot.docs.map((d) => deleteDoc(d.ref)));
  const listRef = doc(db, "users", userId, "lists", listId);
  await deleteDoc(listRef);
}

// Duplicar lista (inclui itens)
export async function duplicateList(userId: string, originalListId: string) {
  const originalRef = doc(db, "users", userId, "lists", originalListId);
  const originalSnap = await getDoc(originalRef);
  if (!originalSnap.exists()) return;
  const originalData = originalSnap.data() as any;

  const newRef = await addDoc(collection(db, "users", userId, "lists"), {
    name: `${originalData.name} (cópia)`,
    createdAt: new Date(),
  });

  const items = await fetchItemsFromList(userId, originalListId);
  const itemsRef = collection(db, "users", userId, "lists", newRef.id, "items");
  for (const item of items) {
    const { id, comprado, ...rest } = item;
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

/* =========================================================
 * COMPRAS
 * =======================================================*/

// Buscar compras
export async function fetchPurchasesForUser(
  userId: string
): Promise<Purchase[]> {
  const purchasesRef = collection(db, "users", userId, "purchases");
  const snap = await getDocs(purchasesRef);

  const result: Purchase[] = [];
  for (const docSnap of snap.docs) {
    const data = docSnap.data() as any;

    let itens: PurchaseItem[] = Array.isArray(data.itens) ? data.itens : [];
    if (!itens.length) {
      const itemsRef = collection(
        db,
        "users",
        userId,
        "purchases",
        docSnap.id,
        "items"
      );
      const itemsSnap = await getDocs(itemsRef);
      itens = itemsSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
    }

    result.push({
      id: docSnap.id,
      nome: data.name ?? "",
      createdAt: data.createdAt ?? new Date(),
      source: data.source ?? "list",
      sourceRefId: data.sourceRefId,
      sourceRefName: data.sourceRefName,
      market: data.market,
      itens,
    });
  }

  return result;
}

/**
 * Criar compra a partir de LISTA, permitindo selecionar itens.
 * Se `selectedItemIds` vier vazio/undefined, leva TODOS os itens.
 */
export async function createPurchaseFromList(params: {
  userId: string;
  listId: string;
  name: string;
  market: string;
  date: Date;
  selectedItemIds?: string[];
}) {
  const { userId, listId, name, market, date, selectedItemIds } = params;

  // lista + nome
  const listRef = doc(db, "users", userId, "lists", listId);
  const listSnap = await getDoc(listRef);
  const listData = (listSnap.data() || {}) as any;
  const listName = listData.name || "Lista";

  // itens da lista
  let listItems = await fetchItemsFromList(userId, listId);
  if (selectedItemIds && selectedItemIds.length) {
    const set = new Set(selectedItemIds);
    listItems = listItems.filter((it) => set.has(it.id));
  }

  // cria a compra (doc)
  const pRef = await addDoc(collection(db, "users", userId, "purchases"), {
    name,
    market,
    createdAt: date,
    source: "list",
    sourceRefId: listId,
    sourceRefName: listName,
  });

  // subcoleção items
  const pItemsRef = collection(
    db,
    "users",
    userId,
    "purchases",
    pRef.id,
    "items"
  );
  for (const it of listItems) {
    const { id, comprado, ...payload } = it;
    await addDoc(pItemsRef, payload);
  }

  return {
    id: pRef.id,
    nome: name,
    createdAt: date,
    source: "list" as const,
    sourceRefId: listId,
    sourceRefName: listName,
    market,
    itens: listItems.map(({ id, comprado, ...rest }) => rest),
  };
}
// Append itens a uma compra existente (subcoleção /items)
export async function appendItemsToPurchase(params: {
  userId: string;
  purchaseId: string;
  items: PurchaseItem[];
}) {
  const { userId, purchaseId, items } = params;
  const itemsRef = collection(db, "users", userId, "purchases", purchaseId, "items");
  for (const it of items) {
    const payload = {
      nome: it.nome,
      quantidade: it.quantidade ?? 1,
      unidade: it.unidade ?? "",
      preco: it.preco ?? 0,
      mercado: it.mercado ?? "",
      observacoes: it.observacoes ?? "",
      peso: it.peso ?? null,
    };
    await addDoc(itemsRef, payload);
  }
}

// Criar compra a partir de CUPOM (scanner + parser server-side)
export async function createPurchaseFromReceipt(params: {
  userId: string;
  name: string;
  market: string;
  date: Date;
  itens?: PurchaseItem[]; // itens opcional: quando vier do parser
}) {
  const { userId, name, market, date, itens = [] } = params;

  const pRef = await addDoc(collection(db, "users", userId, "purchases"), {
    name,
    market,
    createdAt: date,
    source: "receipt",
  });

  // Se houverem itens já parseados, grava
  if (itens.length) {
    const pItemsRef = collection(
      db,
      "users",
      userId,
      "purchases",
      pRef.id,
      "items"
    );
    for (const it of itens) {
      const { id, ...payload } = it;
      await addDoc(pItemsRef, payload);
    }
  }

  return {
    id: pRef.id,
    nome: name,
    createdAt: date,
    source: "receipt" as const,
    market,
    itens,
  };
}
