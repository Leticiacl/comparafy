import React, { useState } from 'react';
import { useData } from '../../context/DataContext';

interface NewListModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NewListModal: React.FC<NewListModalProps> = ({ isOpen, onClose }) => {
  const { createNewList } = useData();
  const [listName, setListName] = useState('');

  const handleCreate = async () => {
    if (listName.trim() !== '') {
      await createNewList(listName.trim());
      setListName('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-80 shadow-lg">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Nova Lista</h2>
        <input
          type="text"
          placeholder="Nome da lista"
          value={listName}
          onChange={(e) => setListName(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-lg text-gray-700 hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-yellow-400 rounded-lg text-black font-semibold hover:bg-yellow-500"
          >
            Criar
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewListModal;
