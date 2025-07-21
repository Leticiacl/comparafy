import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataContext } from '../context/DataContext';
import BottomNav from '../components/BottomNav';

const Lists = () => {
  const { data, createListAndRedirect } = useContext(DataContext);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="flex justify-between items-center p-4">
        <h1 className="text-xl font-bold">Minhas Listas</h1>
        <img src="/LOGO_REDUZIDA.png" alt="Logo" className="w-12 h-12" />
      </div>

      <div className="p-4">
        <button
          className="w-full bg-yellow-500 text-black font-semibold py-3 rounded-xl shadow flex items-center justify-center gap-2 text-base"
          onClick={createListAndRedirect}
        >
          + Nova lista
        </button>
      </div>

      {data?.lists && data.lists.length > 0 ? (
        <div className="px-4 flex flex-col gap-4">
          {data.lists.map((list) => (
            <div
              key={list.id}
              className="bg-gray-100 rounded-xl p-4 shadow cursor-pointer"
              onClick={() => navigate(`/list/${list.id}`)}
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">{list.name}</h3>
                <span className="text-sm text-gray-500">
                  {list.items?.length || 0} itens
                </span>
              </div>
              <div className="w-full bg-gray-300 h-2 rounded-full">
                <div
                  className="bg-yellow-500 h-2 rounded-full"
                  style={{
                    width: `${
                      ((list.checkedCount || 0) / (list.items?.length || 1)) * 100
                    }%`,
                  }}
                ></div>
              </div>
              <div className="text-right text-sm font-semibold mt-2 text-gray-700">
                Total: R$ {Number(list.total || 0).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 mt-8">Nenhuma lista encontrada.</p>
      )}

      <BottomNav activeTab="lists" />
    </div>
  );
};

export default Lists;
