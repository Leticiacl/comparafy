import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  serverTimestamp,
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
  preco: number;         // preço unitário
  mercado?: string;
  observacoes?: string;
  peso?: number;
};

export type Purchase = {
  id: string;
  name: string;          // nome da compra
  market?: string;
  itens: PurchaseItem[];
  itemCount: number;     // soma das quantidades
  total: number;         // soma (preco * quantidade)
  createdAt: any;        // Timestamp | ms
  source: "list" | "receipt";
  sourceRefId?: string;
  sourceRefName?: string;
};

/* =========================================================
 * HELPERS
 * =======================================================*/
const toMs = (ts: any) =>
  typeof ts === "number"
    ? ts
    : ts?.seconds
    ? ts.seconds * 1000
    : Date.parse(ts || "") || Date.now();

// remove chaves com undefined (recursivo)
function stripUndefined<T>(val: T): T {
  if (Array.isArray(val)) {
    // @ts-expect-error - mapeando genericamente
    return val.map(stripUndefined) as T;
  }
  if (val && typeof val === "object") {
    const out: any = {};
    for (const [k, v] of Object.entries(val as any)) {
      if (v !== undefined) out[k] = stripUndefined(v as any);
    }
    return out;
  }
  return val;
}

/* =========================================================
 * LISTAS
 * =======================================================*/

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

export async function updateListName(
  userId: string,
  listId: string,
  newName: string
) {
  const listRef = doc(db, "users", userId, "lists", listId);
  await updateDoc(listRef, { name: newName.trim() });
}

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
      peso: data.peso, // pode ser undefined
    };
  });
}

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

export async function deleteItem(
  userId: string,
  listId: string,
  itemId: string
) {
  const itemRef = doc(db, "users", userId, "lists", listId, "items", itemId);
  await deleteDoc(itemRef);
}

export async function addItemToList(
  userId: string,
  listId: string,
  item: any
) {
  const itemsRef = collection(db, "users", userId, "lists", listId, "items");
  const docRef = await addDoc(itemsRef, {
    ...stripUndefined(item),
    purchased: false,
  });
  return {
    id: docRef.id,
    ...item,
    comprado: false,
  };
}

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
      ...stripUndefined({
        ...(data.nome !== undefined && { nome: data.nome }),
        ...(data.quantidade !== undefined && { quantidade: data.quantidade }),
        ...(data.unidade !== undefined && { unidade: data.unidade }),
        ...(data.peso !== undefined && { peso: data.peso }),
        ...(data.preco !== undefined && { preco: data.preco }),
        ...(data.mercado !== undefined && { mercado: data.mercado }),
        ...(data.observacoes !== undefined && { observacoes: data.observacoes }),
        purchased: existingPurchased,
      }),
    },
    { merge: true }
  );
}

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
    await addDoc(itemsRef, stripUndefined(rest));
  }
  return newRef.id;
}

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

export async function fetchPurchasesForUser(userId: string): Promise<Purchase[]> {
  const purchasesRef = collection(db, "users", userId, "purchases");
  const snap = await getDocs(purchasesRef);

  const out: Purchase[] = [];
  for (const d of snap.docs) {
    const data = d.data() as any;

    // itens podem estar inline (novo) ou em subcoleção (legado)
    let itens: PurchaseItem[] = Array.isArray(data.itens) ? data.itens : [];
    if (!itens.length) {
      const itemsSnap = await getDocs(collection(db, "users", userId, "purchases", d.id, "items"));
      itens = itemsSnap.docs.map((i) => ({ id: i.id, ...(i.data() as any) }));
    }

    const computedTotal = itens.reduce(
      (s, it) => s + (Number(it.preco) || 0) * (Number(it.quantidade) || 1),
      0
    );
    const computedCount = itens.reduce((s, it) => s + (Number(it.quantidade) || 1), 0);

    out.push({
      id: d.id,
      name: data.name ?? "Compra",
      market: data.market ?? "—",
      itens,
      itemCount: Number.isFinite(Number(data.itemCount)) ? Number(data.itemCount) : computedCount,
      total: Number.isFinite(Number(data.total)) ? Number(data.total) : computedTotal,
      createdAt: data.createdAtMs ?? data.createdAt ?? Date.now(),
      source: (data.source as any) || "list",
      sourceRefId: data.sourceRefId,
      sourceRefName: data.sourceRefName,
    });
  }

  return out.sort((a, b) => toMs(b.createdAt) - toMs(a.createdAt));
}

