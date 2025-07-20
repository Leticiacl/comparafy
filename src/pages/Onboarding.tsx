// src/pages/Onboarding.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const slides = [
  {
    image: "/slide1.png",
    title: "Organize suas compras",
    description: "Crie listas personalizadas e mantenha tudo sob controle ao fazer compras.",
  },
  {
    image: "/slide2.png",
    title: "Compare preços facilmente",
    description: "Adicione produtos e compare os preços em diferentes mercados.",
  },
  {
    image: "/slide3.png",
    title: "Economize de verdade",
    description: "Veja quanto está economizando em tempo real e maximize seu orçamento.",
  },
];

const Onboarding: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="flex flex-col h-screen justify-between px-6 py-10 bg-white">
      <div className="flex justify-center">
        <img
          src="/COMPARAFY.png"
          alt="Logo Comparafy"
          className="w-32 h-auto"
        />
      </div>

      <div className="flex flex-col items-center justify-center flex-grow text-center">
        <img
          src={slides[currentSlide].image}
          alt={slides[currentSlide].title}
          className="max-w-[200px] max-h-[200px] mb-6 object-contain"
          style={{ imageRendering: "auto" }}
        />
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          {slides[currentSlide].title}
        </h2>
        <p className="text-gray-500 px-4">{slides[currentSlide].description}</p>
      </div>

      <div className="flex flex-col items-center gap-6">
        <div className="flex gap-2">
          {slides.map((_, index) => (
            <span
              key={index}
              className={`w-3 h-3 rounded-full ${
                index === currentSlide ? "bg-yellow-500" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
        <button
          onClick={handleNext}
          className="w-full bg-yellow-500 text-black font-semibold py-3 rounded-xl shadow text-base"
        >
          {currentSlide === slides.length - 1 ? "Começar" : "Próximo"}
        </button>
      </div>
    </div>
  );
};

export default Onboarding;
