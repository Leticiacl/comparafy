import React, { useState, useMemo } from 'react'
import { useData } from '../context/DataContext'
import BottomNav from '../components/BottomNav'
import { CheckIcon } from '@heroicons/react/24/solid'
import { normalizeString } from '../utils/normalizeString'

interface CompareRow {
  name: string
  a?: { preco: number; mercado: string }
  b?: { preco: number; mercado: string }
}

const Compare: React.FC = () => {
  const { lists } = useData()

  // === STATE FOR TABS & SEARCH ===
  const [activeTab, setActiveTab] = useState<'prices' | 'lists' | 'stats'>('prices')

  // Preços tab
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<{ mercado: string; preco: number }[]>([])

  const handleSearch = () => {
    // Aqui você pode buscar de verdade nas suas listas:
    const term = normalizeString(searchTerm.trim())
    if (!term) {
      setSearchResults([])
      return
    }
    // Simula: reúne todos os preços de itens cujo nome contenha o termo
    const allItems = lists.flatMap(l =>
      l.itens.map(i => ({ mercado: i.mercado, preco: i.preco, nome: i.nome }))
    )
    const found = allItems
      .filter(i => normalizeString(i.nome).includes(term))
      .map(i => ({ mercado: i.mercado, preco: i.preco }))
    setSearchResults(found)
  }

  // Listas tab
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const toggleList = (id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id)
      if (prev.length < 2) return [...prev, id]
      return [prev[1], id]
    })
  }
  const listA = lists.find(l => l.id === selectedIds[0])
  const listB = lists.find(l => l.id === selectedIds[1])

  // Une nomes das duas listas
  const rows: CompareRow[] = useMemo(() => {
    const names = new Set<string>()
    listA?.itens.forEach(i => names.add(i.nome))
    listB?.itens.forEach(i => names.add(i.nome))
    return Array.from(names).map(name => {
      const a = listA?.itens.find(i => i.nome === name)
      const b = listB?.itens.find(i => i.nome === name)
      return {
        name,
        a: a && { preco: a.preco, mercado: a.mercado },
        b: b && { preco: b.preco, mercado: b.mercado },
      }
    })
  }, [listA, listB])

  const totalDiff = useMemo(() => {
    return rows.reduce((sum, { a, b }) => {
      if (a && b) return sum + Math.max(0, a.preco - b.preco)
      return sum
    }, 0)
  }, [rows])

  return (
    <div className="p-4 pb-32 max-w-xl mx-auto bg-white space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Comparar</h1>
        <img src="/LOGO_REDUZIDA.png" alt="Logo" className="h-8 w-8" />
      </div>

      {/* Tabs */}
      <div className="flex space-x-6 border-b">
        {(['prices', 'lists', 'stats'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 ${
              activeTab === tab
                ? 'text-yellow-500 border-b-2 border-yellow-500'
                : 'text-gray-500'
            }`}
          >
            {tab === 'prices'
              ? 'Preços'
              : tab === 'lists'
              ? 'Listas'
              : 'Estatísticas'}
          </button>
        ))}
      </div>

      {/* Conteúdo das tabs */}
      {activeTab === 'prices' && (
        <div>
          <div className="mt-4 flex gap-2">
            <input
              type="text"
              placeholder="Buscar produto"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="flex-1 border border-gray-300 rounded-xl px-4 py-2
                         focus:outline-none focus:ring focus:border-yellow-400"
            />
            <button
              onClick={handleSearch}
              className="bg-yellow-500 px-4 py-2 rounded-xl text-black font-medium"
            >
              Buscar
            </button>
          </div>

          {searchResults.length === 0 ? (
            <p className="mt-10 text-center text-gray-500">
              {searchTerm.trim()
                ? 'Nenhum preço encontrado.'
                : 'Pesquise um produto acima.'}
            </p>
          ) : (
            <ul className="mt-6 space-y-4">
              {searchResults.map((r, i) => (
                <li
                  key={i}
                  className="border border-gray-200 rounded-xl p-4 flex justify-between items-center"
                >
                  <span className="font-medium">{r.mercado}</span>
                  <span className="text-lg font-semibold">
                    R$ {r.preco.toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {activeTab === 'lists' && (
        <div className="space-y-4">
          <p className="text-gray-600">Selecione duas listas</p>
          <div className="space-y-2">
            {lists.map(list => {
              const sel = selectedIds.includes(list.id)
              return (
                <button
                  key={list.id}
                  onClick={() => toggleList(list.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition ${
                    sel
                      ? 'border-yellow-500 bg-yellow-100'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-800">
                      {list.nome}
                    </span>
                    {sel && <CheckIcon className="h-5 w-5 text-yellow-500" />}
                  </div>
                </button>
              )
            })}
          </div>
          {listA && listB && (
            <div className="mt-4 border rounded-xl overflow-hidden shadow-sm">
              <div className="px-4 py-2 bg-gray-50 flex justify-between text-sm text-gray-700 font-medium">
                <span>{listA.nome}</span>
                <span>→</span>
                <span>{listB.nome}</span>
              </div>
              <div className="divide-y">
                {rows.map(({ name, a, b }) => (
                  <div key={name} className="px-4 py-4">
                    <h2 className="font-semibold text-gray-800">{name}</h2>
                    <div className="mt-2 space-y-1">
                      {a && (
                        <div className="text-gray-700">
                          R$ {a.preco.toFixed(2)}{' '}
                          <span className="text-sm text-gray-500">
                            ({a.mercado})
                          </span>
                        </div>
                      )}
                      {b && (
                        <div className="text-gray-700">
                          R$ {b.preco.toFixed(2)}{' '}
                          <span className="text-sm text-gray-500">
                            ({b.mercado})
                          </span>
                        </div>
                      )}
                      {a && b && a.preco !== b.preco && (
                        <div
                          className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${
                            a.preco > b.preco
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {a.preco > b.preco
                            ? `Economia R$ ${(a.preco - b.preco).toFixed(2)}`
                            : `+ R$ ${(b.preco - a.preco).toFixed(2)} em A`}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-3 bg-gray-50 text-right font-semibold text-gray-800">
                Economia total: R$ {totalDiff.toFixed(2)}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="text-center text-gray-500 py-10">
          Em breve: suas estatísticas de economia.
        </div>
      )}

      <BottomNav activeTab="compare" />
    </div>
  )
}

export default Compare
