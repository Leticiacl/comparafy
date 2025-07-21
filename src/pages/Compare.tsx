// src/pages/Compare.tsx
import React, { useEffect, useState } from 'react';
import { useData } from '../context/DataContext';
import BottomNav from '../components/BottomNav';
import { useNavigate } from 'react-router-dom';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

const Compare: React.FC = () => {
  const { lists } = useData();
  const [listAId, setListAId] = useState('');
  const [listBId, setListBId] = useState('');
  const [differences, setDifferences] = useState<any[]>([]);
  const navigate = useNavigate();

  const listA = lists.find((list) => list.id === listAId);
  const listB = lists.find((list) => list.id === listBId);

  useEffect(() => {
    if (listA && listB) {
      const itemsA = listA.items || [];
      const itemsB = listB.items || [];

      const mapB = new Map(itemsB.map((item: any) => [item.name, item]));

      const diffs = itemsA.map((item: any) => {
        const match = mapB.get(item.name);
        if (!match) {
          return {
            name: item.name,
            priceA: item.price,
            priceB: '—',
            difference: 'Item ausente na lista B',
          };
        } else {
          const diff = match.price - item.price;
          return {
            name: item.name,
            priceA: item.price,
            priceB: match.price,
            difference:
              diff === 0
                ? 'Mesmo preço'
                : diff > 0
                ? `R$${Math.abs(diff).toFixed(2)} mais barato na lista A`
                : `R$${Math.abs(diff).toFixed(2)} mais caro na lista A`,
          };
        }
      });

      setDifferences(diffs);
    } else {
      setDifferences([]);
    }
  }, [listA, listB]);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="flex justify-between items-center p-4">
        <h1 className="text-xl font-bold">Comparar Listas</h1>
        <img src="/LOGO_REDUZIDA.png" alt="Logo" className="h-10" />
      </div>

      <div className="px-4">
        <label className="block font-medium mt-4">Lista A:</label>
        <select
          value={listAId}
          onChange={(e) => setListAId(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-2 mt-1"
        >
          <option value="">Selecione uma lista</option>
          {lists.map((list) => (
            <option key={list.id} value={list.id}>
              {list.name}
            </option>
          ))}
        </select>

        <label className="block font-medium mt-4">Lista B:</label>
        <select
          value={listBId}
          onChange={(e) => setListBId(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-2 mt-1"
        >
          <option value="">Selecione uma lista</option>
          {lists.map((list) => (
            <option key={list.id} value={list.id}>
              {list.name}
            </option>
          ))}
        </select>

        {differences.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Diferenças:</h2>
            <ul className="divide-y divide-gray-200">
              {differences.map((diff, idx) => (
                <li key={idx} className="py-3 flex flex-col gap-1">
                  <div className="font-medium">{diff.name}</div>
                  <div className="text-sm text-gray-600">
                    Lista A: {diff.priceA === '—' ? '—' : `R$${diff.priceA}`}
                  </div>
                  <div className="text-sm text-gray-600">
                    Lista B: {diff.priceB === '—' ? '—' : `R$${diff.priceB}`}
                  </div>
                  <div className="text-sm text-blue-700 font-semibold">
                    {diff.difference}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="mt-auto">
        <BottomNav activeTab="compare" />
      </div>
    </div>
  );
};

export default Compare;
