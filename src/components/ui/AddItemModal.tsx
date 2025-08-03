// src/components/ui/AddItemModal.tsx
import React, { useState, useEffect } from 'react'
import { useData, Item } from '../../context/DataContext'

interface Props {
  isOpen: boolean
  onClose: () => void
  listId: string
  itemToEdit: Item | null
}

const AddItemModal: React.FC<Props> = ({
  isOpen,
  onClose,
  listId,
  itemToEdit,
}) => {
  const { addItem, updateItem, getSuggestions, saveSuggestions } = useData()

  const [nome, setNome] = useState('')
  const [quantidade, setQuantidade] = useState(1)
  const [peso, setPeso] = useState('')            // string para poder aceitar decimais
  const [unidade, setUnidade] = useState('kg')    // kg primeiro
  const [preco, setPreco] = useState('')
  const [mercado, setMercado] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [prodSuggs, setProdSuggs] = useState<string[]>([])
  const [mktSuggs, setMktSuggs] = useState<string[]>([])

  // Carrega sugestões quando o modal abre
  useEffect(() => {
    if (!isOpen) return
    getSuggestions('products').then((r) => setProdSuggs(r))
    getSuggestions('markets').then((r) => setMktSuggs(r))
  }, [isOpen, getSuggestions])

  // Inicializa ou reseta campos ao abrir / trocar item
  useEffect(() => {
    if (!isOpen) return

    if (itemToEdit) {
      setNome(itemToEdit.nome)
      setQuantidade(itemToEdit.quantidade)
      // só chama toString se não for nulo/undefined
      setPeso(itemToEdit.peso != null ? itemToEdit.peso.toString() : '')
      setUnidade(itemToEdit.unidade)
      setPreco(itemToEdit.preco != null ? itemToEdit.preco.toString() : '')
      setMercado(itemToEdit.mercado)
      setObservacoes(itemToEdit.observacoes || '')
    } else {
      // reset
      setNome('')
      setQuantidade(1)
      setPeso('')
      setUnidade('kg')
      setPreco('')
      setMercado('')
      setObservacoes('')
    }
  }, [isOpen, itemToEdit])

  const handleSave = async () => {
    if (!nome.trim() || !mercado.trim()) return

    const data = {
      nome: nome.trim(),
      quantidade,
      peso: parseFloat(peso) || 0,
      unidade,
      preco: parseFloat(preco) || 0,
      mercado: mercado.trim(),
      observacoes: observacoes.trim(),
    }

    if (itemToEdit) {
      await updateItem(listId, itemToEdit.id, data)
    } else {
      await addItem(listId, data)
      await saveSuggestions('products', data.nome)
      await saveSuggestions('markets', data.mercado)
    }

    onClose()
  }

  if (!isOpen) return null
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
        <h2 className="text-lg font-semibold mb-4">
          {itemToEdit ? 'Editar Item' : 'Adicionar Item'}
        </h2>

        {/* Nome do produto */}
        <label className="block text-sm font-medium mb-1">
          Nome do produto *
        </label>
        <input
          type="text"
          list="prod-list"
          placeholder="Digite o nome"
          className="w-full border rounded-lg px-3 py-2 mb-3"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
        <datalist id="prod-list">
          {prodSuggs.map((p, i) => (
            <option key={i} value={p} />
          ))}
        </datalist>

        {/* Quantidade de itens */}
        <label className="block text-sm font-medium mb-1">
          Quantidade de itens *
        </label>
        <input
          type="number"
          min={1}
          placeholder="Ex.: 5"
          className="w-full border rounded-lg px-3 py-2 mb-3"
          value={quantidade}
          onChange={(e) => setQuantidade(Math.max(1, +e.target.value))}
        />

        {/* Peso e Unidade */}
        <label className="block text-sm font-medium mb-1">Peso do item</label>
        <div className="flex gap-2 mb-3">
          <input
            type="number"
            min={0}
            step="any"
            placeholder="Ex.: 1.5"
            className="w-2/3 border rounded-lg px-3 py-2"
            value={peso}
            onChange={(e) => setPeso(e.target.value)}
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

        {/* Preço unitário */}
        <label className="block text-sm font-medium mb-1">Preço</label>
        <input
          type="number"
          placeholder="R$ 0,00"
          className="w-full border rounded-lg px-3 py-2 mb-3"
          value={preco}
          onChange={(e) => setPreco(e.target.value)}
        />

        {/* Mercado */}
        <label className="block text-sm font-medium mb-1">Mercado *</label>
        <input
          type="text"
          list="mkt-list"
          placeholder="Onde comprou?"
          className="w-full border rounded-lg px-3 py-2 mb-3"
          value={mercado}
          onChange={(e) => setMercado(e.target.value)}
        />
        <datalist id="mkt-list">
          {mktSuggs.map((m, i) => (
            <option key={i} value={m} />
          ))}
        </datalist>

        {/* Observações */}
        <label className="block text-sm font-medium mb-1">Observações</label>
        <textarea
          placeholder="Alguma observação?"
          className="w-full border rounded-lg px-3 py-2 mb-4"
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
        />

        {/* Botões */}
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
  )
}

export default AddItemModal
