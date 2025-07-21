// src/pages/Scanner.tsx
import React from 'react';
import BottomNav from '../components/BottomNav';

const Scanner: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header com logo */}
      <div className="flex justify-between items-center p-4">
        <h1 className="text-xl font-bold">Scanner</h1>
        <img src="/LOGO_REDUZIDA.png" alt="Logo" className="h-10" />
      </div>

      {/* Conteúdo da tela */}
      <div className="flex-1 px-4 flex items-center justify-center text-gray-500 text-center">
        <p>Funcionalidade de scanner será implementada aqui.</p>
      </div>

      {/* Navegação inferior */}
      <BottomNav activeTab="scanner" />
    </div>
  );
};

export default Scanner;
