import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, XIcon } from 'lucide-react';
import { showToast } from '../components/ui/Toaster';
import { useData } from '../context/DataContext';  // Agora usando o contexto

const Lists: React.FC = () => {
  const { data, reloadLists } = useData();  // Usando o contexto para acessar listas e recarregar
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [loading, setLoading] = useState(true);  // Estado de carregamento
  const navigate = useNavigate();

  useEffect(() => {
    reloadLists();  // Recarrega as listas quando o componente é montado
    setLoading(false);  // Finaliza o carregamento
  }, [reloadLists]);

  const handleCreateList = async () => {
    const userId = sessionStorage.getItem("userId");

    // Verifica se o userId está presente
    if (!userId) {
      showToast("Usuário não autenticado", "error");
      console.log("Erro: userId não encontrado");
      return;
    }

    // Verifica se o nome da lista não está vazio
    if (!newListName.trim()) {
      showToast("O nome da lista não pode estar vazio", "error");
      console.log("Erro: nome da lista vazio");
      return;
    }

    try {
      console.log("Criando lista:", newListName);
      const listId = await createList(userId, newListName.trim());
      console.log("Lista criada com sucesso! ID:", listId);

      showToast("Lista criada com sucesso", "success");
      setNewListName('');
      setIsModalOpen(false);
      await reloadLists();  // Recarrega as listas após a criação
    } catch (error) {
      showToast("Erro ao criar lista. Tente novamente.", "error");
      console.error("Erro ao criar lista:", error);
    }
  };

  if (loading) {
    console.log("Carregando listas...");
    return <div>Carregando...</div>;  // Exibe uma mensagem de carregamento até que as listas sejam carregadas
  }

  if (data.lists.length === 0) {
    console.log("Nenhuma lista encontrada.");
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Minhas Listas</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-yellow-500 text-black py-2 px-4 rounded flex items-center"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Nova Lista
        </button>
      </div>

      {/* Modal de Criação de Lista */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-md max-w-sm w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Criar Nova Lista</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-600"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            <input
              type="text"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mb-4"
              placeholder="Nome da lista"
            />
            <div className="flex justify-between">
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-500 text-white py-2 px-4 rounded"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateList}
                className="bg-yellow-500 text-black py-2 px-4 rounded"
              >
                Criar
              </button>
            </div>
          </div>
        </div>
      )}

      {data.lists.length > 0 ? (
        <div className="space-y-4">
          {data.lists.map((list) => (
            <div
              key={list.id}
              onClick={() => navigate(`/lists/${list.id}`)}
              className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 cursor-pointer"
            >
              <h3 className="text-lg font-semibold">{list.name}</h3>
            </div>
          ))}
        </div>
      ) : (
        <p>Nenhuma lista encontrada.</p>
      )}
    </div>
  );
};

export default Lists;
