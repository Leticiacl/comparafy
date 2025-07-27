import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { useData } from '../context/DataContext';
import AddItemModal from '../components/ui/AddItemModal';

const ListDetail: React.FC = () => {
  const { listId } = useParams();
  const { userLists, updateListNameInContext, toggleItem, deleteItem } = useData();
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [showModal, setShowModal] = useState(false);

  const list = userLists.find((l) => l.id === listId);

  useEffect(() => {
    if (list) {
      setNewName(list.name);
    }
  }, [list]);

  const handleNameUpdate = async () => {
    await updateListNameInContext(listId!, newName);
    setEditingName(false);
  };

  if (!list) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Lista não encontrada.
      </div>
    );
  }

  const totalItems = list.items?.length || 0;
  const purchased = list.items?.filter((item) => item.purchased).length || 0;

  return (
    <div className="min-h-screen bg-white pb-24 px-4">
      {/* Header com logo */}
      <div className="flex justify-between items-center pt-6 mb-4">
        {editingName ? (
          <div className="flex-1 mr-4">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              autoFocus
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => setEditingName(false)}
                className="text-sm text-gray-500"
              >
                Cancelar
              </button>
              <button
                onClick={handleNameUpdate}
                className="text-sm text-yellow-500 font-medium"
              >
                Salvar
              </button>
            </div>
          </div>
        ) : (
          <>
            <h1 className="text-xl font-bold text-gray-800">{list.name}</h1>
            <img src="/LOGO_REDUZIDA.png" alt="Logo" className="h-10" />
          </>
        )}
      </div>

      {/* Info progresso */}
      <p className="text-sm text-gray-500 mb-2">{purchased} de {totalItems} itens comprados</p>

      {/* Botão adicionar item */}
      <button
        onClick={() => setShowModal(true)}
        className="w-full bg-yellow-400 text-black font-semibold py-3 rounded-xl shadow mb-6"
      >
        + Adicionar item
      </button>

      {/* Lista de itens */}
      {list.items?.length === 0 ? (
        <p className="text-center text-gray-400">Sua lista está vazia.</p>
      ) : (
        <div className="space-y-3">
          {list.items.map((item) => (
            <div
              key={item.id}
              className="border border-gray-200 rounded-lg p-4 shadow flex flex-col"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={item.purchased}
                    onChange={() => toggleItem(list.id, item.id)}
                  />
                  <p className={`font-medium ${item.purchased ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                    {item.name}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button className="text-sm text-blue-500">Editar</button>
                  <button
                    className="text-sm text-red-500"
                    onClick={() => deleteItem(list.id, item.id)}
                  >
                    Excluir
                  </button>
                </div>
              </div>
              <div className="text-sm text-gray-600 mt-2">
                {item.quantity} {item.unit} • {item.market} • R$ {Number(item.price).toFixed(2)}
              </div>
              {item.notes && (
                <p className="text-xs text-gray-400 italic mt-1">Obs: {item.notes}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal de item */}
      <AddItemModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        listId={list.id}
      />

      {/* Navegação */}
      <BottomNav activeTab="lists" />
    </div>
  );
};

export default ListDetail;
