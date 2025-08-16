import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const slides = [
  {
    title: "Crie listas de compras",
    description:
      "Adicione produtos, quantidades e acompanhe quanto vai gastar antes mesmo de ir ao mercado.",
    image: "/slide1.png",
  },
  {
    title: "Compare preços",
    description:
      "Veja qual supermercado está mais barato e economize na sua compra.",
    image: "/slide2.png",
  },
  {
    title: "Acompanhe suas economias",
    description:
      "Veja quanto está economizando em cada lista e acompanhe sua evolução.",
    image: "/slide3.png",
  },
];

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  const handleNext = () => {
    if (step < slides.length - 1) {
      setStep((s) => s + 1);
    } else {
      navigate("/login", { replace: true });
    }
  };

  const handleSkip = () => navigate("/login", { replace: true });

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-between px-6 py-10">
      <img src="/COMPARAFY.png" alt="Comparafy" className="w-32 mt-4" />

      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <img
          src={slides[step].image}
          alt={slides[step].title}
          className="w-40 h-40 object-contain mb-6"
        />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {slides[step].title}
        </h2>
        <p className="text-gray-500">{slides[step].description}</p>

        <div className="flex mt-6 space-x-2">
          {slides.map((_, i) => (
            <span
              key={i}
              className={`h-2 w-2 rounded-full ${
                i === step ? "bg-yellow-400" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>

      <button
        onClick={handleNext}
        className="w-full bg-yellow-400 text-black font-medium py-4 rounded-xl shadow mb-4"
      >
        {step === slides.length - 1 ? "Começar" : "Próximo"}
      </button>

      <button onClick={handleSkip} className="text-gray-500 underline">
        Pular
      </button>
    </div>
  );
};

export default Onboarding;