/**
 * Criar compra a partir de LISTA.
 * Considera preço unitário e soma quantidades para os totais.
 */
export async function createPurchaseFromList(params: {
  userId: string;
  listId: string;
  name: string;
  market: string;
  date: Date;
  selectedItemIds?: string[];
  extras?: PurchaseItem[];
}): Promise<Purchase> {
  const { userId, listId, name, market, date, selectedItemIds = [], extras = [] } = params;

  // Carrega lista + itens
  const listRef = doc(db, "users", userId, "lists", listId);
  const listSnap = await getDoc(listRef);
  const listData = (listSnap.data() || {}) as any;
  const listName = listData.name || "Lista";

  let listItems = await fetchItemsFromList(userId, listId);
  if (selectedItemIds.length) {
    const allow = new Set(selectedItemIds);
    listItems = listItems.filter((it) => allow.has(it.id));
  }

  // Normaliza itens (unit price + quantidade)
  const itens: PurchaseItem[] = [
    ...listItems.map(({ id, comprado, ...rest }) =>
      stripUndefined({
        ...rest,
        quantidade: rest.quantidade ?? 1,
        unidade: rest.unidade ?? "un",
        preco: Number(rest.preco || 0),
        mercado: rest.mercado ?? "",
        observacoes: rest.observacoes ?? "",
      })
    ),
    ...extras.map((e) =>
      stripUndefined({
        nome: e.nome,
        quantidade: e.quantidade ?? 1,
        unidade: e.unidade ?? "un",
        preco: Number(e.preco || 0),
        mercado: e.mercado ?? "",
        observacoes: e.observacoes ?? "",
        peso: e.peso,
      })
    ),
  ];

  const total = itens.reduce(
    (s, it) => s + (Number(it.preco) || 0) * (Number(it.quantidade) || 1),
    0
  );
  const itemCount = itens.reduce((s, it) => s + (Number(it.quantidade) || 1), 0);

  const createdAtMs = date?.getTime?.() || Date.now();

  const payload = stripUndefined({
    name,
    market,
    source: "list",
    sourceRefId: listId,
    sourceRefName: listName,
    itens,
    itemCount,
    total,
    createdAt: serverTimestamp(),
    createdAtMs,
  });

  const pRef = await addDoc(collection(db, "users", userId, "purchases"), payload);

  return {
    id: pRef.id,
    name,
    market,
    itens,
    itemCount,
    total,
    createdAt: createdAtMs,
    source: "list",
    sourceRefId: listId,
    sourceRefName: listName,
  };
}

/** Criar compra a partir de CUPOM (scanner + parser) */
export async function createPurchaseFromReceipt(params: {
  userId: string;
  name: string;
  market: string;
  date: Date;
  itens?: PurchaseItem[];
}): Promise<Purchase> {
  const { userId, name, market, date, itens = [] } = params;

  const cleanItems = itens.map((i) =>
    stripUndefined({
      nome: i.nome,
      quantidade: i.quantidade ?? 1,
      unidade: i.unidade ?? "un",
      preco: Number(i.preco || 0), // unitário
      mercado: i.mercado ?? "",
      observacoes: i.observacoes ?? "",
      peso: i.peso,
    })
  );

  const createdAtMs = date?.getTime?.() || Date.now();
  const total = cleanItems.reduce(
    (s, it) => s + (Number(it.preco) || 0) * (Number(it.quantidade) || 1),
    0
  );
  const itemCount = cleanItems.reduce((s, it) => s + (Number(it.quantidade) || 1), 0);

  const pRef = await addDoc(
    collection(db, "users", userId, "purchases"),
    stripUndefined({
      name,
      market,
      source: "receipt",
      itens: cleanItems,
      itemCount,
      total,
      createdAt: serverTimestamp(),
      createdAtMs,
    })
  );

  return {
    id: pRef.id,
    name,
    market,
    itens: cleanItems,
    itemCount,
    total,
    createdAt: createdAtMs,
    source: "receipt",
  };
}

