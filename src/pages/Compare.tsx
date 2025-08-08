// src/pages/Compare.tsx
import React, { useState, useMemo } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { useData } from '../context/DataContext'
import BottomNav from '../components/BottomNav'
import { normalizeString } from '../utils/normalizeString'
import {
  ShoppingCartIcon,
  BuildingStorefrontIcon,
} from '@heroicons/react/24/solid'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

type FlatItem = {
  nome: string
  preco: number
  mercado: string
  unidade?: string
  peso?: number
  listName: string
}

export default function Compare() {
  const { lists } = useData()
  const [activeTab, setActiveTab] = useState<'prices' | 'lists' | 'stats'>(
    'prices'
  )
  const [query, setQuery] = useState('')

  // 1) achata todos os itens
  const allItems = useMemo<FlatItem[]>(
    () =>
      lists.flatMap((list) =>
        list.itens.map((item) => ({
          nome: item.nome,
          preco: item.preco,
          mercado: item.mercado,
          unidade: item.unidade,
          peso: item.peso,
          listName: list.nome,
        }))
      ),
    [lists]
  )

  // === ABA PREÇOS (mantida) ===
  const filtered = useMemo(() => {
    const q = normalizeString(query.trim())
    if (!q) return []
    return allItems.filter((i) =>
      normalizeString(i.nome).includes(q)
    )
  }, [query, allItems])

  const groupedMarkets = useMemo(() => {
    const map = new Map<string, {
      key: string
      label: string
      itemName: string
      pesoUnit: string
      entries: Array<{ preco: number; listName: string }>
    }>()
    for (const item of filtered) {
      const mk = normalizeString(item.mercado)
      const uk = normalizeString(item.unidade ?? '')
      const pk = `${item.peso ?? ''}`
      const key = `${mk}::${uk}::${pk}`

      if (!map.has(key)) {
        const raw = item.mercado.trim().toLowerCase()
        const label = raw[0].toUpperCase() + raw.slice(1)
        map.set(key, {
          key,
          label,
          itemName: item.nome,
          pesoUnit: `${item.peso ?? ''}${item.unidade ?? ''}`,
          entries: [],
        })
      }
      map.get(key)!.entries.push({
        preco: item.preco,
        listName: item.listName,
      })
    }
    return Array.from(map.values())
  }, [filtered])

  // === ABA LISTAS ===
  const [selIds, setSelIds] = useState<string[]>([])
  const toggleList = (id: string) =>
    setSelIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      if (prev.length < 2) return [...prev, id]
      return [prev[1], id]
    })

  const listA = lists.find((l) => l.id === selIds[0])
  const listB = lists.find((l) => l.id === selIds[1])

  type ListRow = {
    key: string
    nome: string
    pesoUnit: string
    priceA: number | null
    priceB: number | null
    diff: number | null
  }
  const listRows = useMemo<ListRow[]>(() => {
    if (!listA || !listB) return []
    const map = new Map<string, { nome: string; pesoUnit: string; prices: [number|null, number|null] }>()

    function add(list: typeof listA, idx: 0 | 1) {
      list.itens.forEach((i) => {
        const key =
          normalizeString(i.nome) +
          '::' +
          (i.peso ?? '') +
          '::' +
          (i.unidade ?? '')
        if (!map.has(key)) {
          map.set(key, {
            nome: i.nome,
            pesoUnit: `${i.peso ?? ''}${i.unidade ?? ''}`,
            prices: [null, null],
          })
        }
        map.get(key)!.prices[idx] = i.preco
      })
    }

    add(listA, 0)
    add(listB, 1)

    return Array.from(map.entries()).map(([key, { nome, pesoUnit, prices }]) => {
      const [a, b] = prices
      const diff =
        a != null && b != null
          ? parseFloat((b - a).toFixed(2))
          : null
      return { key, nome, pesoUnit, priceA: a, priceB: b, diff }
    })
  }, [listA, listB])

  // === ABA ESTATÍSTICAS ===
  const itemCounts = useMemo(() => {
    const cnt: Record<string, number> = {}
    allItems.forEach((i) => {
      const k = normalizeString(i.nome)
      cnt[k] = (cnt[k] || 0) + 1
    })
    return Object.entries(cnt)
      .map(([k, c]) => ({
        nome: allItems.find((i) => normalizeString(i.nome) === k)!.nome,
        count: c,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }, [allItems])

  const marketSpends = useMemo(() => {
    const sums: Record<string, number> = {}
    allItems.forEach((i) => {
      const k = normalizeString(i.mercado)
      sums[k] = (sums[k] || 0) + i.preco
    })
    return Object.entries(sums).map(([k, total]) => ({
      mercado: allItems.find((i) => normalizeString(i.mercado) === k)!.mercado,
      total,
    }))
  }, [allItems])

  const chartData = {
    labels: marketSpends.map((d) => d.mercado),
    datasets: [
      {
        label: 'Gasto',
        data: marketSpends.map((d) => d.total),
        backgroundColor: 'rgba(252,211,77,0.8)',
      },
    ],
  }
  const chartOpts = {
    scales: { y: { beginAtZero: true } },
    plugins: { legend: { display: false } as any },
  }

  return (
    <div className="p-4 pb-32 max-w-xl mx-auto bg-white space-y-6">
      {/* header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Comparar</h1>
        <img
          src="/LOGO_REDUZIDA.png"
          alt="Logo"
          className="h-8 w-8"
        />
      </div>

      {/* tabs */}
      <div className="flex justify-between px-6 border-b border-gray-200 pb-2">
        {(['prices', 'lists', 'stats'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-sm font-medium ${
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

      {/* === PREÇOS === */}
      {activeTab === 'prices' && (
        <div>
          <div className="mt-4 flex gap-2">
            <input
              type="text"
              placeholder="Buscar produto…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 border rounded-xl px-4 py-2 focus:ring-yellow-400"
            />
            <button className="bg-yellow-500 px-4 py-2 rounded-xl text-black font-medium">
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
              {groupedMarkets.map((m) => (
                <li
                  key={m.key}
                  className="border rounded-xl p-4 border-gray-200"
                >
                  <strong className="block text-lg text-gray-800 mb-3">
                    {m.label} · {m.itemName} · {m.pesoUnit}
                  </strong>
                  <div className="space-y-1">
                    {m.entries.map((e, i) => (
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

      {/* === LISTAS === */}
      {activeTab === 'lists' && (
        <div className="space-y-4">
          <p className="text-gray-600">
            Selecione duas listas para comparar
          </p>
          <div className="space-y-2">
            {lists.map((l) => {
              const sel = selIds.includes(l.id)
              return (
                <button
                  key={l.id}
                  onClick={() => toggleList(l.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg border ${
                    sel
                      ? 'bg-yellow-100 border-yellow-500'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {l.nome}
                </button>
              )
            })}
          </div>

          <div className="space-y-3">
            {listRows.map((r) => (
              <div
                key={r.key}
                className="border rounded-xl p-4 flex justify-between items-center"
              >
                <div>
                  <h3 className="font-semibold">
                    {r.nome} · {r.pesoUnit}
                  </h3>
                  <p className="text-sm text-gray-700">
                    Semanal: {r.priceA != null ? `R$ ${r.priceA.toFixed(2)}` : '–'}{' '}
                    Mensal: {r.priceB != null ? `R$ ${r.priceB.toFixed(2)}` : '–'}
                  </p>
                </div>
                {r.diff != null && (
                  <span
                    className={`font-semibold ${
                      r.diff > 0 ? 'text-red-600' : 'text-green-600'
                    }`}
                  >
                    {r.diff > 0 ? '+' : '–'} R$ {Math.abs(r.diff).toFixed(2)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* === ESTATÍSTICAS === */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          {/* itens mais comprados */}
          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center mb-3 text-yellow-500">
              <ShoppingCartIcon className="h-6 w-6 mr-2" />
              <h2 className="text-lg font-semibold">
                Itens mais comprados
              </h2>
            </div>
            <ul className="divide-y">
              {itemCounts.map((it, idx) => (
                <li
                  key={idx}
                  className="py-2 flex justify-between text-gray-700"
                >
                  <span>{it.nome}</span>
                  <span className="font-semibold">{it.count}x</span>
                </li>
              ))}
            </ul>
          </div>

          {/* gastos por supermercado */}
          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center mb-3 text-yellow-500">
              <BuildingStorefrontIcon className="h-6 w-6 mr-2" />
              <h2 className="text-lg font-semibold">
                Gastos por supermercado
              </h2>
            </div>
            <Bar data={chartData} options={chartOpts} />
          </div>
        </div>
      )}

      <BottomNav activeTab="compare" />
    </div>
  )
}
