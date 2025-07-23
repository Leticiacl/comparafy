import React, { useState } from 'react'
import { ArrowUpRightIcon } from '@heroicons/react/24/solid'
import { useNavigate } from 'react-router-dom'
import { useData } from '../context/DataContext'
import { NewListModal } from '../components/ui/NewListModal'
import BottomNav from '../components/BottomNav'

const Dashboard = () => {
  const { lists } = useData()
  const [showModal, setShowModal] = useState(false)
  const navigate = useNavigate()

  const totalSavings = lists.reduce((acc, list) => {
    const listTotal = list.items.reduce((sum: number, item: any) => {
      return item.checked ? sum + item.price : sum
    }, 0)
    return acc + listTotal
  }, 0)

  return (
    <div className="min-h-screen bg-white pb-24 px-4 pt-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Olá!</h1>
          <p className="text-gray-500">Bem-vindo ao Comparify</p>
        </div>
        <img src="/LOGO_REDUZIDA.png" alt="Logo" className="w-10 h-10" />
      </div>

      <div className="bg-white p-4 rounded-xl shadow mb-6 border">
        <div className="flex items-center gap-3">
          <div className="bg-yellow-100 p-2 rounded-full">
            <ArrowUpRightIcon className="w-5 h-5 text-yellow-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Economia total</p>
            <p className="text-lg font-bold text-gray-900">
              R$ {totalSavings.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {lists.length > 0 && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-md font-semibold text-gray-800">Listas recentes</h2>
            <button
              className="text-sm text-yellow-500 font-medium"
              onClick={() => navigate('/listas')}
            >
              Ver todas
            </button>
          </div>
          <div className="space-y-3">
            {lists.map((list) => {
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
            })}
          </div>
        </div>
      )}

      <button
        onClick={() => setShowModal(true)}
        className="w-full bg-yellow-500 text-black font-semibold py-3 rounded-xl shadow flex items-center justify-center gap-2 text-base mt-6"
      >
        + Nova lista
      </button>

      {lists.length === 0 && (
        <p className="text-center text-gray-400 mt-4">Nenhuma lista ainda. Crie sua primeira!</p>
      )}

      <NewListModal isOpen={showModal} onClose={() => setShowModal(false)} />

      <BottomNav activeTab="home" />
    </div>
  )
}

export default Dashboard
