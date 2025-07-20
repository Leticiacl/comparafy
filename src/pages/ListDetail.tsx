// src/pages/ListDetail.tsx
import React from 'react';
import { useParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import BottomNav from '../components/BottomNav';

const ListDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data } = useData();

  const list = data.lists.find((list) => list.id === id);

  if (!list) {
    return (
      <div className="p-4 text-center text-gray-500">
        Lista não encontrada.
        <BottomNav />
      </div>
    );
  }

  const totalValue =
    list.items?.reduce(
      (acc, item) => acc + (item.price || 0) * (item.quantity || 0),
      0
    ) || 0;

  return (
    <div className="p-4 space-y-4 pb-24">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-900">{list.name}</h1>
        <img src="/LOGO_REDUZIDA.png" alt="Logo Comparify" className="w-10 h-10" />
      </div>

      {/* Itens da lista */}
      {list.items?.length > 0 ? (
        <div className="space-y-4">
          {list.items.map((item, index) => (
            <div key={index} className="bg-white p-4 rounded-xl shadow">
              <div className="flex justify-between items-center">
                <p className="text-gray-900 font-medium">{item.name}</p>
                <span className="text-sm text-gray-500">
                  {item.quantity}x R$ {item.price?.toFixed(2)}
                </span>
              </div>
              <p className="text-sm text-gray-500">
                Total: R$ {(item.price || 0 * item.quantity || 0).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center">Nenhum item nesta lista.</p>
      )}

      {/* Total */}
      <div className="pt-4 text-right text-lg font-semibold text-gray-900">
        Total da lista: R$ {totalValue.toFixed(2)}
      </div>

      <BottomNav />
    </div>
  );
};

export default ListDetail;
