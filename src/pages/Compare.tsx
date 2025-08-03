// src/pages/Compare.tsx
import React, { useState, useMemo } from 'react'
import { useData } from '../context/DataContext'
import BottomNav from '../components/BottomNav'
import { CheckIcon } from '@heroicons/react/24/solid'
import { normalizeString } from '../utils/normalizeString'

type FlatItem = {
  nome: string
  preco: number
  mercado: string
  listName: string
  // Se precisar de data, adicione aqui e no DataContext:
  // listDate: string
}

type MarketGroup = {
  key: string          // mercado normalizado
  label: string        // mercado capitalizado para display
  itemName: string     // nome do produto
  entries: Array<{
    preco: number
    listName: string
    // listDate?: string
  }>
}

type CompareRow = {
  name: string
  a?: { preco: number; mercado: string }
  b?: { preco: number; mercado: string }
}

const Compare: React.FC = () => {
  const { lists } = useData()
  const [activeTab, setActiveTab] = useState<'prices' | 'lists' | 'stats'>('prices')
  const [query, setQuery] = useState('')

  // 1) Achata itens incluindo o nome da lista
  const allItems = useMemo<FlatItem[]>(() =>
    lists.flatMap(list =>
      list.itens.map(item => ({
        nome: item.nome,
        preco: item.preco,
        mercado: item.mercado,
        listName: list.nome,
        // listDate: list.date
      }))
    ),
    [lists]
  )

  // 2) Filtra pelo nome do produto (normalizado)
  const filtered = useMemo(() => {
    const q = normalizeString(query.trim())
    if (!q) return []
    return allItems.filter(i => normalizeString(i.nome).includes(q))
  }, [query, allItems])

  // 3) Agrupa pelos mercados encontrados no filtro
  const groupedMarkets = useMemo<MarketGroup[]>(() => {
    const map = new Map<string, MarketGroup>()
    for (const item of filtered) {
      const mKey = normalizeString(item.mercado)
      if (!map.has(mKey)) {
        // capitaliza a primeira letra do mercado
        const raw = item.mercado.trim().toLowerCase()
        const label = raw.charAt(0).toUpperCase() + raw.slice(1)
        map.set(mKey, {
          key: mKey,
          label,
          itemName: item.nome,
          entries: []
        })
      }
      map.get(mKey)!.entries.push({
        preco: item.preco,
        listName: item.listName,
        // listDate: item.listDate
      })
    }
    return Array.from(map.values())
  }, [filtered])

  // === Aba “Listas” ===
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

  // <Listas> – mesma lógica antiga de comparação
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
        b: b && { preco: b.preco, mercado: b.mercado }
      }
    })
  }, [listA, listB])

  const totalDiff = useMemo(
    () =>
      rows.reduce((sum, { a, b }) => (a && b ? sum + Math.max(0, a.preco - b.preco) : sum), 0),
    [rows]
  )

  return (
    <div className="p-4 pb-32 max-w-xl mx-auto bg-white space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Comparar</h1>
        <img src="/LOGO_REDUZIDA.png" alt="Logo" className="h-8 w-8" />
      </div>

      {/* Tabs (centralizadas) */}
      <div className="flex justify-center space-x-6 border-b">
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
            {tab === 'prices' ? 'Preços' : tab === 'lists' ? 'Listas' : 'Estatísticas'}
          </button>
        ))}
      </div>

      {/* === Aba Preços === */}
      {activeTab === 'prices' && (
        <div>
          {/* Busca */}
          <div className="mt-4 flex gap-2">
            <input
              type="text"
              placeholder="Buscar produto…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="flex-1 border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring focus:border-yellow-400"
            />
            <button
              onClick={() => {/* filtro já ativo */}}
              className="bg-yellow-500 px-4 py-2 rounded-xl text-black font-medium"
            >
              Buscar
            </button>
          </div>

          {groupedMarkets.length === 0 ? (
            <p className="mt-10 text-center text-gray-500">
              {query.trim()
                ? 'Nenhum preço encontrado.'
                : 'Digite o nome de um produto para buscar.'}
            </p>
          ) : (
            <ul className="mt-6 space-y-4">
              {groupedMarkets.map(market => (
                // padding aumentado para espaçamento maior
                <li
                  key={market.key}
                  className="border border-gray-200 rounded-xl p-6"
                >
                  {/* Mercado · Nome do produto */}
                  <strong className="block text-lg text-gray-800 mb-3">
                    {market.label} · {market.itemName}
                  </strong>
                  {/* Entradas de preço */}
                  <div className="space-y-2">
                    {market.entries.map((e, i) => (
                      <div
                        key={i}
                        className="flex justify-between text-gray-700"
                      >
                        <span className="text-sm">{e.listName}</span>
                        <span className="text-sm font-semibold">
                          R$ {e.preco.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* === Aba Listas === */}
      {activeTab === 'lists' && (
        <div className="space-y-4">
          <p className="text-gray-600">Selecione duas listas para comparar</p>
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

      {/* === Aba Estatísticas === */}
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
