// src/pages/Dashboard.tsx
import { useContext } from 'react'
import { DataContext } from '../DataContext'
import { useNavigate } from 'react-router-dom'
import { ArrowUpRightIcon } from '@heroicons/react/24/outline'
import BottomNav from '../components/BottomNav'

export default function Dashboard() {
  const { data, createList } = useContext(DataContext)
  const navigate = useNavigate()

  const handleNewList = async () => {
    const listName = prompt('Nome da nova lista:')
    if (!listName) return
    const id = await createList(listName)
    if (id) navigate(`/list/${id}`)
  }

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between pb-20">
      <div className="p-5">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">Olá!</h1>
            <p className="text-sm text-zinc-500">Bem-vindo ao Comparify</p>
          </div>
          <img src="/LOGO_REDUZIDA.png" alt="Logo" className="h-10 w-10" />
        </div>

        <div className="mt-6 p-4 rounded-2xl bg-white border shadow-sm flex items-center gap-4">
          <div className="bg-yellow-100 rounded-full p-2">
            <ArrowUpRightIcon className="h-6 w-6 text-yellow-500" />
          </div>
          <div>
            <p className="text-xs text-zinc-500">Economia total</p>
            <p className="text-2xl font-bold text-zinc-900">
              R$ {data.savings.reduce((acc, cur) => acc + cur.value, 0).toFixed(2)}
            </p>
          </div>
        </div>

        <div className="mt-8">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold text-zinc-900">Listas recentes</h2>
            <button className="text-yellow-500 text-sm" onClick={() => navigate('/lists')}>
              Ver todas
            </button>
          </div>

          {data.lists.map((list) => {
            const doneCount = list.items.filter((item) => item.checked).length
            const totalCount = list.items.length
            const totalPrice = list.items.reduce((acc, cur) => acc + (cur.price || 0), 0)
            const percent = totalCount ? (doneCount / totalCount) * 100 : 0

            return (
              <div
                key={list.id}
                onClick={() => navigate(`/list/${list.id}`)}
                className="p-4 bg-white border rounded-xl shadow mb-4 cursor-pointer"
              >
                <div className="flex justify-between mb-1">
                  <span className="font-medium text-zinc-900">{list.name}</span>
                  <span className="text-sm text-zinc-500">
                    {doneCount}/{totalCount} itens
                  </span>
                </div>
                <div className="w-full h-2 bg-zinc-200 rounded-full mb-1 overflow-hidden">
                  <div
                    className="h-full bg-yellow-500 rounded-full"
                    style={{ width: `${percent}%` }}
                  ></div>
                </div>
                <p className="text-sm text-zinc-500">Total: R$ {totalPrice.toFixed(2)}</p>
              </div>
            )
          })}
        </div>

        <button
          onClick={handleNewList}
          className="w-full bg-yellow-500 text-black font-semibold py-3 rounded-xl shadow flex items-center justify-center gap-2 text-base mt-4"
        >
          <span className="text-xl">+</span> Nova lista
        </button>
      </div>

      <BottomNav activeTab="inicio" />
    </div>
  )
}
