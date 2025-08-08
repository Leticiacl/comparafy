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
  const {
    addItem,
    updateItem,      // now backed by setDoc(..., merge:true)
    getSuggestions,
    saveSuggestions,
  } = useData()

  const [nome, setNome] = useState('')
  const [quantidade, setQuantidade] = useState(1)
  const [peso, setPeso] = useState('')
  const [unidade, setUnidade] = useState('kg')
  const [preco, setPreco] = useState('')
  const [mercado, setMercado] = useState('')
  const [observacoes, setObservacoes] = useState('')

  const [prodSuggs, setProdSuggs] = useState<string[]>([])
  const [mktSuggs, setMktSuggs] = useState<string[]>([])

  // Load suggestions on open
  useEffect(() => {
    if (!isOpen) return
    getSuggestions('products').then(setProdSuggs)
    getSuggestions('markets').then(setMktSuggs)
  }, [isOpen, getSuggestions])

  // Initialize or reset fields
  useEffect(() => {
    if (!isOpen) return

    if (itemToEdit) {
      setNome(itemToEdit.nome)
      setQuantidade(itemToEdit.quantidade)
      setPeso(itemToEdit.peso?.toString() ?? '')
      setUnidade(itemToEdit.unidade)
      setPreco(itemToEdit.preco?.toString() ?? '')
      setMercado(itemToEdit.mercado)
      setObservacoes(itemToEdit.observacoes || '')
    } else {
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
      // EDIT
      await updateItem(listId, itemToEdit.id, data)
    } else {
      // CREATE
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

        {/* Nome */}
        <label className="block text-sm font-medium mb-1">Nome *</label>
        <input
          type="text"
          list="prod-list"
          className="w-full border rounded-lg px-3 py-2 mb-3"
          value={nome}
          onChange={e => setNome(e.target.value)}
        />
        <datalist id="prod-list">
          {prodSuggs.map((p, i) => <option key={i} value={p} />)}
        </datalist>

        {/* Quantidade */}
        <label className="block text-sm font-medium mb-1">
          Quantidade *
        </label>
        <input
          type="number"
          min={1}
          className="w-full border rounded-lg px-3 py-2 mb-3"
          value={quantidade}
          onChange={e => setQuantidade(Math.max(1, +e.target.value))}
        />

        {/* Peso & Unidade */}
        <label className="block text-sm font-medium mb-1">Peso</label>
        <div className="flex gap-2 mb-3">
          <input
            type="number"
            step="any"
            className="w-2/3 border rounded-lg px-3 py-2"
            value={peso}
            onChange={e => setPeso(e.target.value)}
          />
          <select
            className="w-1/3 border rounded-lg px-3 py-2"
            value={unidade}
            onChange={e => setUnidade(e.target.value)}
          >
            <option value="kg">kg</option>
            <option value="g">g</option>
            <option value="l">l</option>
            <option value="ml">ml</option>
            <option value="dúzia">dúzia</option>
            <option value="un">un</option>
          </select>
        </div>

        {/* Preço */}
        <label className="block text-sm font-medium mb-1">Preço</label>
        <input
          type="number"
          className="w-full border rounded-lg px-3 py-2 mb-3"
          value={preco}
          onChange={e => setPreco(e.target.value)}
        />

        {/* Mercado */}
        <label className="block text-sm font-medium mb-1">Mercado *</label>
        <input
          type="text"
          list="mkt-list"
          className="w-full border rounded-lg px-3 py-2 mb-3"
          value={mercado}
          onChange={e => setMercado(e.target.value)}
        />
        <datalist id="mkt-list">
          {mktSuggs.map((m, i) => <option key={i} value={m} />)}
        </datalist>

        {/* Observações */}
        <label className="block text-sm font-medium mb-1">Observações</label>
        <textarea
          className="w-full border rounded-lg px-3 py-2 mb-4"
          value={observacoes}
          onChange={e => setObservacoes(e.target.value)}
        />

        {/* Buttons */}
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
