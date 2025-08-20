import React from "react";
import { useNavigate } from "react-router-dom";

/**
 * Onboarding no estilo original:
 * - Cabeçalho simples: nome do app à esquerda e "Pular" à direita
 * - Conteúdo central, sem card/caixa
 * - Indicadores (bolinhas) ao centro
 * - CTA "Próximo" fixo na base; no último slide vira "Começar"
 * - Fluxo: apenas ao finalizar OU pular -> grava onboardingSeen=1 e vai para /login
 */

const slides = [
  {
    icon: "🛒",
    title: "Bem-vinda ao Comparafy",
    desc: "Crie listas, registre compras e compare preços em segundos.",
  },
  {
    icon: "📝",
    title: "Liste e controle",
    desc: "Monte listas, marque itens comprados e acompanhe o total gasto.",
  },
  {
    icon: "💸",
    title: "Compare e economize",
    desc: "Veja onde está mais barato e acompanhe seus gastos por mercado.",
  },
];

const Onboarding: React.FC = () => {
  const [index, setIndex] = React.useState(0);
  const navigate = useNavigate();

  const next = () => {
    if (index < slides.length - 1) {
      setIndex((i) => i + 1);
    } else {
      // terminou
      localStorage.setItem("onboardingSeen", "1");
      navigate("/login", { replace: true });
    }
  };

  const skip = () => {
    localStorage.setItem("onboardingSeen", "1");
    navigate("/login", { replace: true });
  };

  const s = slides[index];

  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col bg-white px-6 pb-8 pt-10">
      {/* header */}
      <div className="mb-10 flex items-center justify-between">
        <div className="text-2xl font-extrabold text-gray-900">Comparafy</div>
        <button
          onClick={skip}
          className="rounded-lg px-2 py-1 text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          Pular
        </button>
      </div>

      {/* conteúdo central */}
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="mb-4 text-5xl leading-none">{s.icon}</div>
        <h1 className="mx-auto mb-2 max-w-[24ch] text-3xl font-extrabold text-gray-900">
          {s.title}
        </h1>
        <p className="mx-auto max-w-[36ch] text-base text-gray-600">{s.desc}</p>

        {/* indicadores */}
        <div className="mt-6 flex items-center gap-2">
          {slides.map((_, i) => (
            <span
              key={i}
              className={
                "h-2 w-2 rounded-full " +
                (i === index ? "bg-yellow-500" : "bg-gray-300")
              }
            />
          ))}
        </div>
      </div>

      {/* CTA base */}
      <button
        onClick={next}
        className="mt-8 w-full rounded-xl bg-yellow-500 py-3 text-center text-base font-semibold text-black active:scale-[.995]"
      >
        {index < slides.length - 1 ? "Próximo" : "Começar"}
      </button>
    </div>
  );
};

export default Onboarding;
