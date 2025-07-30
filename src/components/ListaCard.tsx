// src/components/ListaCard.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  EllipsisVerticalIcon,
  PencilSquareIcon,
  DocumentDuplicateIcon,
  CheckCircleIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { useData } from '../context/DataContext';
import ConfirmDeleteModal from './ui/ConfirmDeleteModal';

interface ListaCardProps {
  id: string;
  nome: string;
  total: number;
  itens: number;
  comprados: number;
}

const ListaCard: React.FC<ListaCardProps> = ({ id, nome, total, itens, comprados }) => {
  const navigate = useNavigate();
  const {
    deleteList,
    updateListNameInContext,
    duplicateListInContext,
    markAllInList,
  } = useData();

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

  return (
    <div
      className="relative bg-white p-4 rounded-xl shadow cursor-pointer mb-4"
      onClick={() => navigate(`/lists/${id}`)}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="w-full">
          {editingName ? (
            <div className="flex gap-2">
              <input
                className="border px-2 py-1 rounded w-full"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
              <button
                className="text-sm text-yellow-600 font-semibold"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRename();
                }}
              >
                Salvar
              </button>
            </div>
          ) : (
            <h2 className="text-lg font-semibold text-gray-900">{nome || 'Sem nome'}</h2>
          )}
          <p className="text-sm text-gray-500">
            {comprados}/{itens} itens
          </p>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowOptions(!showOptions);
          }}
        >
          <EllipsisVerticalIcon className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      <div className="w-full h-2 bg-gray-200 rounded">
        <div
          className="h-2 bg-yellow-400 rounded"
          style={{ width: `${(comprados / (itens || 1)) * 100}%` }}
        />
      </div>

      <p className="text-sm text-gray-600 mt-2">Total: R$ {total.toFixed(2)}</p>

      {showOptions && (
        <div
          className="absolute right-4 top-12 bg-white border rounded shadow px-4 py-2 z-10 space-y-2"
          onClick={(e) => e.stopPropagation()}
        >
          <button onClick={() => setEditingName(true)} className="flex items-center gap-2 text-sm text-gray-700">
            <PencilSquareIcon className="w-4 h-4" /> Renomear
          </button>
          <button onClick={() => { duplicateListInContext(id); setShowOptions(false); }} className="flex items-center gap-2 text-sm text-gray-700">
            <DocumentDuplicateIcon className="w-4 h-4" /> Duplicar
          </button>
          <button onClick={() => { markAllInList(id); setShowOptions(false); }} className="flex items-center gap-2 text-sm text-gray-700">
            <CheckCircleIcon className="w-4 h-4" /> Marcar todos
          </button>
          <button onClick={() => { setShowConfirm(true); setShowOptions(false); }} className="flex items-center gap-2 text-sm text-red-600">
            <TrashIcon className="w-4 h-4" /> Excluir
          </button>
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={() => deleteList(id)}
      />
    </div>
  );
};

export default ListaCard;