/* ====== AÇÕES SOBRE A COMPRA (inline no doc) ====== */

export async function updatePurchaseMeta(
  userId: string,
  purchaseId: string,
  data: Partial<{ name: string; market: string; createdAtMs: number }>
) {
  const ref = doc(db, "users", userId, "purchases", purchaseId);
  await updateDoc(ref, stripUndefined(data));
}

export async function deletePurchase(userId: string, purchaseId: string) {
  const sub = collection(db, "users", userId, "purchases", purchaseId, "items");
  const snap = await getDocs(sub);
  await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
  const ref = doc(db, "users", userId, "purchases", purchaseId);
  await deleteDoc(ref);
}

export async function updatePurchaseItem(
  userId: string,
  purchaseId: string,
  index: number,
  item: PurchaseItem
) {
  const ref = doc(db, "users", userId, "purchases", purchaseId);
  const snap = await getDoc(ref);
  const data = snap.data() as any;
  const itens: PurchaseItem[] = Array.isArray(data?.itens) ? data.itens : [];
  itens[index] = stripUndefined({
    nome: item.nome,
    quantidade: item.quantidade ?? 1,
    unidade: item.unidade ?? "un",
    preco: Number(item.preco || 0),
    mercado: item.mercado ?? "",
    observacoes: item.observacoes ?? "",
    peso: item.peso,
  });
  const total = itens.reduce(
    (s, it) => s + (Number(it.preco) || 0) * (Number(it.quantidade) || 1),
    0
  );
  const itemCount = itens.reduce((s, it) => s + (Number(it.quantidade) || 1), 0);
  await updateDoc(ref, { itens, itemCount, total });
}

export async function deletePurchaseItem(
  userId: string,
  purchaseId: string,
  index: number
) {
  const ref = doc(db, "users", userId, "purchases", purchaseId);
  const snap = await getDoc(ref);
  const data = snap.data() as any;
  const itens: PurchaseItem[] = Array.isArray(data?.itens) ? data.itens : [];
  const next = itens.filter((_, i) => i !== index);
  const total = next.reduce(
    (s, it) => s + (Number(it.preco) || 0) * (Number(it.quantidade) || 1),
    0
  );
  const itemCount = next.reduce((s, it) => s + (Number(it.quantidade) || 1), 0);
  await updateDoc(ref, { itens: next, itemCount, total });
}

export async function appendItemsToPurchaseArray(
  userId: string,
  purchaseId: string,
  items: PurchaseItem[]
) {
  const ref = doc(db, "users", userId, "purchases", purchaseId);
  const snap = await getDoc(ref);
  const data = snap.data() as any;
  const itens: PurchaseItem[] = Array.isArray(data?.itens) ? data.itens : [];
  const clean = items.map((i) =>
    stripUndefined({
      nome: i.nome,
      quantidade: i.quantidade ?? 1,
      unidade: i.unidade ?? "un",
      preco: Number(i.preco || 0),
      mercado: i.mercado ?? "",
      observacoes: i.observacoes ?? "",
      peso: i.peso,
    })
  );
  const next = [...itens, ...clean];
  const total = next.reduce(
    (s, it) => s + (Number(it.preco) || 0) * (Number(it.quantidade) || 1),
    0
  );
  const itemCount = next.reduce((s, it) => s + (Number(it.quantidade) || 1), 0);
  await updateDoc(ref, { itens: next, itemCount, total });
}

/* ===== legado (subcoleção) — mantido para compatibilidade ===== */
export async function appendItemsToPurchase(params: {
  userId: string;
  purchaseId: string;
  items: PurchaseItem[];
}) {
  const { userId, purchaseId, items } = params;
  const itemsRef = collection(db, "users", userId, "purchases", purchaseId, "items");
  for (const it of items) {
    await addDoc(itemsRef, stripUndefined({
      nome: it.nome,
      quantidade: it.quantidade ?? 1,
      unidade: it.unidade ?? "",
      preco: it.preco ?? 0,
      mercado: it.mercado ?? "",
      observacoes: it.observacoes ?? "",
      peso: it.peso,
    }));
  }
}
