import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  EllipsisVerticalIcon,
  PencilSquareIcon,
  DocumentDuplicateIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { useData } from "../context/DataContext";
import ConfirmDialog from "./ui/ConfirmDialog";

interface ListaCardProps {
  id: string;
  nome: string;
  total: number;
  itens: number;
  comprados: number;
}

const ListaCard: React.FC<ListaCardProps> = ({
  id,
  nome,
  total,
  itens,
  comprados,
}) => {
  const navigate = useNavigate();
  const { deleteList, updateListNameInContext, duplicateListInContext } =
    useData();

  const [showOptions, setShowOptions] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(nome);

  const handleRename = () => {
    if (newName.trim() && newName !== nome) {
      updateListNameInContext(id, newName.trim());
    }
    setEditingName(false);
    setShowOptions(false);
  };

  const progress = itens > 0 ? Math.min(100, (comprados / itens) * 100) : 0;

  return (
    <div
      className="relative mb-4 cursor-pointer rounded-xl bg-white p-4 shadow"
      onClick={() => {
        if (showOptions || showConfirm) return; // evita navegação acidental
        navigate(`/lists/${id}`);
      }}
    >
      <div className="mb-2 flex items-start justify-between">
        <div className="w-full">
          {editingName ? (
            <div className="flex gap-2">
              <input
                className="w-full rounded border px-2 py-1"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
              <button
                className="text-sm font-semibold text-yellow-600"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRename();
                }}
              >
                Salvar
              </button>
            </div>
          ) : (
            <h2 className="text-lg font-semibold text-gray-900">
              {nome || "Sem nome"}
            </h2>
          )}
          <p className="text-sm text-gray-500">
            {comprados}/{itens} itens
          </p>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowOptions((v) => !v);
          }}
        >
          <EllipsisVerticalIcon className="h-5 w-5 text-gray-400" />
        </button>
      </div>

      <div className="h-2 w-full rounded bg-gray-200">
        <div
          className="h-2 rounded bg-yellow-400"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="mt-2 text-sm text-gray-600">
        Total: R$ {total.toFixed(2)}
      </p>

      {showOptions && (
        <div
          className="absolute right-4 top-12 z-10 space-y-2 rounded border bg-white px-4 py-2 shadow"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => setEditingName(true)}
            className="flex items-center gap-2 text-sm text-gray-700"
          >
            <PencilSquareIcon className="h-4 w-4" /> Renomear
          </button>

          <button
            onClick={async () => {
              await duplicateListInContext(id);
              setShowOptions(false);
            }}
            className="flex items-center gap-2 text-sm text-gray-700"
          >
            <DocumentDuplicateIcon className="h-4 w-4" /> Duplicar
          </button>

          <button
            onClick={() => {
              setShowConfirm(true);
              setShowOptions(false);
            }}
            className="flex items-center gap-2 text-sm text-gray-700"
          >
            <TrashIcon className="h-4 w-4" /> Excluir
          </button>
        </div>
      )}

      {/* Modal de confirmação — fundo desfocado + botão amarelo */}
      <ConfirmDialog
        open={showConfirm}
        title="Deseja excluir esta lista?"
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={async () => {
          await deleteList(id);
          setShowConfirm(false);
          navigate("/lists", { replace: true });
        }}
        onClose={() => setShowConfirm(false)}
      />
    </div>
  );
};

export default ListaCard;
