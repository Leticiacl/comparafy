// src/components/ui/AddItemModal.tsx
import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  listId: string;
}

const AddItemModal: React.FC<AddItemModalProps> = ({ isOpen, onClose, listId }) => {
  const { addItem, getSuggestions, saveSuggestions } = useData();

  const [nome, setNome] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const [unidade, setUnidade] = useState('un');
  const [preco, setPreco] = useState('');
  const [mercado, setMercado] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [sugestoesProduto, setSugestoesProduto] = useState<string[]>([]);
  const [sugestoesMercado, setSugestoesMercado] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      getSuggestions().then((res: any) => {
        setSugestoesProduto(res.products || []);
        setSugestoesMercado(res.markets || []);
      });
    }
  }, [isOpen]);

  const handleAdd = async () => {
    if (!nome.trim() || !mercado.trim()) return;

    await addItem(listId, {
      nome,
      quantidade,
      unidade,
      preco: parseFloat(preco || '0'),
      mercado,
      observacoes,
      comprado: false,
      id: Date.now().toString(),
    });

    await saveSuggestions(nome.trim(), mercado.trim());

    setNome('');
    setQuantidade(1);
    setUnidade('un');
    setPreco('');
    setMercado('');
    setObservacoes('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
        <h2 className="text-lg font-semibold mb-4">Adicionar Item</h2>

        <input
          type="text"
          placeholder="Nome do produto *"
          className="w-full border rounded-lg px-3 py-2 mb-3"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          list="produtos"
        />
        <datalist id="produtos">
          {sugestoesProduto.map((p, i) => (
            <option key={i} value={p} />
          ))}
        </datalist>

        <div className="flex gap-2 mb-3">
          <input
            type="number"
            placeholder="Qtd"
            min={1}
            className="w-1/2 border rounded-lg px-3 py-2"
            value={quantidade}
            onChange={(e) => setQuantidade(parseInt(e.target.value))}
          />
          <select
            className="w-1/2 border rounded-lg px-3 py-2"
            value={unidade}
            onChange={(e) => setUnidade(e.target.value)}
          >
            <option value="un">un</option>
            <option value="kg">kg</option>
            <option value="g">g</option>
            <option value="dúzia">dúzia</option>
          </select>
        </div>

        <input
          type="number"
          placeholder="Preço"
          className="w-full border rounded-lg px-3 py-2 mb-3"
          value={preco}
          onChange={(e) => setPreco(e.target.value)}
        />

        <input
          type="text"
          placeholder="Mercado *"
          className="w-full border rounded-lg px-3 py-2 mb-3"
          value={mercado}
          onChange={(e) => setMercado(e.target.value)}
          list="mercados"
        />
        <datalist id="mercados">
          {sugestoesMercado.map((m, i) => (
            <option key={i} value={m} />
          ))}
        </datalist>

        <textarea
          placeholder="Observações"
          className="w-full border rounded-lg px-3 py-2 mb-4"
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-lg"
          >
            Cancelar
          </button>
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-yellow-500 text-black font-semibold rounded-lg"
          >
            Adicionar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddItemModal;
