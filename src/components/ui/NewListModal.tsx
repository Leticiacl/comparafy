import React, { useState } from 'react'
import { useData } from '../../context/DataContext'

interface NewListModalProps {
  isOpen: boolean
  onClose: () => void
}

export const NewListModal: React.FC<NewListModalProps> = ({ isOpen, onClose }) => {
  const { createNewList } = useData()
  const [listName, setListName] = useState('')

  const handleCreate = async () => {
    if (listName.trim() !== '') {
      await createNewList(listName)
      setListName('')
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl p-6 w-11/12 max-w-md shadow-xl">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Criar nova lista</h2>
        <input
          type="text"
          value={listName}
          onChange={(e) => setListName(e.target.value)}
          placeholder="Nome da lista"
          className="w-full border border-gray-300 rounded-md px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-yellow-500"
        />
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            Cancelar
          </button>
          <button
            onClick={handleCreate}
            className="px-4 py-2 rounded-md bg-yellow-500 text-black font-semibold hover:bg-yellow-400"
          >
            Criar
          </button>
        </div>
      </div>
    </div>
  )
}
