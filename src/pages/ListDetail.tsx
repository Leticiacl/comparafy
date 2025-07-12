import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchListDetails } from '../services/firestoreService';
import { ArrowLeftIcon, PlusIcon } from 'lucide-react';

const ListDetail: React.FC = () => {
  const { id } = useParams();
  const [list, setList] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadList = async () => {
      try {
        if (id) {
          const listData = await fetchListDetails(id);
          if (listData) {
            setList(listData);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar lista:', error);
      } finally {
        setLoading(false);
      }
    };
    loadList();
  }, [id]);

  if (loading) {
    return <div className="p-4 text-gray-700">Carregando...</div>;
  }

  if (!list) {
    return <div className="p-4 text-gray-500">Lista não encontrada.</div>;
  }

  const total = list.items?.reduce((acc: number, item: any) => acc + item.price * item.quantity, 0) || 0;

  return (
    <div className="p-4 space-y-6 pb-20">
      {/* Header */}
      <div className="flex justify-between items-center">
        <button onClick={() => window.history.back()} className="text-gray-600">
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">Minhas Listas</h1>
        <img src="/LOGO_REDUZIDA.png" alt="Logo" className="w-8 h-8" />
      </div>

      {/* Detalhes da lista */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow space-y-1">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{list.name}</h2>
        <p className="text-sm text-gray-500">Itens: {list.items.length}</p>
        <p className="text-sm text-gray-500">Total: R$ {total.toFixed(2)}</p>
      </div>

      {/* Itens */}
      <div className="space-y-3">
        {list.items.map((item: any) => (
          <div key={item.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
            <p className="font-semibold text-gray-900 dark:text-white">{item.name}</p>
            <p className="text-sm text-gray-500">Qtd: {item.quantity}</p>
            <p className="text-sm text-gray-500">Preço: R$ {item.price.toFixed(2)}</p>
          </div>
        ))}
      </div>

      {/* Botão flutuante */}
      <button
        className="fixed bottom-6 right-6 bg-yellow-500 text-white rounded-full p-4 shadow-lg hover:bg-yellow-600"
        onClick={() => alert('Em breve: adicionar item')}
      >
        <PlusIcon className="w-6 h-6" />
      </button>
    </div>
  );
};

export default ListDetail;
