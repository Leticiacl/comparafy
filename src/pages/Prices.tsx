// src/pages/Prices.tsx
import React, { useState, useMemo } from 'react'
import { useData, Item } from '../context/DataContext'
import BottomNav from '../components/BottomNav'
import { normalizeString } from '../utils/normalizeString'

interface FlatItem extends Item {
  listName: string
  // se tiver data na lista, descomente abaixo e preencha no DataContext
  // listDate: string
}

interface GroupedMarket {
  key: string            // mercado normalizado
  label: string          // o primeiro rótulo encontrado (display)
  entries: Array<{
    preco: number
    listName: string
    // listDate?: string
  }>
}

const Prices: React.FC = () => {
  const { lists } = useData()
  const [query, setQuery] = useState('')

  // 1) Achata todas as listas num único array, carregando nome (e data se houver)
  const allItems = useMemo<FlatItem[]>(() =>
    lists.flatMap(list =>
      list.itens.map(item => ({
        ...item,
        listName: list.nome,
        // listDate: list.date,   // se existir
      }))
    ),
    [lists]
  )

  // 2) Filtra pelo nome do produto
  const filtered = useMemo(() => {
    const q = normalizeString(query)
    if (!q) return []
    return allItems.filter(item =>
      normalizeString(item.nome).includes(q)
    )
  }, [query, allItems])

  // 3) Agrupa por mercado (normalized)
  const grouped = useMemo((): GroupedMarket[] => {
    const map = new Map<string, GroupedMarket>()
    for (const item of filtered) {
      const key = normalizeString(item.mercado)
      if (!map.has(key)) {
        map.set(key, {
          key,
          label: item.mercado.trim(),
          entries: [],
        })
      }
      map.get(key)!.entries.push({
        preco: item.preco,
        listName: item.listName,
        // listDate: item.listDate
      })
    }
    return Array.from(map.values())
  }, [filtered])

  return (
    <div className="p-4 pb-32 max-w-xl mx-auto bg-white space-y-6">
      <h1 className="text-2xl font-bold">Preços</h1>

      {/* search bar */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Buscar produto…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="flex-1 border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring focus:border-yellow-400"
        />
      </div>

      {/* resultados */}
      {grouped.length === 0 ? (
        <p className="mt-10 text-center text-gray-500">
          {query.trim()
            ? 'Nenhum preço encontrado.'
            : 'Digite o nome de um produto para buscar.'}
        </p>
      ) : (
        <ul className="mt-6 space-y-4">
          {grouped.map(market => (
            <li
              key={market.key}
              className="border border-gray-200 rounded-xl p-4"
            >
              {/* Título do mercado */}
              <strong className="block text-lg text-gray-800 mb-2">
                {market.label}
              </strong>

              {/* Lista de preços + lista onde comprou */}
              <div className="space-y-1">
                {market.entries.map((e, i) => (
                  <div
                    key={i}
                    className="flex justify-between text-gray-700"
                  >
                    <span className="text-sm">
                      {e.listName}
                      {/* ou: {e.listDate} */}
                    </span>
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

      <BottomNav activeTab="prices" />
    </div>
  )
}

export default Prices
