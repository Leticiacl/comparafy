import { useState } from "react";
import { useNavigate } from "react-router-dom";

const slides = [
  { title: "Compare preços", desc: "Descubra onde está mais barato antes de sair de casa.", emoji: "🔎" },
  { title: "Escaneie e organize", desc: "Adicione itens por código de barras ou NFC-e.", emoji: "🧾" },
  { title: "Economize de verdade", desc: "Acompanhe histórico e planeje suas compras.", emoji: "💸" },
];

export default function Onboarding() {
  const [i, setI] = useState(0);
  const nav = useNavigate();

  const next = () => (i < slides.length - 1 ? setI(i + 1) : finish());
  const finish = () => {
    localStorage.setItem("onboardingSeen", "1");
    nav("/login", { replace: true });
  };

  const s = slides[i];

  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col bg-white px-6 pb-10 pt-10">
      {/* topo enxuto */}
      <div className="mb-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/LOGO_REDUZIDA.png" alt="Comparafy" className="h-7 w-7" />
          <span className="text-lg font-extrabold">Comparafy</span>
        </div>
        <button onClick={finish} className="rounded px-2 py-1 text-sm text-gray-500 hover:bg-gray-100">
          Pular
        </button>
      </div>

      {/* conteúdo */}
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="mb-4 text-5xl">{s.emoji}</div>
        <h2 className="mb-1 text-2xl font-bold">{s.title}</h2>
        <p className="max-w-[34ch] text-gray-600">{s.desc}</p>

        {/* indicadores */}
        <div className="mt-6 flex items-center gap-2">
          {slides.map((_, idx) => (
            <span
              key={idx}
              className={`h-2 w-2 rounded-full ${idx === i ? "bg-yellow-500" : "bg-gray-300"}`}
            />
          ))}
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={next}
        className="mt-8 w-full rounded-xl bg-yellow-500 py-3 font-semibold text-black active:scale-[.99]"
      >
        {i < slides.length - 1 ? "Próximo" : "Começar"}
      </button>
    </div>
  );
}
