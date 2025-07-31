// src/pages/Compare.tsx
import React, { useState, useEffect } from 'react'
import { useData } from '../context/DataContext'
import BottomNav from '../components/BottomNav'
import { CheckIcon, ArrowRightIcon } from '@heroicons/react/24/solid'

interface ComparisonRow {
  nome: string
  aPrice: number
  aMarket: string
  bPrice?: number
  bMarket?: string
  diffText?: string
  diffColor?: 'green' | 'red' | 'gray'
}

const Compare: React.FC = () => {
  const { lists, fetchUserData } = useData()
  const [selected, setSelected] = useState<string[]>([])
  const [rows, setRows] = useState<ComparisonRow[]>([])
  const [totalSaving, setTotalSaving] = useState(0)

  useEffect(() => {
    fetchUserData()
  }, [fetchUserData])

  useEffect(() => {
    if (selected.length !== 2) {
      setRows([])
      setTotalSaving(0)
      return
    }

    const [aId, bId] = selected
    const aList = lists.find(l => l.id === aId)!
    const bList = lists.find(l => l.id === bId)!
    const mapB = new Map(bList.itens.map(i => [i.nome, i]))

    const temp = aList.itens.map(i => {
      const bItem = mapB.get(i.nome)
      if (!bItem) {
        // só A
        return {
          nome: i.nome,
          aPrice: i.preco,
          aMarket: i.mercado,
        }
      }

      const bP = bItem.preco
      let diffText = 'Mesmo preço'
      let diffColor: ComparisonRow['diffColor'] = 'gray'
      if (i.preco !== bP) {
        const cheaper = i.preco < bP
        diffColor = cheaper ? 'green' : 'red'
        const d = Math.abs(i.preco - bP).toFixed(2)
        diffText = cheaper ? `Economia R$ ${d}` : `+ R$ ${d} em A`
      }

      return {
        nome: i.nome,
        aPrice: i.preco,
        aMarket: i.mercado,
        bPrice: bP,
        bMarket: bItem.mercado,
        diffText,
        diffColor,
      }
    })

    setRows(temp)

    const tot = temp
      .filter(r => r.diffColor === 'green')
      .reduce((sum, r) => {
        // r.bPrice está definida porque diffColor verde só acontece se bItem existiu
        return sum + ((r.bPrice! - r.aPrice))
      }, 0)

    setTotalSaving(tot)
  }, [selected, lists])

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id)
      if (prev.length < 2) return [...prev, id]
      return [prev[0], id]
    })
  }

  const aName = lists.find(l => l.id === selected[0])?.nome
  const bName = lists.find(l => l.id === selected[1])?.nome

  return (
    <div className="pb-32">
      <div className="p-4 max-w-xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Comparar</h1>

        {/* Seleção de listas */}
        <p className="text-gray-600">Selecione duas listas para comparar</p>
        <div className="space-y-3">
          {lists.map(l => {
            const isSel = selected.includes(l.id)
            return (
              <button
                key={l.id}
                onClick={() => toggleSelect(l.id)}
                className={`
                  w-full flex items-center justify-between
                  p-4 rounded-xl border-2
                  ${isSel ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200'}
                `}
              >
                <span className="font-medium text-gray-800">{l.nome}</span>
                {isSel && (
                  <span className="bg-yellow-500 rounded-full p-1">
                    <CheckIcon className="h-5 w-5 text-white" />
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Resultado da comparação */}
        <div className="bg-white rounded-xl shadow divide-y divide-gray-200">
          {selected.length < 2 ? (
            <div className="p-8 text-center text-gray-500">
              Selecione duas listas acima para comparar.
            </div>
          ) : (
            <>
              <div className="flex items-center justify-center gap-2 p-4">
                <span className="font-medium">{aName}</span>
                <ArrowRightIcon className="h-5 w-5 text-gray-400" />
                <span className="font-medium">{bName}</span>
              </div>
              {rows.map((r, i) => (
                <div
                  key={i}
                  className="flex flex-col md:flex-row items-start md:items-center p-4 gap-4"
                >
                  {/* Nome */}
                  <div className="flex-1 font-medium text-gray-800">
                    {r.nome}
                  </div>

                  {/* Coluna A */}
                  <div className="w-28 text-center">
                    <div className="text-gray-700">R$ {r.aPrice.toFixed(2)}</div>
                    <div className="text-xs text-gray-500">{r.aMarket}</div>
                  </div>

                  {/* Coluna B e diff — só se existir */}
                  {r.bMarket && (
                    <>
                      <div className="w-28 text-center">
                        <div className="text-gray-700">R$ {r.bPrice!.toFixed(2)}</div>
                        <div className="text-xs text-gray-500">{r.bMarket}</div>
                      </div>
                      <div className="w-36 text-center">
                        <span
                          className={`
                            inline-block px-3 py-1 text-sm font-medium rounded-full
                            ${r.diffColor === 'green' ? 'bg-green-100 text-green-800' : ''}
                            ${r.diffColor === 'red'   ? 'bg-red-100 text-red-800'     : ''}
                            ${r.diffColor === 'gray'  ? 'text-gray-600'                 : ''}
                          `}
                        >
                          {r.diffText}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              ))}

              {/* Total */}
              <div className="p-4 text-right">
                <span className="text-gray-600 mr-2">Economia total:</span>
                <span className="font-semibold">
                  R$ {totalSaving.toFixed(2)}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Bottom Nav */}
      <BottomNav activeTab="compare" />
    </div>
  )
}

export default Compare
