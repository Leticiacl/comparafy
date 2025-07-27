import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Link } from 'react-router-dom';
import NewListModal from './NewListModal';
import formatCurrency from '../utils/formatCurrency';

const Dashboard = () => {
  const { lists, totalSavings } = useData();
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="min-h-screen bg-white p-6 pb-24">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Olá!</h1>
          <p className="text-gray-500">Bem-vindo ao Comparify</p>
        </div>
        <img src="/LOGO_REDUZIDA.png" alt="Logo" className="w-10 h-10" />
      </div>

      <div className="bg-white rounded-xl shadow p-4 flex items-center justify-between mb-6 border">
        <div className="flex items-center gap-3">
          <div className="bg-yellow-400 rounded-full p-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6 text-white"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 16l4-4 4 4m0-8l-4 4-4-4"
              />
            </svg>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Total economizado</p>
            <p className="text-lg font-bold text-gray-800">{formatCurrency(totalSavings)}</p>
          </div>
        </div>
      </div>

      <button
        onClick={() => setShowModal(true)}
        className="w-full bg-yellow-400 text-black font-semibold py-3 rounded-xl shadow mb-6"
      >
        Nova lista
      </button>

      <h2 className="text-lg font-semibold text-gray-800 mb-4">Listas recentes</h2>

      <div className="space-y-4">
        {lists.map((list) => (
          <Link to={`/lists/${list.id}`} key={list.id}>
            <div className="p-4 border rounded-xl shadow-sm hover:shadow-md transition bg-white">
              <p className="font-semibold text-gray-800 mb-2">{list.name}</p>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-yellow-400"
                  style={{ width: `${list.progress || 0}%` }}
                />
              </div>
              <p className="text-sm text-gray-500">{list.itemCount || 0} itens — {formatCurrency(list.total || 0)}</p>
            </div>
          </Link>
        ))}
      </div>

      <NewListModal show={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
};

export default Dashboard;
