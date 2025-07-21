// src/pages/Compare.tsx
import React from 'react';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';

const Compare: React.FC = () => {
  return (
    <div className="min-h-screen bg-white pb-20">
      <Header title="Comparar Preços" />

      <div className="p-4">
        <h2 className="text-lg font-semibold mb-2">Selecione listas para comparar</h2>
        {/* Conteúdo futuro */}
        <div className="mt-8 text-gray-500 text-center">
          Em breve: comparação entre supermercados!
        </div>
      </div>

      <BottomNav activeTab="compare" />
    </div>
  );
};

export default Compare;
