// src/pages/Onboarding.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Slide {
  image: string;
  title: string;
  description: string;
}

const slides: Slide[] = [
  {
    image: '/slide1.png',
    title: 'Organize suas compras',
    description: 'Monte listas personalizadas e economize tempo no supermercado.',
  },
  {
    image: '/slide2.png',
    title: 'Compare preços',
    description: 'Veja qual mercado tem os melhores preços para seus produtos.',
  },
  {
    image: '/slide3.png',
    title: 'Economize mais',
    description: 'Acompanhe seu histórico de economia a cada compra realizada.',
  },
];

const Onboarding: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentIndex === slides.length - 1) {
      navigate('/login');
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  return (
    <div className="flex flex-col justify-between items-center min-h-screen bg-white px-6 py-10 text-center">
      <div className="flex flex-col items-center">
        <img
          src={slides[currentIndex].image}
          alt={slides[currentIndex].title}
          className="w-64 h-64 object-contain mb-6"
        />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {slides[currentIndex].title}
        </h2>
        <p className="text-gray-600 max-w-sm">{slides[currentIndex].description}</p>
      </div>

      {/* Indicador de progresso */}
      <div className="flex gap-2 mt-6">
        {slides.map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full ${
              i === currentIndex ? 'bg-yellow-500' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>

      {/* Botão */}
      <button
        onClick={handleNext}
        className="mt-8 w-full max-w-md bg-yellow-500 text-black font-semibold py-3 px-6 rounded-xl shadow"
      >
        {currentIndex === slides.length - 1 ? 'Começar' : 'Avançar'}
      </button>
    </div>
  );
};

export default Onboarding;
