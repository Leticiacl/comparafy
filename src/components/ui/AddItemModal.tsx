// src/components/ui/AddItemModal.tsx
import React from "react";
import { Dialog } from "@headlessui/react";

type Props = {
  isOpen: boolean;
  onClose(): void;
  listId: string;
  itemToEdit?: any | null;
  onAdd?: (payload: {
    nome: string;
    quantidade: number;
    unidade: string;
    peso?: number | null;
    preco: number;
    mercado?: string;
    observacoes?: string;
  }) => Promise<void> | void; // (opcional) para listas fora do contexto
};

const defaultState = {
  nome: "",
  quantidade: 1,
  unidade: "un",
  peso: "" as number | "" | null,
  preco: "" as number | "",
  mercado: "",
  observacoes: "",
};

const AddItemModal: React.FC<Props> = ({ isOpen, onClose, itemToEdit, onAdd }) => {
  const [form, setForm] = React.useState(defaultState);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (itemToEdit) {
      setForm({
        nome: itemToEdit.nome || "",
        quantidade: itemToEdit.quantidade ?? 1,
        unidade: itemToEdit.unidade || "un",
        peso: itemToEdit.peso ?? "",
        preco: itemToEdit.preco ?? "",
        mercado: itemToEdit.mercado || "",
        observacoes: itemToEdit.observacoes || "",
      });
    } else {
      setForm(defaultState);
    }
  }, [itemToEdit, isOpen]);

  const handleAdd = async () => {
    if (saving) return;
    const payload = {
      nome: form.nome.trim(),
      quantidade: Number(form.quantidade || 1),
      unidade: form.unidade || "un",
      peso: form.peso === "" ? undefined : Number(form.peso),
      preco: Number(form.preco || 0),
      mercado: form.mercado?.trim() || "",
      observacoes: form.observacoes?.trim() || "",
    };
    if (!payload.nome) return;

    setSaving(true);
    try {
      if (onAdd) await onAdd(payload);
      // NÃO fecha – limpa para facilitar adicionar vários itens
      setForm({
        ...defaultState,
        unidade: form.unidade, // mantém unidade mais usada
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/20" />
      <div className="fixed inset-0 grid place-items-center p-4">
        <Dialog.Panel className="w-full max-w-md rounded-2xl bg-white p-4">
          <Dialog.Title className="mb-3 text-lg font-semibold">
            {itemToEdit ? "Editar item" : "Adicionar item"}
          </Dialog.Title>

          <div className="space-y-3">
            <input
              className="w-full rounded-lg border px-3 py-2"
              placeholder="Nome"
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
              <input
                className="rounded-lg border px-3 py-2"
                placeholder="Unidade (un, kg, g...)"
                value={form.unidade}
                onChange={(e) => setForm((s) => ({ ...s, unidade: e.target.value }))}
              />
              <input
                className="rounded-lg border px-3 py-2"
                type="number"
                placeholder="Peso (opcional)"
                value={form.peso}
                onChange={(e) =>
                  setForm((s) => ({ ...s, peso: e.target.value === "" ? "" : Number(e.target.value) }))
                }
              />
            </div>
            <input
              className="w-full rounded-lg border px-3 py-2"
              type="number"
              placeholder="Preço"
              value={form.preco}
              onChange={(e) => setForm((s) => ({ ...s, preco: e.target.value === "" ? "" : Number(e.target.value) }))}
            />
            <input
              className="w-full rounded-lg border px-3 py-2"
              placeholder="Mercado (opcional)"
              value={form.mercado}
              onChange={(e) => setForm((s) => ({ ...s, mercado: e.target.value }))}
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
};

export default AddItemModal;
