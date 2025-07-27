import { useState } from "react";
import { useData } from "../context/DataContext";
import { Link } from "react-router-dom";
import NewListModal from "../components/ui/NewListModal";
import { formatCurrency } from "../utils/formatCurrency"; // ✅ CORRIGIDO
import BottomNav from "../components/BottomNav";

const Dashboard = () => {
  const { lists, savings } = useData();
  const [showModal, setShowModal] = useState(false);

  const totalSavings = savings.reduce((sum, val) => sum + val, 0);

  return (
    <div className="min-h-screen bg-white p-4">
      {/* Logo no canto superior direito */}
      <div className="flex justify-end mb-4">
        <img src="/LOGO_REDUZIDA.png" alt="Logo Comparify" className="h-10" />
      </div>

      {/* Título e subtítulo */}
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Olá!</h1>
      <p className="text-lg text-gray-700 mb-4">Bem-vindo ao Comparify</p>

      {/* Bloco de economia total */}
      <div className="bg-white p-4 rounded-xl shadow mb-4 flex items-center gap-4 border border-yellow-400">
        <div className="bg-yellow-400 p-2 rounded-full">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"
            />
          </svg>
        </div>
        <div>
          <p className="text-sm text-gray-500">Economia Total</p>
          <p className="text-xl font-bold text-gray-900">
            {formatCurrency(totalSavings)}
          </p>
        </div>
      </div>

      {/* Botão Nova Lista */}
      <button
        className="w-full bg-yellow-500 text-black font-semibold py-3 rounded-xl shadow flex items-center justify-center gap-2 text-base mb-4"
        onClick={() => setShowModal(true)}
      >
        + Nova Lista
      </button>

      {/* Modal */}
      {showModal && <NewListModal onClose={() => setShowModal(false)} />}

      {/* Listas Recentes */}
      {lists.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Minhas Listas
          </h2>
          <div className="space-y-2">
            {lists.map((list) => {
              const totalItems = list.items?.length || 0;
              const purchasedItems = list.items?.filter(
                (item) => item.purchased
              ).length || 0;
              const totalValue = list.items?.reduce(
                (sum, item) => sum + (item.price || 0),
                0
              );

              return (
                <Link
                  to={`/list/${list.id}`}
                  key={list.id}
                  className="block bg-white rounded-xl shadow p-4 border border-gray-200"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {list.name}
                  </h3>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full"
                      style={{
                        width: `${(purchasedItems / totalItems) * 100 || 0}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600">
                    {purchasedItems}/{totalItems} itens comprados
                  </p>
                  <p className="text-sm text-gray-800 font-semibold">
                    Total: {formatCurrency(totalValue)}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Navegação inferior */}
      <div className="mt-16">
        <BottomNav activeTab="home" />
      </div>
    </div>
  );
};

export default Dashboard;
