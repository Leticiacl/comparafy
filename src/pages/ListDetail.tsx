// src/pages/ListDetail.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useData, Item } from "../context/DataContext";
import BottomNav from "../components/BottomNav";
import AddItemModal, { ListItemInput } from "../components/ui/AddItemModal";
import PageHeader from "../components/ui/PageHeader";
import { Menu } from "@headlessui/react";
import {
  EllipsisVerticalIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowLeftIcon,
  DocumentDuplicateIcon,
} from "@heroicons/react/24/outline";
import { CheckIcon } from "@heroicons/react/24/solid";

const ListDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    lists,
    fetchItems,
    addItem,
    updateItem,
    toggleItem,
    deleteItem,
    updateListNameInContext,
    deleteList,
    duplicateListInContext,
  } = useData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<Item | null>(null);
  const [newName, setNewName] = useState("");
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (id) fetchItems(id);
  }, [id, fetchItems]);

  const lista = useMemo(() => lists.find((l) => l.id === id), [lists, id]);

  useEffect(() => {
    if (!id) return;
    if (lists.length && !lista) {
      navigate("/lists", { replace: true });
    }
  }, [id, lists, lista, navigate]);

  if (!lista) return null;

  const itens = lista.itens || [];
  const comprados = itens.filter((i) => i.comprado).length;
  const totalGeral = itens.reduce((sum, i) => sum + Number(i.preco || 0) * Number(i.quantidade || 1), 0);
  const totalComprado = itens
    .filter((i) => i.comprado)
    .reduce((s, i) => s + Number(i.preco || 0) * Number(i.quantidade || 1), 0);

  const handleRename = () => {
    const trimmed = newName.trim();
    if (trimmed) {
      updateListNameInContext(lista.id, trimmed);
      setEditing(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setItemToEdit(null);
  };

  const handleSaveItem = async (listId: string, data: ListItemInput) => {
    if (itemToEdit?.id) {
      await updateItem(listId, itemToEdit.id, data as any);
    } else {
      await addItem(listId, data as any);
    }
  };

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
                setEditing(true);
                setNewName(lista.nome || "");
              }}
              className={`flex w-full items-center gap-2 px-4 py-2 text-left ${active ? "bg-gray-100" : ""}`}
            >
              <PencilSquareIcon className="h-5 w-5 text-gray-700" />
              Renomear
            </button>
          )}
        </Menu.Item>
        <Menu.Item>
          {({ active }) => (
            <button
              onClick={() => duplicateListInContext(lista.id)}
              className={`flex w-full items-center gap-2 px-4 py-2 text-left ${active ? "bg-gray-100" : ""}`}
            >
              <DocumentDuplicateIcon className="h-5 w-5 text-gray-700" />
              Duplicar
            </button>
          )}
        </Menu.Item>
        <div className="h-px bg-gray-100" />
        <Menu.Item>
          {({ active }) => (
            <button
              onClick={async () => {
                await deleteList(lista.id);
                navigate("/lists");
              }}
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
    <div className="max-w-xl mx-auto bg-white p-4 pb-28">
      <PageHeader
        title={lista.nome || "Minha lista"}
        subtitle={`${comprados}/${itens.length} itens`}
        leftSlot={
          <button onClick={() => navigate(-1)} className="p-1" aria-label="Voltar">
            <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
          </button>
        }
        rightSlot={headerRight}
      />

      {/* Edição de nome, abaixo do cabeçalho */}
      {editing && (
        <div className="mb-3 flex items-center gap-2">
          <input
            className="w-full rounded border px-2 py-1"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <button className="text-sm font-semibold text-yellow-600" onClick={handleRename}>
            Salvar
          </button>
          <button className="text-sm text-gray-600" onClick={() => setEditing(false)}>
            Cancelar
          </button>
        </div>
      )}

      {/* Progresso */}
      <div className="mb-4">
        <div className="h-2 w-full rounded bg-gray-200">
          <div
            className="h-2 rounded bg-yellow-400"
            style={{ width: `${Math.min(100, (comprados / Math.max(1, itens.length)) * 100)}%` }}
          />
        </div>
        <div className="mt-1 flex items-center justify-between text-sm text-gray-600">
          <span>Comprados: {comprados}</span>
          <span>Total: R$ {totalGeral.toFixed(2)}</span>
        </div>
      </div>

      {/* Botão adicionar */}
      <button
        onClick={() => {
          setItemToEdit(null);
          setIsModalOpen(true);
        }}
        className="w-full flex items-center justify-center bg-yellow-500 text-black py-3 rounded-xl shadow mb-6 gap-2"
      >
        <span className="text-2xl leading-none">+</span> Adicionar item
      </button>

      {/* Lista de itens */}
      <ul className="space-y-4">
        {itens.map((item) => {
          const totalItem = Number(item.preco || 0) * Number(item.quantidade || 1);
          return (
            <li key={item.id} className="bg-white p-4 rounded-xl shadow flex justify-between items-center">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleItem(lista.id, item.id)}
                  className={`h-6 w-6 flex items-center justify-center rounded-full border-2 transition-colors ${
                    item.comprado ? "bg-yellow-500 border-yellow-500" : "border-gray-300"
                  }`}
                >
                  {item.comprado && <CheckIcon className="h-4 w-4 text-black" />}
                </button>
                <div>
                  <h2
                    className={`text-lg font-semibold ${
                      item.comprado ? "line-through text-gray-400" : "text-gray-900"
                    }`}
                  >
                    {item.nome}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {item.quantidade}x
                    {item.peso ? ` • ${item.peso} ${item.unidade}` : ` • ${item.unidade}`}
                    {(item as any).mercado ? ` • ${(item as any).mercado}` : ""}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <p className="text-lg font-semibold text-gray-800">R$ {totalItem.toFixed(2)}</p>
                <p className="text-sm text-gray-600">UN. R$ {Number(item.preco || 0).toFixed(2)}</p>
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setItemToEdit(item);
                      setIsModalOpen(true);
                    }}
                    className="flex items-center gap-1 text-gray-700"
                  >
                    <PencilSquareIcon className="w-4 h-4" /> Editar
                  </button>
                  <button
                    onClick={() => deleteItem(lista.id, item.id)}
                    className="flex items-center gap-1 text-red-600"
                  >
                    <TrashIcon className="w-4 h-4" /> Excluir
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <AddItemModal
        isOpen={isModalOpen}
        onClose={closeModal}
        listId={lista.id}
        itemToEdit={itemToEdit || undefined}
        onSave={handleSaveItem}
        keepOpen={!itemToEdit}
      />

      <BottomNav activeTab="lists" />
    </div>
  );
};

export default ListDetail;
