import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../utils/formatCurrency';

interface ListaCardProps {
  id: string;
  nome: string;
  total: number;
  itens: number;
  comprados: number;
}

const ListaCard: React.FC<ListaCardProps> = ({ id, nome, total, itens, comprados }) => {
  const navigate = useNavigate();
  const progresso = itens === 0 ? 0 : (comprados / itens) * 100;

  return (
    <div
      className="border border-gray-200 rounded-lg p-4 shadow cursor-pointer"
      onClick={() => navigate(`/list/${id}`)}
    >
      <div className="flex justify-between mb-1">
        <p className="font-medium text-gray-800">{nome}</p>
        <p className="text-sm text-gray-500">{comprados}/{itens} itens</p>
      </div>
      <div className="w-full h-2 bg-gray-100 rounded-full mb-1">
        <div className="h-2 bg-yellow-400 rounded-full" style={{ width: `${progresso}%` }} />
      </div>
      <p className="text-sm text-gray-600">Total: {formatCurrency(total)}</p>
    </div>
  );
};

export default ListaCard;
