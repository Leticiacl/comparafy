import React from 'react';
import { useNavigate } from 'react-router-dom';

interface OnboardingProps {
  onComplete?: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const navigate = useNavigate();

  const handleStart = () => {
    if (onComplete) onComplete();
    navigate('/login');
  };

  return (
    <div className="flex flex-col items-center justify-between min-h-screen bg-white p-8 text-center">
      {/* Logo */}
      <div className="mt-12">
        <img
          src="/LOGO_REDUZIDA.png"
          alt="Logo Comparify"
          className="w-24 h-24 mx-auto mb-4"
        />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Bem-vindo ao Comparify</h1>
        <p className="text-gray-500 text-base max-w-md mx-auto">
          Gerencie suas compras e economize comparando preços entre supermercados.
        </p>
      </div>

      {/* Botão de início */}
      <button
        onClick={handleStart}
        className="bg-yellow-500 text-black font-semibold py-3 px-6 rounded-xl shadow w-full max-w-md mb-12"
      >
        Começar
      </button>
    </div>
  );
};

export default Onboarding;
