import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { showToast } from '../components/ui/Toaster';
import { fetchListDetails } from '../services/firestoreService'; // Função para buscar detalhes da lista
import { ArrowLeftIcon, PlusIcon } from 'lucide-react';

const ListDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();  // Obtém o ID da lista da URL
  const navigate = useNavigate();
  const [list, setList] = useState<any>(null);  // Estado para armazenar os detalhes da lista
  const [loading, setLoading] = useState(true);  // Estado de carregamento

  // Carregar os detalhes da lista ao montar o componente
  useEffect(() => {
    const loadList = async () => {
      try {
        const fetchedList = await fetchListDetails(id);  // Função que busca os detalhes da lista
        setList(fetchedList);  // Atualiza o estado com os detalhes da lista
        setLoading(false);  // Finaliza o carregamento
      } catch (error) {
        showToast('Erro ao carregar detalhes da lista', 'error');
        console.error('Erro ao carregar detalhes da lista:', error);
      }
    };

    if (id) {
      loadList();  // Carrega os dados da lista se o ID estiver presente
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <span className="text-gray-500 dark:text-gray-400">Carregando...</span>
      </div>
    );  // Exibe uma mensagem de carregamento enquanto os dados estão sendo carregados
  }

  if (!list) {
    return (
      <div className="min-h-screen flex justify-center items-center text-center py-10">
        <p className="text-gray-500 dark:text-gray-400">Lista não encontrada</p>
        <button onClick={() => navigate('/lists')} className="mt-4 text-yellow-500">
          Voltar para listas
        </button>
      </div>
    );  // Caso a lista não seja encontrada
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <header className="mb-6">
        <button onClick={() => navigate('/lists')} className="flex items-center text-gray-500 mb-4">
          <ArrowLeftIcon className="w-5 h-5 mr-1" />
          <span>Voltar</span>
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{list.name}</h1>
      </header>

      {/* Progresso da lista */}
      <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {list.items.filter((item: any) => item.purchased).length}/{list.items.length} itens comprados
          </span>
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            R$ {(list.items.filter((item: any) => item.purchased).reduce((acc: number, item: any) => acc + item.price * item.quantity, 0)).toFixed(2)}
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
          <div className="bg-yellow-500 h-2 rounded-full transition-all duration-300" style={{ width: `${(list.items.filter((item: any) => item.purchased).length / list.items.length) * 100}%` }}></div>
        </div>
      </div>

      {/* Botão de Adicionar Item */}
      <button
        onClick={() => showToast('Abrir modal para adicionar item')}
        className="w-full py-3 bg-yellow-500 text-black font-medium rounded-lg flex items-center justify-center mb-6"
      >
        <PlusIcon className="w-5 h-5 mr-2" />
        Adicionar item
      </button>

      {/* Exibição dos Itens da Lista */}
      <h3 className="text-xl font-semibold mb-4">Itens da Lista</h3>
      {list.items.length > 0 ? (
        <div className="space-y-4">
          {list.items.map((item: any) => (
            <div
              key={item.id}
              className={`p-4 bg-white dark:bg-gray-800 border rounded-lg shadow-sm ${item.purchased ? 'border-gray-300 dark:border-gray-700' : 'border-gray-200 dark:border-gray-600'}`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h4 className={`text-lg font-medium ${item.purchased ? 'line-through text-gray-500 dark:text-gray-400' : ''}`}>
                    {item.name}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{item.quantity} {item.unit}</p>
                </div>
                <div className="text-right">
                  <div className="font-medium">R$ {(item.price * item.quantity).toFixed(2)}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">R$ {item.price.toFixed(2)}/{item.unit}</div>
                </div>
              </div>
              <div className="mt-2 flex gap-4">
                <button className="text-blue-500" onClick={() => {}}>Editar</button>
                <button className="text-red-500" onClick={() => {}}>Excluir</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 dark:text-gray-400">Esta lista não tem itens ainda.</p>
      )}
    </div>
  );
};

export default ListDetail;
