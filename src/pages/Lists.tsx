import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useData } from '../context/DataContext'
import { NewListModal } from '../components/ui/NewListModal'
import BottomNav from '../components/BottomNav'

const Lists = () => {
  const { lists } = useData()
  const [showModal, setShowModal] = useState(false)
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white pb-24 px-4 pt-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold text-gray-900">Minhas Listas</h1>
        <img src="/LOGO_REDUZIDA.png" alt="Logo" className="w-10 h-10" />
      </div>

      <div className="space-y-4 mb-6">
        {lists.length === 0 ? (
          <p className="text-center text-gray-400">Nenhuma lista criada ainda.</p>
        ) : (
          lists.map((list) => {
            const totalItems = list.items.length
            const checkedItems = list.items.filter((item) => item.checked).length
            const totalValue = list.items.reduce((sum, item) => sum + item.price, 0)
            const progress = totalItems > 0 ? (checkedItems / totalItems) * 100 : 0

            return (
              <div
                key={list.id}
                className="bg-white border rounded-xl p-4 shadow"
                onClick={() => navigate(`/listas/${list.id}`)}
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-gray-900 text-sm">{list.name}</h3>
                  <p className="text-xs text-gray-500">
                    {checkedItems}/{totalItems} itens
                  </p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                  <div
                    className="bg-yellow-400 h-2.5 rounded-full"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500">Total: R$ {totalValue.toFixed(2)}</p>
              </div>
            )
          })
        )}
      </div>

      <button
        onClick={() => setShowModal(true)}
        className="w-full bg-yellow-500 text-black font-semibold py-3 rounded-xl shadow flex items-center justify-center gap-2 text-base mt-6"
      >
        + Nova lista
      </button>

      <NewListModal isOpen={showModal} onClose={() => setShowModal(false)} />

      <BottomNav activeTab="lists" />
    </div>
  )
}

export default Lists
