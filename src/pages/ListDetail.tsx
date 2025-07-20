// src/pages/ListDetail.tsx
import React from 'react';
import { useParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';

const ListDetail: React.FC = () => {
  const { id } = useParams();
  const { data } = useData();

  const list = data.lists.find((l) => l.id === id);
  const items = data.items?.[id || ''] || [];

  if (!list) {
    return (
      <div className="p-4 space-y-4 pb-24">
        <Header title="Detalhes da Lista" />
        <p className="text-center text-gray-500">Lista não encontrada.</p>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 pb-24">
      <Header title={list.name} />

      {items.length === 0 ? (
        <p className="text-center text-gray-500">Nenhum item nesta lista.</p>
      ) : (
        items.map((item, index) => (
          <div key={index} className="bg-white p-4 rounded-xl shadow">
            <p className="font-medium text-gray-900">{item.name}</p>
            <p className="text-sm text-gray-600">
              Quantidade: {item.quantity} | Preço: R$ {item.price?.toFixed(2) || '0.00'}
            </p>
            {item.purchased && <p className="text-green-600 text-xs mt-1">Comprado</p>}
          </div>
        ))
      )}

      <BottomNav />
    </div>
  );
};

export default ListDetail;
