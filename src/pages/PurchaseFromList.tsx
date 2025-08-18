// src/pages/PurchaseFromList.tsx
import React, { useEffect, useMemo, useState } from "react";
import BottomNav from "../components/BottomNav";
import { useData } from "../context/DataContext";
import { useNavigate } from "react-router-dom";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
function toDate(d: any): Date {
  if (!d) return new Date(0);
  if (typeof d?.seconds === "number") return new Date(d.seconds * 1000);
  if (typeof d === "string") return new Date(d);
  return new Date(d);
}
function formatDateBR(d: any) {
  const date = toDate(d);
  try {
    return date.toLocaleDateString("pt-BR");
  } catch {
    return "";
  }
}

const PurchaseFromList: React.FC = () => {
  const { lists, fetchUserData, fetchItems, createPurchaseFromListInContext } =
    useData();
  const [listId, setListId] = useState<string>("");
  const [name, setName] = useState("");
  const [market, setMarket] = useState("");
  const [date, setDate] = useState<string>(todayISO());
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [selectAll, setSelectAll] = useState(false);
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    fetchUserData();
  }, []);

  const currentList = useMemo(
    () => lists.find((l) => l.id === listId),
    [lists, listId]
  );

  // quando troca de lista, carrega itens
  useEffect(() => {
    if (listId) fetchItems(listId);
  }, [listId]);

  // controlar Select All
  useEffect(() => {
    if (!currentList) return;
    const next: Record<string, boolean> = {};
    for (const it of currentList.itens || []) next[it.id] = selectAll;
    setSelected(next);
  }, [selectAll, currentList?.id]);

  const toggleItem = (id: string) => {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const canCreate =
    listId && name.trim() && market.trim() && date && currentList;

  const handleCreate = async () => {
    if (!canCreate) return;
    try {
      setLoading(true);
      const selectedItemIds = Object.entries(selected)
        .filter(([, v]) => v)
        .map(([k]) => k);

      await createPurchaseFromListInContext({
        listId,
        name: name.trim(),
        market: market.trim(),
        date: new Date(date),
        selectedItemIds, // se vazio, o service leva todos
      });

      alert("Compra criada a partir da lista.");
      nav("/purchases");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 pb-28 max-w-xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Compra de lista</h1>
        <img src="/LOGO_REDUZIDA.png" alt="Logo" className="h-8" />
      </div>

      <div className="mt-4 border rounded-xl p-4 space-y-3">
        <label className="block text-sm text-gray-700">Selecione a lista</label>
        <select
          className="w-full border rounded-lg px-3 py-2"
          value={listId}
          onChange={(e) => setListId(e.target.value)}
        >
          <option value="">-- Escolha uma lista --</option>
          {lists.map((l) => (
            <option key={l.id} value={l.id}>
              {l.nome} • {formatDateBR(l.createdAt)}
            </option>
          ))}
        </select>

        <label className="block text-sm text-gray-700">Nome da compra</label>
        <input
          className="w-full border rounded-lg px-3 py-2"
          placeholder="Ex.: Compra do mês"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label className="block text-sm text-gray-700">Mercado</label>
        <input
          className="w-full border rounded-lg px-3 py-2"
          placeholder="Ex.: Carrefour"
          value={market}
          onChange={(e) => setMarket(e.target.value)}
        />

        <label className="block text-sm text-gray-700">Data</label>
        <input
          type="date"
          className="w-full border rounded-lg px-3 py-2"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      {/* Itens da lista com selecionar tudo */}
      {currentList && (
        <div className="mt-6 border rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Itens da lista</h2>
            <label className="text-sm flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={(e) => setSelectAll(e.target.checked)}
              />
              Selecionar tudo
            </label>
          </div>

          {(currentList.itens || []).length === 0 ? (
            <p className="text-gray-500">Lista sem itens.</p>
          ) : (
            <ul className="space-y-2">
              {currentList.itens.map((it) => {
                const total = Number(it.preco || 0) * Number(it.quantidade || 1);
                return (
                  <li
                    key={it.id}
                    className="flex items-center justify-between border rounded-lg px-3 py-2"
                  >
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={!!selected[it.id]}
                        onChange={() => toggleItem(it.id)}
                      />
                      <div>
                        <div className="font-medium text-gray-800">
                          {it.nome} {it.peso ? `· ${it.peso}${it.unidade || ""}` : ""}
                        </div>
                        <div className="text-xs text-gray-500">
                          {it.quantidade}x • UN R$ {Number(it.preco || 0).toFixed(2)}
                        </div>
                      </div>
                    </label>
                    <div className="text-sm font-semibold">
                      R$ {total.toFixed(2)}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      <button
        className="w-full mt-6 bg-yellow-500 text-black py-3 rounded-xl font-medium shadow disabled:opacity-50"
        onClick={handleCreate}
        disabled={!canCreate || loading}
      >
        {loading ? "Criando..." : "Criar compra"}
      </button>

      <BottomNav activeTab="purchases" />
    </div>
  );
};

export default PurchaseFromList;
