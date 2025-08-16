import React, { useEffect, useState } from "react";
import { useData, Item } from "../../context/DataContext";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  listId: string;
  itemToEdit: Item | null;
}

const AddItemModal: React.FC<Props> = ({ isOpen, onClose, listId, itemToEdit }) => {
  const { addItem, updateItem, getSuggestions, saveSuggestions } = useData();

  const [nome, setNome] = useState("");
  const [quantidade, setQuantidade] = useState(1);
  const [peso, setPeso] = useState<string>(""); // aceita decimais
  const [unidade, setUnidade] = useState("kg");
  const [preco, setPreco] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [prodSuggs, setProdSuggs] = useState<string[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    getSuggestions("products").then((r) => setProdSuggs(r));
  }, [isOpen, getSuggestions]);

  useEffect(() => {
    if (!isOpen) return;
    if (itemToEdit) {
      setNome(itemToEdit.nome || "");
      setQuantidade(itemToEdit.quantidade || 1);
      setPeso(itemToEdit.peso != null ? String(itemToEdit.peso) : "");
      setUnidade(itemToEdit.unidade || "kg");
      setPreco(itemToEdit.preco != null ? String(itemToEdit.preco) : "");
      setObservacoes(itemToEdit.observacoes || "");
    } else {
      setNome("");
      setQuantidade(1);
      setPeso("");
      setUnidade("kg");
      setPreco("");
      setObservacoes("");
    }
  }, [isOpen, itemToEdit]);

  const handleSave = async () => {
    if (!nome.trim()) return;

    const data = {
      nome: nome.trim(),
      quantidade,
      peso: parseFloat(peso) || 0,
      unidade,
      preco: parseFloat(preco) || 0,
      observacoes: observacoes.trim(),
    };

    if (itemToEdit) {
      await updateItem(listId, itemToEdit.id, data as any);
    } else {
      await addItem(listId, data as any);
      await saveSuggestions("products", data.nome);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
        <h2 className="text-2xl font-bold mb-4">
          {itemToEdit ? "Editar Item" : "Adicionar Item"}
        </h2>

        <label className="block text-sm font-medium mb-1">Nome *</label>
        <input
          type="text"
          list="prod-list"
          className="w-full border rounded-lg px-3 py-2 mb-3"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Ex.: Arroz"
        />
        <datalist id="prod-list">
          {prodSuggs.map((p, i) => (
            <option key={i} value={p} />
          ))}
        </datalist>

        <label className="block text-sm font-medium mb-1">Quantidade *</label>
        <input
          type="number"
          min={1}
          className="w-full border rounded-lg px-3 py-2 mb-3"
          value={quantidade}
          onChange={(e) => setQuantidade(Math.max(1, +e.target.value))}
        />

        <label className="block text-sm font-medium mb-1">Peso</label>
        <div className="flex gap-2 mb-3">
          <input
            type="number"
            min={0}
            step="any"
            className="w-2/3 border rounded-lg px-3 py-2"
            value={peso}
            onChange={(e) => setPeso(e.target.value)}
            placeholder="Ex.: 1.5"
          />
          <select
            className="w-1/3 border rounded-lg px-3 py-2"
            value={unidade}
            onChange={(e) => setUnidade(e.target.value)}
          >
            <option value="kg">kg</option>
            <option value="g">g</option>
            <option value="l">l</option>
            <option value="ml">ml</option>
            <option value="dúzia">dúzia</option>
            <option value="un">un</option>
          </select>
        </div>

        <label className="block text-sm font-medium mb-1">Preço</label>
        <input
          type="number"
          className="w-full border rounded-lg px-3 py-2 mb-3"
          value={preco}
          onChange={(e) => setPreco(e.target.value)}
          placeholder="R$ 0,00"
        />

        <label className="block text-sm font-medium mb-1">Observações</label>
        <textarea
          className="w-full border rounded-lg px-3 py-2 mb-4"
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          placeholder="Alguma observação?"
        />

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-yellow-500 text-black rounded-lg"
          >
            {itemToEdit ? "Salvar" : "Adicionar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddItemModal;
