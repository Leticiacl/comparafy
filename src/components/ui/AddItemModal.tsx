import React, { useState, useEffect } from 'react';
import { useData, Item } from '../../context/DataContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  listId: string;
  itemToEdit?: Item | null;
}

const AddItemModal: React.FC<Props> = ({
  isOpen,
  onClose,
  listId,
  itemToEdit = null,
}) => {
  const { addItem, updateItem, getSuggestions, saveSuggestions } = useData();

  const [nome, setNome] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const [unidade, setUnidade] = useState('un');
  const [preco, setPreco] = useState('');
  const [mercado, setMercado] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [prodSuggs, setProdSuggs] = useState<string[]>([]);
  const [mktSuggs, setMktSuggs] = useState<string[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    getSuggestions('products').then(r => setProdSuggs(r));
    getSuggestions('markets').then(r => setMktSuggs(r));

    if (itemToEdit) {
      setNome(itemToEdit.nome);
      setQuantidade(itemToEdit.quantidade);
      setUnidade(itemToEdit.unidade);
      setPreco(itemToEdit.preco.toString());
      setMercado(itemToEdit.mercado);
      setObservacoes(itemToEdit.observacoes ?? '');
    } else {
      setNome('');
      setQuantidade(1);
      setUnidade('un');
      setPreco('');
      setMercado('');
      setObservacoes('');
    }
  }, [isOpen, itemToEdit]);

  const handleSave = async () => {
    console.log('🔔 handleSave disparou', {
      itemToEdit,
      nome,
      quantidade,
      unidade,
      preco,
      mercado,
      observacoes,
    });

    if (!itemToEdit && (!nome.trim() || !mercado.trim())) {
      console.warn('⚠️ Criação bloqueada: faltou nome ou mercado');
      return;
    }

    const data = {
      nome: nome.trim(),
      quantidade,
      unidade,
      preco: parseFloat(preco || '0'),
      mercado: mercado.trim(),
      observacoes: observacoes.trim(),
    };

    if (itemToEdit) {
      await updateItem(listId, itemToEdit.id, data);
    } else {
      await addItem(listId, data);
      await saveSuggestions('products', data.nome);
      await saveSuggestions('markets', data.mercado);
    }

    onClose();
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
        <h2 className="text-lg font-semibold mb-4">
          {itemToEdit ? 'Editar Item' : 'Adicionar Item'}
        </h2>

        {/* campos... */}
        <input
          type="text"
          list="prod-list"
          placeholder="Nome do produto *"
          className="w-full border rounded-lg px-3 py-2 mb-3"
          value={nome}
          onChange={e => setNome(e.target.value)}
        />
        <datalist id="prod-list">
          {prodSuggs.map((p, i) => (
            <option key={i} value={p} />
          ))}
        </datalist>

        <div className="flex gap-2 mb-3">
          <input
            type="number"
            min={1}
            className="w-1/2 border rounded-lg px-3 py-2"
            value={quantidade}
            onChange={e => setQuantidade(+e.target.value)}
          />
          <select
            className="w-1/2 border rounded-lg px-3 py-2"
            value={unidade}
            onChange={e => setUnidade(e.target.value)}
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
          onChange={e => setPreco(e.target.value)}
        />

        <input
          type="text"
          list="mkt-list"
          placeholder="Mercado *"
          className="w-full border rounded-lg px-3 py-2 mb-3"
          value={mercado}
          onChange={e => setMercado(e.target.value)}
        />
        <datalist id="mkt-list">
          {mktSuggs.map((m, i) => (
            <option key={i} value={m} />
          ))}
        </datalist>

        <textarea
          placeholder="Observações"
          className="w-full border rounded-lg px-3 py-2 mb-4"
          value={observacoes}
          onChange={e => setObservacoes(e.target.value)}
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600"
          >
            {itemToEdit ? 'Salvar' : 'Adicionar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddItemModal;
