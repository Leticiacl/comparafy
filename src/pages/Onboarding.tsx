import React from "react";
import { useNavigate } from "react-router-dom";

const slides = [
  { img: "/slide1.png", title: "Compare preços", desc: "Veja onde está mais barato antes de sair de casa." },
  { img: "/slide2.png", title: "Escaneie códigos", desc: "Adicione itens por código de barras ou cupom fiscal." },
  { img: "/slide3.png", title: "Economize de verdade", desc: "Acompanhe sua economia e histórico de preços." },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [idx, setIdx] = React.useState(0);

  const finish = () => {
    localStorage.setItem("onboardingSeen", "1");
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-between px-6 py-10">
      <div className="w-full max-w-sm flex-1 flex flex-col items-center justify-center text-center">
        <img src={slides[idx].img} alt="" className="w-56 h-56 object-contain mb-6" />
        <h2 className="text-2xl font-semibold mb-2">{slides[idx].title}</h2>
        <p className="text-gray-600">{slides[idx].desc}</p>
      </div>

      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-6">
          {slides.map((_, i) => (
            <span
              key={i}
              className={`w-2.5 h-2.5 rounded-full ${i === idx ? "bg-yellow-500" : "bg-gray-300"}`}
            />
          ))}
        </div>

        {idx < slides.length - 1 ? (
          <div className="flex gap-3">
            <button
              onClick={finish}
              className="flex-1 py-3 border rounded-lg font-medium"
            >
              Pular
            </button>
            <button
              onClick={() => setIdx((v) => v + 1)}
              className="flex-1 py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-lg"
            >
              Próximo
            </button>
          </div>
        ) : (
          <button
            onClick={finish}
            className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-lg"
          >
            Começar
          </button>
        )}
      </div>
    </div>
  );
}
