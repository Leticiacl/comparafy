// src/pages/Scanner.tsx
import React from 'react';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';

const Scanner: React.FC = () => {
  return (
    <div className="min-h-screen bg-white pb-20">
      <Header title="Escanear Produto" />

      <div className="p-4 text-center text-gray-600">
        <p>Em breve: funcionalidade de escanear código de barras!</p>
      </div>

      <BottomNav activeTab="scanner" />
    </div>
  );
};

export default Scanner;
