import React, { useState } from "react";
import { useData } from "../../context/DataContext";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const NewListModalComp: React.FC<Props> = ({ isOpen, onClose }) => {
  const { createList } = useData();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const canCreate = name.trim().length > 0 && !loading;

  if (!isOpen) return null;

  const handleCreate = async () => {
    if (!canCreate) return;
    try {
      setLoading(true);
      const created = await createList(name.trim());
      if (!created) {
        alert("Você precisa estar logado para criar listas.");
        return;
      }
      setName("");
      onClose();
    } catch (e) {
      console.error(e);
      alert("Não foi possível criar a lista.");
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") handleCreate();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
        <h2 className="text-2xl font-bold mb-4">Nova Lista</h2>

        <label className="block text-sm font-medium mb-1">Nome da lista</label>
        <input
          className="w-full border rounded-lg px-3 py-2 mb-5"
          placeholder="Ex.: Mensal"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={onKeyDown}
          autoFocus
        />

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg">
            Cancelar
          </button>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-yellow-500 rounded-lg text-black disabled:opacity-60"
            disabled={!canCreate}
          >
            {loading ? "Criando..." : "Criar"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Exporta dos dois jeitos p/ evitar mismatch de import
export const NewListModal = NewListModalComp;
export default NewListModalComp;
