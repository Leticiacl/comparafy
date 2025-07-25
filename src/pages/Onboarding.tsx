// src/pages/Onboarding.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const slides = [
  {
    image: "/slide1.png",
    title: "Compare preços",
    description: "Economize comparando preços entre mercados.",
  },
  {
    image: "/slide2.png",
    title: "Crie listas inteligentes",
    description: "Organize suas compras com listas personalizadas.",
  },
  {
    image: "/slide3.png",
    title: "Veja seu progresso",
    description: "Acompanhe seus gastos e itens comprados.",
  },
];

export default function Onboarding() {
  const [index, setIndex] = useState(0);
  const navigate = useNavigate();

  const nextSlide = () => {
    if (index < slides.length - 1) {
      setIndex(index + 1);
    } else {
      navigate("/"); // Vai para tela de login
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
      <img
        src={slides[index].image}
        alt="Slide"
        className="w-48 h-48 object-contain mb-8"
      />
      <h1 className="text-2xl font-bold mb-2">{slides[index].title}</h1>
      <p className="text-gray-600 mb-8">{slides[index].description}</p>

      <div className="flex space-x-2 mb-8">
        {slides.map((_, i) => (
          <span
            key={i}
            className={`w-3 h-3 rounded-full ${
              i === index ? "bg-yellow-500" : "bg-gray-300"
            }`}
          />
        ))}
      </div>

      <button
        onClick={nextSlide}
        className="bg-yellow-500 text-black font-semibold py-3 px-6 rounded-xl shadow"
      >
        {index === slides.length - 1 ? "Começar" : "Próximo"}
      </button>
    </div>
  );
}
