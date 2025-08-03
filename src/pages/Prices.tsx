// src/pages/Prices.tsx
import React, { useState, useMemo } from 'react'
import { useData, Item } from '../context/DataContext'
import BottomNav from '../components/BottomNav'
import { normalizeString } from '../utils/normalizeString'

interface PriceGroup {
  key: string
  mercado: string
  precos: number[]
}

const Prices: React.FC = () => {
  const { lists } = useData()
  const [query, setQuery] = useState('')

  // 1) Junta todos os itens de todas as listas
  const allItems = useMemo(
    () =>
      lists.flatMap(list =>
        list.itens.map(item => ({
          ...item,
          mercado: item.mercado,
          preco: item.preco,
        }))
      ),
    [lists]
  )

  // 2) Filtra pelo nome do produto, normalizando
  const matches = useMemo(() => {
    const termo = normalizeString(query.trim())
    if (!termo) return [] as typeof allItems
    return allItems.filter(item =>
      normalizeString(item.nome).includes(termo)
    )
  }, [query, allItems])

  // 3) Agrupa pelo mesmo mercado (key normalizada) e coleciona todos os preços
  const groups = useMemo<PriceGroup[]>(() => {
    const map = new Map<string, PriceGroup>()
    for (const item of matches) {
      const key = normalizeString(item.mercado)
      if (!map.has(key)) {
        // exibe com capital inicial, sem acentos
        const display = key.charAt(0).toUpperCase() + key.slice(1)
        map.set(key, { key, mercado: display, precos: [] })
      }
      map.get(key)!.precos.push(item.preco)
    }
    return Array.from(map.values())
  }, [matches])

  return (
    <div className="p-4 pb-32 max-w-xl mx-auto bg-white space-y-6">
      <h1 className="text-2xl font-bold">Preços</h1>

      {/* Barra de busca */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Buscar produto…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="flex-1 border border-gray-300 rounded-xl px-4 py-2
                     focus:outline-none focus:ring focus:border-yellow-400"
        />
      </div>

      {/* Resultados */}
      {groups.length === 0 ? (
        <p className="mt-10 text-center text-gray-500">
          {query.trim()
            ? 'Nenhum preço encontrado.'
            : 'Digite o nome de um produto para buscar.'}
        </p>
      ) : (
        <ul className="mt-6 space-y-4">
          {groups.map(group => (
            <li
              key={group.key}
              className="border border-gray-200 rounded-xl p-4"
            >
              {/* Nome do mercado */}
              <div className="mb-2">
                <span className="font-medium text-gray-800">
                  {group.mercado}
                </span>
              </div>
              {/* Lista de preços */}
              <div className="space-y-1">
                {group.precos.map((p, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center"
                  >
                    <span className="text-gray-600 text-sm">
                      #{idx + 1}
                    </span>
                    <span className="text-lg font-semibold text-gray-800">
                      R$ {p.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}

      <BottomNav activeTab="lists" />
    </div>
  )
}

export default Prices
