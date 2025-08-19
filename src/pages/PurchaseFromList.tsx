import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import PageHeader from "../components/ui/PageHeader";
import RoundCheck from "@/components/RoundCheck";
import PurchaseItemModal, { PurchaseExtraItem } from "@/components/PurchaseItemModal";
import BottomNav from "@/components/BottomNav";
import { useData } from "@/context/DataContext";

type ListOption = { id: string; nome: string };
const currency = (n: number) => `R$ ${Number(n || 0).toFixed(2)}`;

const PurchaseFromList: React.FC = () => {
  const navigate = useNavigate();

  // ✅ AQUI estava o problema: incluir fetchPurchases
  const { lists, fetchItems, fetchPurchases, createPurchaseFromListInContext } = useData();

  const [listId, setListId] = useState<string>("");
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [selectAll, setSelectAll] = useState<boolean>(true);

  const [extras, setExtras] = useState<PurchaseExtraItem[]>([]);
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    if (lists.length && !listId) setListId(lists[0].id);
  }, [lists, listId]);

  useEffect(() => {
    if (!listId) return;
    fetchItems(listId).then(() => {
      const l = lists.find((x) => x.id === listId);
      const next: Record<string, boolean> = {};
      (l?.itens || []).forEach((it) => (next[it.id] = true));
      setSelected(next);
      setSelectAll(true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listId]);

  const options: ListOption[] = useMemo(
    () => lists.map((l) => ({ id: l.id, nome: l.nome })),
    [lists]
  );
  const list = useMemo(() => lists.find((l) => l.id === listId), [lists, listId]);

  const toggleItem = (id: string, val: boolean) => {
    const next = { ...selected, [id]: val };
    setSelected(next);
    setSelectAll((list?.itens || []).every((it) => next[it.id]));
  };

  const toggleAll = (val: boolean) => {
    setSelectAll(val);
    const map: Record<string, boolean> = {};
    (list?.itens || []).forEach((it) => (map[it.id] = val));
    setSelected(map);
  };

  const selectedCount = useMemo(
    () => Object.values(selected).filter(Boolean).length,
    [selected]
  );

  const totalSelected = useMemo(() => {
    const ids = new Set(Object.entries(selected).filter(([, v]) => v).map(([k]) => k));
    return (list?.itens || [])
      .filter((it) => ids.has(it.id))
      .reduce((sum, it) => sum + (Number(it.preco) || 0), 0);
  }, [selected, list]);

  const extrasTotal = useMemo(
    () => extras.reduce((s, it) => s + (Number(it.preco) || 0), 0),
    [extras]
  );

  const grandTotal = totalSelected + extrasTotal;

  const addExtra = (item: PurchaseExtraItem) => setExtras((prev) => [...prev, item]);
  const removeExtra = (idx: number) => setExtras((prev) => prev.filter((_, i) => i !== idx));

  const handleCreate = async () => {
    try {
      if (!list) return;

      const ids = Object.entries(selected)
        .filter(([, v]) => v)
        .map(([k]) => k);

      const created = await createPurchaseFromListInContext({
        listId: list.id,
        name: list.nome,
        market: list.market ?? "—",
        date: new Date(),
        selectedItemIds: ids,
        extras,
      });

      // Atualiza a store e navega
      await fetchPurchases();
      toast.success("Compra criada!");

      if (created?.id) {
        navigate(`/purchases/${created.id}`);
      } else {
        navigate("/purchases");
      }
    } catch (err) {
      console.error(err);
      toast.error("Não foi possível criar a compra");
      navigate("/purchases");
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-4 pb-32">
      <PageHeader title="Compra de uma lista" />

      <label className="mb-2 block font-medium text-gray-800">Selecione a lista</label>
      <select
        value={listId}
        onChange={(e) => setListId(e.target.value)}
        className="mb-6 w-full rounded-2xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-yellow-400"
      >
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.nome}
          </option>
        ))}
      </select>

      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Itens da lista</h2>
        <button
          type="button"
          onClick={() => toggleAll(!selectAll)}
          className="flex items-center gap-2 text-gray-700"
        >
          <RoundCheck checked={selectAll} onChange={toggleAll} size={20} />
          <span>Selecionar tudo</span>
        </button>
      </div>

      <ul className="mb-6 space-y-2">
        {(list?.itens || []).map((it) => {
          const checked = !!selected[it.id];
          return (
            <li
              key={it.id}
              className="flex items-start gap-3 rounded-xl border border-gray-200 p-4 active:scale-[.995]"
              onClick={() => toggleItem(it.id, !checked)}
            >
              <RoundCheck
                checked={checked}
                onChange={(val) => toggleItem(it.id, val)}
                size={24}
                className="mt-1"
              />
              <div className="flex-1">
                <div className="text-lg font-semibold text-gray-900">{it.nome}</div>
                <div className="text-sm text-gray-500">
                  {it.peso ? `${it.peso} ${it.unidade ?? ""}` : `${it.quantidade ?? 1} ${it.unidade || "un"}`} ·{" "}
                  {currency(Number(it.preco) || 0)}
                </div>
              </div>
              <div className="text-sm font-semibold text-gray-900">{currency(Number(it.preco) || 0)}</div>
            </li>
          );
        })}
      </ul>

      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Itens extras</h2>
        <button onClick={() => setOpenModal(true)} className="font-semibold text-yellow-600">
          + Adicionar
        </button>
      </div>

      {extras.length > 0 && (
        <ul className="mb-6 space-y-2">
          {extras.map((ex, i) => (
            <li key={i} className="flex items-center justify-between rounded-xl border border-gray-200 p-3">
              <div>
                <div className="font-medium text-gray-800">{ex.nome}</div>
                <div className="text-sm text-gray-500">
                  {ex.quantidade ?? 1}x {ex.peso ? `• ${ex.peso} ${ex.unidade}` : `• ${ex.unidade}`} • {currency(ex.preco)}
                </div>
              </div>
              <button onClick={() => removeExtra(i)} className="text-sm text-red-600">
                Remover
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mb-6 flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-3">
        <div className="text-sm text-gray-600">
          {selectedCount}/{list?.itens?.length ?? 0} itens
        </div>
        <div className="text-sm font-semibold text-gray-900">{currency(grandTotal)}</div>
      </div>

      <button
        onClick={handleCreate}
        className="mb-6 w-full rounded-xl bg-yellow-500 py-3 font-semibold text-black"
      >
        Criar compra
      </button>

      <BottomNav activeTab="purchases" />

      <PurchaseItemModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onConfirm={setExtras}
        title="Adicionar Item"
      />
    </div>
  );
};

export default PurchaseFromList;
