import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import Header from '../components/Header';

const Compare: React.FC = () => {
  const { data } = useData();
  const [listAId, setListAId] = useState<string>('');
  const [listBId, setListBId] = useState<string>('');

  const listA = data.lists.find((list) => list.id === listAId);
  const listB = data.lists.find((list) => list.id === listBId);

  const compareItems = () => {
    if (!listA || !listB) return [];

    const allItemNames = Array.from(
      new Set([
        ...(listA.items?.map((item) => item.name) || []),
        ...(listB.items?.map((item) => item.name) || []),
      ])
    );

    return allItemNames.map((name) => {
      const itemA = listA.items?.find((i) => i.name === name);
      const itemB = listB.items?.find((i) => i.name === name);

      const priceA = itemA?.price || 0;
      const priceB = itemB?.price || 0;

      return {
        name,
        priceA,
        priceB,
      };
    });
  };

  const comparisons = compareItems();

  return (
    <div className="p-4 space-y-6 pb-24">
      <Header title="Comparar Listas" />

      {/* Seletores de listas */}
      <div className="space-y-4">
        <select
          className="w-full p-2 border rounded-md"
          value={listAId}
          onChange={(e) => setListAId(e.target.value)}
        >
          <option value="">Selecione a primeira lista</option>
          {data.lists.map((list) => (
            <option key={list.id} value={list.id}>
              {list.name}
            </option>
          ))}
        </select>

        <select
          className="w-full p-2 border rounded-md"
          value={listBId}
          onChange={(e) => setListBId(e.target.value)}
        >
          <option value="">Selecione a segunda lista</option>
          {data.lists.map((list) => (
            <option key={list.id} value={list.id}>
              {list.name}
            </option>
          ))}
        </select>
      </div>

      {/* Tabela de comparação */}
      {listA && listB && comparisons.length > 0 ? (
        <div className="space-y-3 mt-6">
          {comparisons.map((item, idx) => (
            <div
              key={idx}
              className="bg-white p-4 rounded-xl shadow text-sm space-y-1"
            >
              <p className="font-semibold text-gray-800">{item.name}</p>
              <div className="flex justify-between">
                <p
                  className={`${
                    item.priceA < item.priceB ? 'text-green-600 font-bold' : 'text-gray-600'
                  }`}
                >
                  Lista A: R$ {item.priceA.toFixed(2)}
                </p>
                <p
                  className={`${
                    item.priceB < item.priceA ? 'text-green-600 font-bold' : 'text-gray-600'
                  }`}
                >
                  Lista B: R$ {item.priceB.toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center mt-6">Selecione duas listas para comparar.</p>
      )}
    </div>
  );
};

export default Compare;
