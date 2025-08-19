import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useData, Item } from "../context/DataContext";
import BottomNav from "../components/BottomNav";
import AddItemModal from "../components/ui/AddItemModal";
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

  if (!lista) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-500">Lista não encontrada.</p>
        <BottomNav activeTab="lists" />
      </div>
    );
  }

  const itens = lista.itens || [];
  const comprados = itens.filter((i) => i.comprado).length;
  const totalGeral = itens.reduce(
    (sum, i) => sum + Number(i.preco || 0) * Number(i.quantidade || 1),
    0
  );
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

  return (
    <div className="p-4 pb-32 max-w-xl mx-auto bg-white">
      {/* Cabeçalho */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start flex-1">
          <button onClick={() => navigate(-1)} className="p-1 mr-2" aria-label="Voltar">
            <ArrowLeftIcon className="w-6 h-6 text-gray-600" />
          </button>

          <div className="flex-1">
            {editing ? (
              <div className="flex gap-2">
                <input
                  autoFocus
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="border rounded-lg px-3 py-1 w-full"
                />
                <button onClick={handleRename} className="bg-yellow-500 px-3 rounded-lg text-black">
                  Salvar
                </button>
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-bold">{lista.nome}</h1>
                {/* Removido subtítulo de mercado/data para manter Listas como antes */}
              </>
            )}
          </div>
        </div>

        <Menu as="div" className="relative ml-2">
          <Menu.Button className="p-1">
            <EllipsisVerticalIcon className="h-6 w-6 text-gray-600" />
          </Menu.Button>
          <Menu.Items className="absolute right-0 mt-2 w-56 bg-white shadow-lg rounded-md z-10 overflow-hidden ring-1 ring-black/5">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => {
                    setNewName(lista.nome);
                    setEditing(true);
                  }}
                  className={`flex w-full items-center gap-2 px-4 py-2 text-left ${
                    active ? "bg-gray-100" : ""
                  }`}
                >
                  <PencilSquareIcon className="w-5 h-5 text-gray-600" />
                  Renomear
                </button>
              )}
            </Menu.Item>

            {/* Duplicar */}
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={async () => {
                    await duplicateListInContext(lista.id);
                  }}
                  className={`flex w-full items-center gap-2 px-4 py-2 text-left ${
                    active ? "bg-gray-100" : ""
                  }`}
                >
                  <DocumentDuplicateIcon className="w-5 h-5 text-gray-600" />
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
                    navigate(-1);
                  }}
                  className={`flex w-full items-center gap-2 px-4 py-2 text-left text-red-600 ${
                    active ? "bg-gray-100" : ""
                  }`}
                >
                  <TrashIcon className="w-5 h-5" />
                  Excluir
                </button>
              )}
            </Menu.Item>
          </Menu.Items>
        </Menu>

        <img src="/LOGO_REDUZIDA.png" alt="Logo" className="h-8 ml-2" />
      </div>

      {/* Progresso + totais */}
      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span>
            {comprados}/{itens.length} itens
          </span>
          <span>
            R$ {totalComprado.toFixed(2)} / R$ {totalGeral.toFixed(2)}
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded">
          <div
            className="h-2 bg-yellow-400 rounded transition-all duration-300"
            style={{ width: `${(comprados / (itens.length || 1)) * 100}%` }}
          />
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
                    {item.quantidade}x • {item.peso} {item.unidade}
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

      {/* Modal adicionar/editar */}
      <AddItemModal
        isOpen={isModalOpen}
        onClose={closeModal}
        listId={lista.id}
        itemToEdit={itemToEdit}
      />

      <BottomNav activeTab="lists" />
    </div>
  );
};

export default ListDetail;
