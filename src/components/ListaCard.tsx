import React from 'react';
import { useNavigate } from 'react-router-dom';

interface ListaCardProps {
  id: string;
  nome: string;
  total: number;
  itens: number;
  comprados: number;
}

const ListaCard: React.FC<ListaCardProps> = ({ id, nome, total, itens, comprados }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/lists/${id}`)}
      className="bg-white p-4 rounded-xl shadow cursor-pointer mb-4"
    >
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold text-gray-900">{nome || 'Sem nome'}</h2>
        <p className="text-sm text-gray-500">
          {comprados}/{itens} itens
        </p>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded">
        <div
          className="h-2 bg-yellow-400 rounded"
          style={{ width: `${(comprados / (itens || 1)) * 100}%` }}
        />
      </div>
      <p className="text-sm text-gray-600 mt-2">Total: R$ {total.toFixed(2)}</p>
    </div>
  );
};

export default ListaCard;
