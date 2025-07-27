import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const slides = [
  {
    title: 'Bem-vindo ao Comparify',
    description: 'Organize suas compras e economize dinheiro comparando preços entre supermercados.',
  },
  {
    title: 'Crie suas listas',
    description: 'Monte listas de compras personalizadas para cada ocasião.',
  },
  {
    title: 'Compare preços',
    description: 'Compare preços entre mercados e faça a melhor escolha.',
  },
  {
    title: 'Economize de verdade',
    description: 'Acompanhe quanto está economizando e tome melhores decisões.',
  },
];

const Onboarding = () => {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (current < slides.length - 1) {
      setCurrent((prev) => prev + 1);
    } else {
      navigate('/login');
    }
  };

  const handleSkip = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-between px-6 py-10">
      {/* Parte superior: logo */}
      <div className="mt-10">
        <img
          src="/COMPARAFY.png"
          alt="Comparify"
          className="w-36 h-auto object-contain"
        />
      </div>

      {/* Texto centralizado no meio da tela */}
      <div className="flex-1 flex flex-col justify-center items-center text-center px-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          {slides[current].title}
        </h2>
        <p className="text-gray-600 text-base">{slides[current].description}</p>

        {/* Indicadores */}
        <div className="flex gap-2 mt-6">
          {slides.map((_, index) => (
            <span
              key={index}
              className={`h-2 w-2 rounded-full ${
                index === current ? 'bg-yellow-400' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Botões inferiores */}
      <div className="w-full px-4 mb-6">
        <button
          onClick={handleNext}
          className="w-full py-3 bg-yellow-400 text-black font-semibold rounded-xl"
        >
          {current < slides.length - 1 ? 'Próximo' : 'Começar'}
        </button>
        <div className="mt-3 text-center">
          <button
            onClick={handleSkip}
            className="text-sm text-gray-500 underline"
          >
            Pular
          </button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
