import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const slides = [
  {
    image: "/slide1.png",
    title: "Organize suas compras",
    description:
      "Crie listas personalizadas e mantenha tudo sob controle ao fazer compras.",
  },
  {
    image: "/slide2.png",
    title: "Compare preços facilmente",
    description:
      "Compare os preços dos produtos entre diferentes supermercados.",
  },
  {
    image: "/slide3.png",
    title: "Economize mais",
    description:
      "Descubra onde comprar mais barato e acompanhe sua economia total.",
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
    <div className="flex flex-col min-h-screen bg-white px-6 pt-10 pb-8">
      <div className="flex justify-center">
        <img
          src="/COMPARAFY.png"
          alt="Comparafy"
          className="h-10 object-contain"
        />
      </div>

      <div className="flex flex-col items-center justify-center flex-grow">
        <img
          src={slides[currentSlide].image}
          alt="Onboarding"
          className="w-52 h-52 object-contain mb-8"
        />
        <h2 className="text-xl font-bold text-center text-gray-900 mb-3">
          {slides[currentSlide].title}
        </h2>
        <p className="text-center text-gray-500 text-base max-w-sm">
          {slides[currentSlide].description}
        </p>

        {/* Indicadores */}
        <div className="flex space-x-2 mt-8">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full ${
                index === currentSlide ? "bg-yellow-500" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Botão */}
      <button
        onClick={handleNext}
        className="bg-yellow-500 text-black font-semibold py-3 rounded-xl shadow text-center mt-6"
      >
        {currentSlide === slides.length - 1 ? "Começar" : "Próximo"}
      </button>
    </div>
  );
};

export default Onboarding;
