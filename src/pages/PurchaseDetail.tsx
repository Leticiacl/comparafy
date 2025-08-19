import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Menu, Dialog } from "@headlessui/react";
import {
  ArrowLeftIcon,
  EllipsisVerticalIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { useData } from "@/context/DataContext";
import BottomNav from "@/components/BottomNav";
import PurchaseItemModal, { PurchaseExtraItem as PurchaseItem } from "@/components/PurchaseItemModal";

const brl = (n: number) => (Number(n) || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const dateOnly = (any: any) => {
  const ms = typeof any === "number" ? any : any?.seconds ? any.seconds * 1000 : Date.parse(any || "");
  if (!Number.isFinite(ms)) return "";
  return new Date(ms).toLocaleDateString("pt-BR");
};

export default function PurchaseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    purchases,
    renamePurchaseInContext,
    deletePurchaseInContext,
    updatePurchaseItemInContext,
    deletePurchaseItemInContext,
    appendItemsToPurchaseById,
  } = useData();

  const p = useMemo(() => purchases.find((x) => x.id === id), [purchases, id]);

  const [editingTitle, setEditingTitle] = useState(false);
  const [newName, setNewName] = useState(p?.name || "");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  // editar item (dialog simples)
  type EditState = { index: number; nome: string; quantidade: number; unidade: string; preco: number; peso?: number };
  const [edit, setEdit] = useState<EditState | null>(null);

  if (!p) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-500">Compra não encontrada.</p>
        <BottomNav activeTab="purchases" />
      </div>
    );
  }

  const total =
    p.itens?.reduce((acc, it) => acc + (Number(it.preco) || 0) * (Number(it.quantidade) || 1), 0) || 0;

  return (
    <div className="mx-auto max-w-xl bg-white p-4 pb-28">
      {/* Cabeçalho no padrão de Listas */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex flex-1 items-start">
          <button onClick={() => navigate(-1)} className="mr-2 p-1" aria-label="Voltar">
            <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
          </button>

          <div className="flex-1">
            {editingTitle ? (
              <div className="flex gap-2">
                <input
                  autoFocus
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full rounded-lg border px-3 py-1"
                />
                <button
                  className="rounded-lg bg-yellow-500 px-3 text-black"
                  onClick={async () => {
                    if (newName.trim()) {
                      await renamePurchaseInContext(p.id, newName.trim());
                      setEditingTitle(false);
                    }
                  }}
                >
                  Salvar
                </button>
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-bold">{p.name}</h1>
                <p className="mt-0.5 text-sm text-gray-500">
                  {dateOnly(p.createdAt)} {p.market ? `· ${p.market}` : ""}
                </p>
              </>
            )}
          </div>
        </div>

        <Menu as="div" className="relative ml-2">
          <Menu.Button className="p-1">
            <EllipsisVerticalIcon className="h-6 w-6 text-gray-600" />
          </Menu.Button>
          <Menu.Items className="absolute right-0 z-10 mt-2 w-56 overflow-hidden rounded-md bg-white shadow ring-1 ring-black/5">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => {
                    setNewName(p.name);
                    setEditingTitle(true);
                  }}
                  className={`flex w-full items-center gap-2 px-4 py-2 text-left ${active ? "bg-gray-100" : ""}`}
                >
                  <PencilSquareIcon className="h-5 w-5 text-gray-600" />
                  Renomear
                </button>
              )}
            </Menu.Item>
            <div className="h-px bg-gray-100" />
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className={`flex w-full items-center gap-2 px-4 py-2 text-left text-red-600 ${
                    active ? "bg-gray-100" : ""
                  }`}
                >
                  <TrashIcon className="h-5 w-5" />
                  Excluir
                </button>
              )}
            </Menu.Item>
          </Menu.Items>
        </Menu>

        <img src="/LOGO_REDUZIDA.png" alt="Logo" className="ml-2 h-8" />
      </div>

      {/* Botão adicionar item (igual Listas) */}
      <button
        onClick={() => setAddOpen(true)}
        className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl bg-yellow-500 py-3 text-black shadow active:scale-[0.99]"
      >
        <span className="text-2xl leading-none">+</span> Adicionar item
      </button>

      {/* Itens da compra – estilo da ListDetail */}
      <div className="overflow-hidden rounded-2xl border border-gray-200">
        {p.itens?.map((it, i) => {
          const totalItem = (Number(it.preco) || 0) * (Number(it.quantidade) || 1);
          return (
            <div key={i} className="flex items-start justify-between p-4">
              <div>
                <p className="font-medium text-gray-900">{it.nome}</p>
                <p className="text-sm text-gray-500">
                  {it.quantidade ?? 1}x{" "}
                  {it.peso ? `• ${it.peso} ${it.unidade || ""}` : it.unidade ? `• ${it.unidade}` : ""}
                </p>

                <div className="mt-2 flex gap-4 text-sm">
                  <button
                    onClick={() =>
                      setEdit({
                        index: i,
                        nome: it.nome,
                        quantidade: it.quantidade ?? 1,
                        unidade: it.unidade || "un",
                        preco: Number(it.preco) || 0,
                        peso: it.peso,
                      })
                    }
                    className="flex items-center gap-1 text-gray-700"
                  >
                    <PencilSquareIcon className="h-4 w-4" />
                    Editar
                  </button>
                  <button
                    onClick={() => deletePurchaseItemInContext(p.id, i)}
                    className="flex items-center gap-1 text-red-600"
                  >
                    <TrashIcon className="h-4 w-4" />
                    Excluir
                  </button>
                </div>
              </div>

              <div className="text-right">
                <div className="font-semibold text-gray-900">{brl(totalItem)}</div>
                <div className="text-sm text-gray-500">UN. {brl(Number(it.preco) || 0)}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Total */}
      <div className="mt-6 flex items-center justify-between">
        <span className="text-lg font-bold">Total</span>
        <span className="text-lg font-extrabold">{brl(total)}</span>
      </div>

      <BottomNav activeTab="purchases" />

      {/* Modal adicionar item */}
      <PurchaseItemModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onConfirm={async (item) => {
          const payload: PurchaseItem = {
            nome: item.nome,
            quantidade: item.quantidade ?? 1,
            unidade: item.unidade ?? "un",
            preco: Number(item.preco || 0),
            mercado: item.mercado ?? "",
            observacoes: item.observacoes ?? "",
            peso: item.peso,
          };
          await appendItemsToPurchaseById(p.id, [payload]);
          setAddOpen(false);
        }}
        title="Adicionar Item"
      />

      {/* Dialog editar item */}
      <Dialog open={!!edit} onClose={() => setEdit(null)} className="relative z-50">
        <div className="fixed inset-0 bg-black/20" />
        <div className="fixed inset-0 grid place-items-center p-4">
          <Dialog.Panel className="w-full max-w-sm rounded-xl bg-white p-4 shadow">
            <Dialog.Title className="mb-3 text-lg font-semibold">Editar item</Dialog.Title>

            <div className="space-y-3">
              <input
                className="w-full rounded-lg border px-3 py-2"
                placeholder="Nome"
                value={edit?.nome || ""}
                onChange={(e) => setEdit((s) => (s ? { ...s, nome: e.target.value } : s))}
              />
              <div className="grid grid-cols-3 gap-2">
                <input
                  className="rounded-lg border px-3 py-2"
                  placeholder="Qtd"
                  type="number"
                  value={edit?.quantidade ?? 1}
                  onChange={(e) => setEdit((s) => (s ? { ...s, quantidade: Number(e.target.value || 1) } : s))}
                />
                <input
                  className="rounded-lg border px-3 py-2"
                  placeholder="Unidade"
                  value={edit?.unidade || "un"}
                  onChange={(e) => setEdit((s) => (s ? { ...s, unidade: e.target.value } : s))}
                />
                <input
                  className="rounded-lg border px-3 py-2"
                  placeholder="Peso (opcional)"
                  type="number"
                  value={edit?.peso ?? ""}
                  onChange={(e) =>
                    setEdit((s) => (s ? { ...s, peso: e.target.value === "" ? undefined : Number(e.target.value) } : s))
                  }
                />
              </div>
              <input
                className="w-full rounded-lg border px-3 py-2"
                placeholder="Preço"
                type="number"
                value={edit?.preco ?? 0}
                onChange={(e) => setEdit((s) => (s ? { ...s, preco: Number(e.target.value || 0) } : s))}
              />
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button className="rounded-lg bg-gray-100 px-3 py-2" onClick={() => setEdit(null)}>
                Cancelar
              </button>
              <button
                className="rounded-lg bg-yellow-500 px-3 py-2 text-black"
                onClick={async () => {
                  if (!edit) return;
                  await updatePurchaseItemInContext(p.id, edit.index, {
                    nome: edit.nome,
                    quantidade: edit.quantidade,
                    unidade: edit.unidade,
                    preco: edit.preco,
                    peso: edit.peso,
                  });
                  setEdit(null);
                }}
              >
                Salvar
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Dialog excluir compra */}
      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/20" />
        <div className="fixed inset-0 grid place-items-center p-4">
          <Dialog.Panel className="w-full max-w-sm rounded-xl bg-white p-4 shadow">
            <Dialog.Title className="mb-4 text-lg font-semibold">Deseja excluir esta compra?</Dialog.Title>
            <div className="flex justify-end gap-2">
              <button className="rounded-lg bg-gray-100 px-3 py-2" onClick={() => setConfirmDelete(false)}>
                Cancelar
              </button>
              <button
                className="rounded-lg bg-red-500 px-3 py-2 text-white"
                onClick={async () => {
                  await deletePurchaseInContext(p.id);
                  setConfirmDelete(false);
                  navigate("/purchases");
                }}
              >
                Excluir
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
