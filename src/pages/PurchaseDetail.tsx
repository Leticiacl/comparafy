// src/pages/PurchaseDetail.tsx
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
import PageHeader from "@/components/ui/PageHeader";
import PurchaseItemModal, { PurchaseExtraItem as PurchaseItem } from "@/components/PurchaseItemModal";

const brl = (n: number) =>
  (Number(n) || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const dateOnly = (any: any) => {
  const ms =
    typeof any === "number"
      ? any
      : any?.seconds
      ? any.seconds * 1000
      : Date.parse(any || "");
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

  // editar item
  type EditState = {
    index: number;
    nome: string;
    quantidade: number;
    unidade: string;
    preco: number;
    peso?: number;
  };
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
    p.itens?.reduce(
      (acc, it) =>
        acc +
        (Number(it.preco) || 0) * (Number(it.quantidade) || 1),
      0
    ) || 0;

  const headerRight = (
    <Menu as="div" className="relative">
      <Menu.Button className="rounded p-2 hover:bg-gray-50">
        <EllipsisVerticalIcon className="h-6 w-6 text-gray-600" />
      </Menu.Button>
      <Menu.Items className="absolute right-0 z-10 mt-2 w-56 overflow-hidden rounded-md bg-white shadow ring-1 ring-black/5">
        <Menu.Item>
          {({ active }) => (
            <button
              onClick={() => {
                setEditingTitle(true);
                setNewName(p.name || "");
              }}
              className={`flex w-full items-center gap-2 px-4 py-2 text-left ${
                active ? "bg-gray-100" : ""
              }`}
            >
              <PencilSquareIcon className="h-5 w-5 text-gray-700" />
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
  );

  return (
    <div className="mx-auto max-w-xl bg-white p-4 pb-28">
      <PageHeader
        title={p.name || "Compra"}
        subtitle={`${dateOnly(p.createdAt)} · ${p.market || "—"} · ${(p.itens || []).length} itens`}
        leftSlot={
          <button onClick={() => navigate(-1)} className="p-1" aria-label="Voltar">
            <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
          </button>
        }
        rightSlot={headerRight}
      />

      {/* edição de nome */}
      {editingTitle && (
        <div className="mb-3 flex items-center gap-2">
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full rounded-lg border px-3 py-2"
          />
          <button
            className="rounded-lg bg-yellow-500 px-3 py-2 text-black"
            onClick={async () => {
              if (newName.trim()) {
                await renamePurchaseInContext(p.id, newName.trim());
                setEditingTitle(false);
              }
            }}
          >
            Salvar
          </button>
          <button onClick={() => setEditingTitle(false)} className="text-sm text-gray-600">
            Cancelar
          </button>
        </div>
      )}

      {/* Botão adicionar item */}
      <button
        onClick={() => setAddOpen(true)}
        className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl bg-yellow-500 py-3 text-black shadow active:scale-[0.99]"
      >
        <span className="text-2xl leading-none">+</span> Adicionar item
      </button>

      {/* Itens da compra */}
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

      {/* Diálogo excluir */}
      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)}>
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold mb-2">Excluir compra?</h3>
            <p className="text-sm text-gray-600 mb-4">
              Esta ação não poderá ser desfeita.
            </p>
            <div className="flex justify-end gap-2">
              <button className="px-3 py-2 rounded-lg border" onClick={() => setConfirmDelete(false)}>
                Cancelar
              </button>
              <button
                className="px-3 py-2 rounded-lg bg-red-600 text-white"
                onClick={async () => {
                  await deletePurchaseInContext(p.id);
                  setConfirmDelete(false);
                  navigate("/purchases");
                }}
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      </Dialog>

      {/* Modal de edição de item */}
      <PurchaseItemModal
        open={!!edit}
        onClose={() => setEdit(null)}
        onConfirm={(next) => {
          if (!edit) return;
          updatePurchaseItemInContext(p.id, edit.index, {
            nome: next.nome,
            unidade: next.unidade,
            quantidade: next.quantidade,
            preco: next.preco,
            peso: next.peso,
          } as any);
        }}
        initial={edit || undefined as any}
        title="Editar item"
      />
    </div>
  );
}
