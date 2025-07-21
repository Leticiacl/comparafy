import React from 'react'
import { useData } from '../context/DataContext'
import { useNavigate } from 'react-router-dom'
import BottomNav from '../components/BottomNav'

const Dashboard: React.FC = () => {
  const { lists, createNewList } = useData()
  const navigate = useNavigate()

  const handleCreateList = async () => {
    const name = prompt('Nome da nova lista:')
    if (!name) return
    await createNewList(name)
  }

  const totalSavings = lists.reduce((sum, list) => {
    const listTotal = list.items.reduce((acc, item) => acc + (item.originalPrice - item.discountedPrice || 0), 0)
    return sum + listTotal
  }, 0)

  return (
    <div className="min-h-screen pb-24 px-4 pt-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Olá!</h1>
          <p className="text-gray-500">Bem-vindo ao Comparify</p>
        </div>
        <img src="/LOGO_REDUZIDA.png" alt="Logo" className="w-10 h-10" />
      </div>

      <div className="bg-yellow-100 rounded-xl p-4 shadow mb-6 flex justify-between items-center">
        <div>
          <p className="text-gray-600">Economia total</p>
          <p className="text-xl font-bold text-yellow-700">R$ {totalSavings.toFixed(2)}</p>
        </div>
        <span className="text-yellow-700 text-2xl">↗</span>
      </div>

      <button
        onClick={handleCreateList}
        className="w-full bg-yellow-500 text-black font-semibold py-3 rounded-xl shadow mb-4"
      >
        + Nova lista
      </button>

      {lists.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-2">Listas recentes</h2>
          <ul className="space-y-2">
            {lists.map((list) => (
              <li
                key={list.id}
                onClick={() => navigate(`/list/${list.id}`)}
                className="bg-white rounded-xl p-4 shadow cursor-pointer"
              >
                <p className="font-medium">{list.name}</p>
                <div className="h-2 bg-yellow-100 rounded-full mt-2">
                  <div className="h-2 bg-yellow-400 rounded-full" style={{ width: '50%' }}></div>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {list.items.length} itens • Total: R$ {list.items.reduce((sum, item) => sum + item.discountedPrice, 0).toFixed(2)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      <BottomNav activeTab="home" />
    </div>
  )
}

export default Dashboard
