import React, { useState } from "react";
import { useData } from "../../context/DataContext";

interface NewListModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NewListModal: React.FC<NewListModalProps> = ({ isOpen, onClose }) => {
  const { createList } = useData();
  const [listName, setListName] = useState("");

  const handleCreate = async () => {
    const trimmedName = listName.trim();
    if (!trimmedName) {
      alert("Digite um nome para a lista.");
      return;
    }

    const result = await createList(trimmedName);
    if (result) {
      setListName("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Nova Lista</h2>
        <input
          type="text"
          placeholder="Nome da lista"
          value={listName}
          onChange={(e) => setListName(e.target.value)}
          className="w-full border px-4 py-2 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            Cancelar
          </button>
          <button
            onClick={handleCreate}
            className="px-4 py-2 rounded-lg bg-yellow-500 text-black font-semibold hover:bg-yellow-600"
          >
            Criar
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewListModal;
