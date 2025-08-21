import { useEffect, useMemo, useState } from "react";
import { Dialog } from "@headlessui/react";

type Props = {
  isOpen: boolean;
  onClose(): void;
  listId: string;
  itemToEdit?: any | null;
  onAdd?: (payload: {
    nome: string;
    quantidade: number;
    unidade: string;      // un | kg | g | L | ml | pacote ...
    peso?: number | null; // quando aplicável (kg/g/L/ml)
    preco: number;
    observacoes?: string;
  }) => Promise<void> | void;
};

const defaultState = {
  nome: "",
  quantidade: 1,
  unidade: "un",
  peso: "" as number | "" | null,
  preco: "" as number | "",
  observacoes: "",
};

const UNITS = ["un", "kg", "g", "L", "ml", "pacote", "cx", "dz"];

export default function AddItemModal({ isOpen, onClose, itemToEdit, onAdd }: Props) {
  const [form, setForm] = useState(defaultState);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (itemToEdit) {
      setForm({
        nome: itemToEdit.nome || "",
        quantidade: itemToEdit.quantidade ?? 1,
        unidade: itemToEdit.unidade || "un",
        peso: itemToEdit.peso ?? "",
        preco: itemToEdit.preco ?? "",
        observacoes: itemToEdit.observacoes || "",
      });
    } else {
      setForm(defaultState);
    }
  }, [itemToEdit, isOpen]);

  const needsWeight = useMemo(() => ["kg", "g", "L", "ml"].includes(String(form.unidade)), [form.unidade]);

  const handleAdd = async () => {
    if (saving) return;
    const payload = {
      nome: form.nome.trim(),
      quantidade: Number(form.quantidade || 1),
      unidade: form.unidade || "un",
      peso: needsWeight ? (form.peso === "" ? undefined : Number(form.peso)) : undefined,
      preco: Number(form.preco || 0),
      observacoes: form.observacoes?.trim() || "",
    };
    if (!payload.nome) return;

    setSaving(true);
    try {
      if (onAdd) await onAdd(payload);
      setForm({
        ...defaultState,
        unidade: form.unidade, // mantém unidade preferida
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" />
      <div className="fixed inset-0 grid place-items-center p-4">
        <Dialog.Panel className="w-full max-w-md rounded-2xl bg-white p-4">
          <Dialog.Title className="mb-3 text-lg font-semibold">
            {itemToEdit ? "Editar item" : "Adicionar item"}
          </Dialog.Title>

          <div className="space-y-3">
            <input
              className="w-full rounded-lg border px-3 py-2"
              placeholder="Nome do item"
              value={form.nome}
              onChange={(e) => setForm((s) => ({ ...s, nome: e.target.value }))}
            />

            <div className="grid grid-cols-3 gap-2">
              <input
                className="rounded-lg border px-3 py-2"
                type="number"
                placeholder="Qtd"
                value={form.quantidade}
                onChange={(e) => setForm((s) => ({ ...s, quantidade: Number(e.target.value || 1) }))}
              />

              <select
                className="rounded-lg border px-3 py-2 bg-white"
                value={form.unidade}
                onChange={(e) => setForm((s) => ({ ...s, unidade: e.target.value }))}
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>

              {needsWeight ? (
                <input
                  className="rounded-lg border px-3 py-2"
                  type="number"
                  placeholder={`Peso (${form.unidade})`}
                  value={form.peso}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, peso: e.target.value === "" ? "" : Number(e.target.value) }))
                  }
                />
              ) : (
                <input
                  disabled
                  className="rounded-lg border px-3 py-2 text-gray-400"
                  placeholder="Peso — n/a"
                />
              )}
            </div>

            <input
              className="w-full rounded-lg border px-3 py-2"
              type="number"
              placeholder="Preço"
              value={form.preco}
              onChange={(e) => setForm((s) => ({ ...s, preco: e.target.value === "" ? "" : Number(e.target.value) }))}
            />

            <textarea
              className="w-full rounded-lg border px-3 py-2"
              placeholder="Observações"
              value={form.observacoes}
              onChange={(e) => setForm((s) => ({ ...s, observacoes: e.target.value }))}
            />
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button className="rounded-lg bg-gray-100 px-4 py-2" onClick={onClose}>
              Cancelar
            </button>
            <button
              disabled={saving}
              className="rounded-lg bg-yellow-500 px-4 py-2 font-semibold text-black disabled:opacity-60"
              onClick={handleAdd}
            >
              {itemToEdit ? "Salvar" : "Adicionar"}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
