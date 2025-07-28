import React, { useState } from 'react';
import { useData } from '../../context/DataContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const NewListModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { createList } = useData();
  const [name, setName] = useState('');

  const handleCreate = async () => {
    if (name.trim()) {
      await createList(name.trim());
      setName('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Criar nova lista</h2>
        <input
          type="text"
          placeholder="Nome da lista"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full mb-4 px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:border-yellow-400"
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancelar
          </button>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-yellow-500 text-black font-semibold rounded-lg"
          >
            Criar
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewListModal;
