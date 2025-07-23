// src/components/ui/NewListModal.tsx

import React, { useState } from 'react';

interface NewListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
}

export const NewListModal: React.FC<NewListModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [listName, setListName] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-md w-11/12 max-w-md">
        <h2 className="text-lg font-semibold mb-4">Criar nova lista</h2>
        <input
          type="text"
          placeholder="Nome da lista"
          value={listName}
          onChange={(e) => setListName(e.target.value)}
          className="w-full border rounded-lg p-2 mb-4"
        />
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:underline"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              onCreate(listName.trim() || 'Nova lista');
              setListName('');
            }}
            className="bg-yellow-400 text-black font-semibold px-4 py-2 rounded-lg"
          >
            Criar
          </button>
        </div>
      </div>
    </div>
  );
};
