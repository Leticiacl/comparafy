import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  const slides = [
    {
      title: "Crie listas de compras",
      description:
        "Adicione produtos, quantidades e acompanhe quanto vai gastar antes mesmo de ir ao mercado.",
      image: "/slide1.png",
    },
    {
      title: "Compare preços",
      description: "Veja qual supermercado está mais barato e economize na sua compra.",
      image: "/slide2.png",
    },
    {
      title: "Acompanhe suas economias",
      description: "Veja quanto está economizando em cada lista e acompanhe sua evolução.",
      image: "/slide3.png",
    },
  ];

  const handleNext = () => {
    if (step < slides.length - 1) {
      setStep((s) => s + 1);
    } else {
      navigate("/login");
    }
  };

  const handleSkip = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-between px-6 py-10 bg-white">
      {/* Logo */}
      <img
        src="/COMPARAFY.png"
        alt="Comparafy"
        className="w-32 mb-6 mt-4"
      />

      {/* Slide */}
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <img
          src={slides[step].image}
          alt={slides[step].title}
          className="w-32 h-32 object-contain mb-6"
        />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {slides[step].title}
        </h2>
        <p className="text-gray-500 text-base">{slides[step].description}</p>
        {/* Indicadores */}
        <div className="flex justify-center mt-6 space-x-2">
          {slides.map((_, idx) => (
            <span
              key={idx}
              className={`h-2 w-2 rounded-full ${
                idx === step ? "bg-yellow-400" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Botão */}
      <button
        onClick={handleNext}
        className="bg-yellow-400 text-black font-medium w-full py-4 rounded-xl mb-4 shadow"
      >
        {step === slides.length - 1 ? "Começar" : "Próximo"}
      </button>

      {/* Pular */}
      <button
        onClick={handleSkip}
        className="text-gray-500 text-sm underline mb-2"
      >
        Pular
      </button>
    </div>
  );
};

export default Onboarding;
