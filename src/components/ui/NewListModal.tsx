import React, { useState } from 'react';
import { useData } from '../../context/DataContext';

interface NewListModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NewListModal: React.FC<NewListModalProps> = ({ isOpen, onClose }) => {
  const { createList } = useData();
  const [name, setName] = useState('');

  const handleCreate = () => {
    if (name.trim()) {
      createList(name);
      setName('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-lg p-6 w-11/12 max-w-md shadow-lg">
        <h2 className="text-lg font-semibold mb-4 text-center">Nova Lista</h2>
        <input
          type="text"
          placeholder="Nome da lista"
          className="w-full p-3 border rounded-lg mb-4"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div className="flex justify-end gap-3">
          <button
            className="px-4 py-2 rounded-md bg-gray-300 text-black hover:bg-gray-400"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            className="px-4 py-2 rounded-md bg-yellow-500 text-black font-semibold hover:bg-yellow-600"
            onClick={handleCreate}
          >
            Criar
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewListModal;
