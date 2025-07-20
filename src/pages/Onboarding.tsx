import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const slides = [
  {
    title: 'Organize suas compras',
    image: '/slide1.png',
    description: 'Crie listas personalizadas e mantenha tudo sob controle ao fazer compras.',
  },
  {
    title: 'Compare preços',
    image: '/slide2.png',
    description: 'Veja onde cada item está mais barato e economize de verdade.',
  },
  {
    title: 'Acompanhe seus gastos',
    image: '/slide3.png',
    description: 'Visualize o quanto já economizou e planeje melhor suas finanças.',
  },
];

const Onboarding: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="flex flex-col items-center justify-between min-h-screen bg-white px-6 pt-12 pb-10">
      {/* Logo */}
      <img src="/COMPARAFY.png" alt="Comparify" className="w-32 h-auto mb-4" />

      {/* Slide content */}
      <div className="text-center">
        <img
          src={slides[currentSlide].image}
          alt={slides[currentSlide].title}
          className="w-64 h-64 object-contain mx-auto mb-6"
        />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{slides[currentSlide].title}</h2>
        <p className="text-gray-500 text-base max-w-md mx-auto">{slides[currentSlide].description}</p>
      </div>

      {/* Indicadores de progresso */}
      <div className="flex items-center justify-center gap-2 mt-6">
        {slides.map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full ${i === currentSlide ? 'bg-yellow-500' : 'bg-gray-300'}`}
          />
        ))}
      </div>

      {/* Botão */}
      <button
        onClick={nextSlide}
        className="mt-8 w-full max-w-md bg-yellow-500 text-black font-semibold py-3 px-6 rounded-xl shadow"
      >
        {currentSlide === slides.length - 1 ? 'Começar' : 'Próximo'}
      </button>
    </div>
  );
};

export default Onboarding;
