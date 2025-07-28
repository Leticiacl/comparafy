import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useData } from "../context/DataContext";
import AddItemModal from "../components/ui/AddItemModal";
import { formatCurrency } from "../utils/formatCurrency";
import BottomNav from "../components/BottomNav";

const ListDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { lists, toggleItemPurchased, deleteItem } = useData();
  const [list, setList] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const found = lists.find((l) => l.id === id);
    if (!found) return navigate("/dashboard");
    setList(found);
  }, [id, lists]);

  if (!list) return null;

  const total = list.items.reduce((acc, item) => acc + Number(item.price || 0), 0);
  const purchased = list.items.filter((item) => item.purchased).length;
  const percent = list.items.length ? (purchased / list.items.length) * 100 : 0;

  return (
    <div className="p-4 pb-32 max-w-xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-900">{list.name}</h1>
        <img src="/LOGO_REDUZIDA.png" alt="Logo" className="h-10" />
      </div>

      <div className="w-full h-2 bg-gray-100 rounded-full mb-2">
        <div className="h-2 bg-yellow-400 rounded-full" style={{ width: `${percent}%` }} />
      </div>
      <p className="text-sm text-gray-600 mb-4">{purchased}/{list.items.length} itens comprados — Total: {formatCurrency(total)}</p>

      <ul className="space-y-4">
        {list.items.map((item: any) => (
          <li key={item.id} className="border p-3 rounded-lg shadow flex justify-between items-center">
            <div>
              <input
                type="checkbox"
                checked={item.purchased}
                onChange={() => toggleItemPurchased(list.id, item.id)}
                className="mr-2"
              />
              <span className={`${item.purchased ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                {item.name}
              </span>
              <p className="text-xs text-gray-500">{item.quantity} {item.unit} • {item.market}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-800">{formatCurrency(item.price)}</p>
              <button
                onClick={() => deleteItem(list.id, item.id)}
                className="text-xs text-red-500"
              >
                Excluir
              </button>
            </div>
          </li>
        ))}
      </ul>

      <button
        onClick={() => setShowModal(true)}
        className="mt-6 w-full bg-yellow-500 text-black font-semibold py-3 rounded-xl shadow"
      >
        + Adicionar item
      </button>

      <AddItemModal isOpen={showModal} onClose={() => setShowModal(false)} listId={list.id} />
      <BottomNav activeTab="lists" />
    </div>
  );
};

export default ListDetail;
