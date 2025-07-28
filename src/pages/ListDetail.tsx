// src/pages/ListDetail.tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import BottomNav from '../components/BottomNav';
import AddItemModal from '../components/ui/AddItemModal';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';

const ListDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const {
    lists,
    updateListNameInContext,
    fetchItems,
    toggleItem,
    deleteItem,
  } = useData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [editing, setEditing] = useState(false);

  const lista = lists.find((l) => l.id === id);

  useEffect(() => {
    if (id) fetchItems(id);
  }, [id]);

  // Previna erros de lista não encontrada ou itens indefinidos
  if (!lista) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-500">Lista não encontrada.</p>
        <BottomNav activeTab="lists" />
      </div>
    );
  }

  const itens = Array.isArray(lista.itens) ? lista.itens : [];

  const handleRename = () => {
    if (newName.trim()) {
      updateListNameInContext(lista.id, newName.trim());
      setEditing(false);
    }
  };

  const comprados = itens.filter((item) => item.comprado).length;
  const total = itens.reduce((acc, item) => acc + (item.preco || 0), 0);

  return (
    <div className="p-4 pb-32 max-w-xl mx-auto bg-white">
      {/* Título e logo */}
      <div className="flex justify-between items-center mb-4">
        {editing ? (
          <div className="flex gap-2 items-center w-full">
            <input
              type="text"
              className="border rounded-lg px-3 py-1 w-full"
              placeholder="Novo nome"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <button
              onClick={handleRename}
              className="bg-yellow-500 px-3 py-1 rounded-lg font-semibold text-black"
            >
              Salvar
            </button>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-gray-900">{lista.nome || 'Sem nome'}</h1>
            <div className="flex items-center gap-2">
              <button onClick={() => setEditing(true)}>
                <PencilSquareIcon className="h-6 w-6 text-gray-500" />
              </button>
              <img src="/LOGO_REDUZIDA.png" alt="Logo" className="h-8 ml-2" />
            </div>
          </>
        )}
      </div>

      {/* Barra de progresso */}
      <div className="bg-white rounded-xl shadow p-4 mb-4">
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <p>{comprados}/{itens.length} itens comprados</p>
          <p>R$ {total.toFixed(2)}</p>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded">
          <div
            className="h-2 bg-yellow-400 rounded"
            style={{
              width: `${(comprados / (itens.length || 1)) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Botão adicionar */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full bg-yellow-500 text-black font-semibold py-3 rounded-xl shadow mb-6"
      >
        + Adicionar item
      </button>

      {/* Itens */}
      {itens.length === 0 ? (
        <p className="text-center text-gray-500">Sua lista está vazia.</p>
      ) : (
        <ul className="space-y-4">
          {itens.map((item) => (
            <li key={item.id} className="bg-white p-4 rounded-xl shadow">
              <div className="flex justify-between items-start">
                <div className="flex gap-3">
                  <input
                    type="checkbox"
                    checked={item.comprado}
                    onChange={() => toggleItem(lista.id, item.id)}
                    className="mt-1"
                  />
                  <div>
                    <h2
                      className={`text-lg font-semibold ${
                        item.comprado ? 'line-through text-gray-400' : 'text-gray-900'
                      }`}
                    >
                      {item.nome}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {item.quantidade} {item.unidade} • {item.mercado}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-800">
                    R$ {Number(item.preco || 0).toFixed(2)}
                  </p>
                  {item.quantidade > 0 && item.preco > 0 && (
                    <p className="text-xs text-gray-400">
                      R$ {(item.preco / item.quantidade).toFixed(2)}/un
                    </p>
                  )}
                </div>
              </div>

              {item.observacoes && (
                <p className="text-xs text-gray-500 italic mt-2">{item.observacoes}</p>
              )}

              <div className="flex gap-4 mt-3 text-sm">
                <button className="flex items-center gap-1 text-gray-600">
                  <PencilSquareIcon className="h-4 w-4" />
                  Editar
                </button>
                <button
                  onClick={() => deleteItem(lista.id, item.id)}
                  className="flex items-center gap-1 text-red-500"
                >
                  <TrashIcon className="h-4 w-4" />
                  Excluir
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Modal e nav */}
      <AddItemModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} listId={lista.id} />
      <BottomNav activeTab="lists" />
    </div>
  );
};

export default ListDetail;
