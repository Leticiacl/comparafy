// src/pages/Dashboard.tsx
import React from 'react';
import { useData } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { ArrowUpRight } from 'lucide-react';

const Dashboard = () => {
  const { data, addNewList } = useData();
  const navigate = useNavigate();

  const totalSavings = data.savings.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="pb-20 px-4 pt-6">
      <h1 className="text-3xl font-bold">Olá!</h1>
      <p className="text-gray-500 mb-4">Bem-vindo ao Comparify</p>

      <div className="bg-white p-4 rounded-lg shadow flex items-center gap-4 mb-6">
        <div className="bg-yellow-100 text-yellow-500 p-3 rounded-full">
          <ArrowUpRight />
        </div>
        <div>
          <p className="text-sm text-gray-500">Economia total</p>
          <p className="text-xl font-semibold">R$ {totalSavings.toFixed(2)}</p>
        </div>
      </div>

      {data.lists.length > 0 && (
        <>
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold">Listas recentes</h2>
            <button
              onClick={() => navigate('/lists')}
              className="text-yellow-500 text-sm"
            >
              Ver todas
            </button>
          </div>

          <div className="space-y-4 mb-6">
            {data.lists.slice(0, 3).map((list) => (
              <div
                key={list.id}
                onClick={() => navigate(`/list/${list.id}`)}
                className="bg-white p-4 rounded-lg shadow cursor-pointer"
              >
                <h3 className="text-lg font-medium">{list.name}</h3>
                <div className="h-2 bg-gray-200 rounded mt-2">
                  <div
                    className="h-2 bg-yellow-500 rounded"
                    style={{
                      width: `${(data.items[list.id]?.length || 0) * 10}%`,
                    }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Total: R$ 0.00 — {data.items[list.id]?.length || 0} itens
                </p>
              </div>
            ))}
          </div>
        </>
      )}

      <button
        onClick={addNewList}
        className="w-full bg-yellow-500 text-black font-semibold py-3 rounded-xl shadow flex items-center justify-center gap-2 text-base"
      >
        + Nova lista
      </button>

      <BottomNav />
    </div>
  );
};

export default Dashboard;
