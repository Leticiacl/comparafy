// src/components/ui/AddItemModal.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Dialog } from "@headlessui/react";
import { useData, Item } from "@/context/DataContext";

type Props = {
  isOpen: boolean;
  onClose(): void;
  listId: string;
  itemToEdit?: Item | null;
};

const UNITS = [
  { value: "un", label: "Unidade" },
  { value: "bd", label: "Bandeja" },
  { value: "dz", label: "Dúzia" },
  { value: "kg", label: "Quilo (kg)" },
  { value: "g", label: "Grama (g)" },
  { value: "l", label: "Litro (l)" },
  { value: "ml", label: "Mililitro (ml)" },
];

export default function AddItemModal({ isOpen, onClose, listId, itemToEdit }: Props) {
  const { addItem, updateItem } = useData();

  const [nome, setNome] = useState("");
  const [quantidade, setQuantidade] = useState<number | "">(1);
  const [unidade, setUnidade] = useState("un");
  const [peso, setPeso] = useState<number | "">("");
  const [preco, setPreco] = useState<number | "">("");
  const [observacoes, setObservacoes] = useState("");

  useEffect(() => {
    if (itemToEdit) {
      setNome(itemToEdit.nome || "");
      setQuantidade(itemToEdit.quantidade ?? 1);
      setUnidade(itemToEdit.unidade || "un");
      setPeso(itemToEdit.peso ?? "");
      setPreco(itemToEdit.preco ?? "");
      setObservacoes(itemToEdit.observacoes || "");
    } else {
      setNome("");
      setQuantidade(1);
      setUnidade("un");
      setPeso("");
      setPreco("");
      setObservacoes("");
    }
  }, [itemToEdit, isOpen]);

  const canSave = useMemo(() => {
    return nome.trim().length > 1 && Number(preco || 0) >= 0 && Number(quantidade || 0) > 0;
  }, [nome, preco, quantidade]);

  const handleSave = async () => {
    if (!canSave) return;

    const data = {
      nome: nome.trim(),
      quantidade: Number(quantidade || 1),
      unidade,
      peso: peso === "" ? undefined : Number(peso),
      preco: Number(preco || 0),
      observacoes: observacoes.trim(),
    } as Omit<Item, "id" | "comprado">;

    if (itemToEdit?.id) {
      await updateItem(listId, itemToEdit.id, data);
    } else {
      await addItem(listId, data);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
      <div className="fixed inset-0 flex items-end justify-center sm:items-center p-4">
        <Dialog.Panel className="w-full max-w-lg rounded-2xl bg-white p-4 shadow-xl">
          <Dialog.Title className="mb-2 text-lg font-semibold text-gray-900">
            {itemToEdit ? "Editar item" : "Adicionar item"}
          </Dialog.Title>

          <div className="space-y-3">
            <input
              className="w-full rounded-xl border px-3 py-2"
              placeholder="Nome do produto"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm text-gray-700">Quantidade</label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  className="w-full rounded-xl border px-3 py-2"
                  value={quantidade}
                  onChange={(e) => setQuantidade(e.target.value === "" ? "" : Number(e.target.value))}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-gray-700">Unidade</label>
                <select
                  className="w-full rounded-xl border px-3 py-2 bg-white"
                  value={unidade}
                  onChange={(e) => setUnidade(e.target.value)}
                >
                  {UNITS.map((u) => (
                    <option key={u.value} value={u.value}>
                      {u.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Peso opcional (útil para kg/l/ml) */}
            <div>
              <label className="mb-1 block text-sm text-gray-700">Peso (para kg/g/l/ml)</label>
              <input
                type="number"
                min={0}
                step="0.001"
                className="w-full rounded-xl border px-3 py-2"
                placeholder="Ex.: 0.580 (kg) | 500 (g) | 1.5 (l)"
                value={peso}
                onChange={(e) => setPeso(e.target.value === "" ? "" : Number(e.target.value))}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-gray-700">Preço</label>
              <input
                type="number"
                min={0}
                step="0.01"
                className="w-full rounded-xl border px-3 py-2"
                placeholder="Ex.: 9,99"
                value={preco}
                onChange={(e) => setPreco(e.target.value === "" ? "" : Number(e.target.value))}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-gray-700">Observações / Marca</label>
              <textarea
                className="w-full rounded-xl border px-3 py-2"
                rows={3}
                placeholder="Ex.: marca, promo, detalhes…"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button className="rounded-xl border px-4 py-2" onClick={onClose}>
              Cancelar
            </button>
            <button
              disabled={!canSave}
              onClick={handleSave}
              className="rounded-xl bg-yellow-500 px-4 py-2 font-semibold text-black disabled:opacity-60"
            >
              {itemToEdit ? "Salvar" : "Adicionar"}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
