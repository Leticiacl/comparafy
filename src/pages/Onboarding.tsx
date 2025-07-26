import { useState } from "react";
import { useNavigate } from "react-router-dom";

const slide1 = "/slide1.png";
const slide2 = "/slide2.png";
const slide3 = "/slide3.png";

const slides = [
  {
    image: slide1,
    title: "Compare preços facilmente",
    description: "Crie listas de compras e veja qual mercado é mais barato.",
  },
  {
    image: slide2,
    title: "Organize suas compras",
    description: "Visualize, edite e marque os itens conforme compra.",
  },
  {
    image: slide3,
    title: "Economize de verdade",
    description: "Acompanhe sua economia real ao comparar preços.",
  },
];

export default function Onboarding() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6 text-center">
      <img src={slides[currentSlide].image} alt="Slide" className="w-64 h-64 object-contain mb-8" />
      <h2 className="text-2xl font-bold mb-4">{slides[currentSlide].title}</h2>
      <p className="text-gray-600 mb-8">{slides[currentSlide].description}</p>
      <div className="flex gap-2 mb-6">
        {slides.map((_, index) => (
          <span
            key={index}
            className={`w-3 h-3 rounded-full ${
              index === currentSlide ? "bg-yellow-400" : "bg-gray-300"
            }`}
          ></span>
        ))}
      </div>
      <button
        onClick={nextSlide}
        className="bg-yellow-400 text-black font-semibold px-6 py-3 rounded-full shadow"
      >
        {currentSlide === slides.length - 1 ? "Começar" : "Avançar"}
      </button>
    </div>
  );
}
