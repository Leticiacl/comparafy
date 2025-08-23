import React from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardDocumentListIcon, QrCodeIcon, BanknotesIcon } from "@heroicons/react/24/outline";

type Slide = {
  title: string;
  subtitle: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const slides: Slide[] = [
  { title: "Crie suas listas de compras", subtitle: "Organize o que precisa e acompanhe tudo em um só lugar.", Icon: ClipboardDocumentListIcon },
  { title: "Escaneie suas compras", subtitle: "Adicione suas compras apenas escaneando sua notinha.", Icon: QrCodeIcon },
  { title: "Economize de verdade", subtitle: "Acompanhe histórico e planeje suas compras.", Icon: BanknotesIcon }
];

const Onboarding: React.FC = () => {
  const nav = useNavigate();
  const [idx, setIdx] = React.useState(0);

  const finish = React.useCallback(() => {
    try { localStorage.setItem("onboardingSeen", "1"); } catch {}
    nav("/login", { replace: true });
  }, [nav]);

  const next = () => (idx < slides.length - 1 ? setIdx(i => i + 1) : finish());
  const skip = finish;

  const { title, subtitle, Icon } = slides[idx];

  return (
    <div className="onboarding-shell mx-auto flex min-h-screen max-w-xl flex-col items-center bg-white px-6">
      {/* logo */}
      <img src="/COMPARAFY.png" alt="Comparafy" className="mx-auto h-7 w-auto" draggable={false} />

      {/* conteúdo */}
      <div className="flex w-full flex-1 flex-col items-center justify-center text-center">
        <div className="mb-6 rounded-full bg-yellow-100 p-5">
          <Icon className="h-9 w-9 text-yellow-600" />
        </div>

        <h1 className="mb-3 px-4 text-3xl font-extrabold text-gray-900">{title}</h1>
        <p className="px-6 text-base leading-relaxed text-gray-600">{subtitle}</p>

        <div className="mt-5 flex items-center gap-2">
          {slides.map((_, i) => (
            <span key={i} className={`h-2 w-2 rounded-full ${i === idx ? "bg-yellow-500" : "bg-gray-300"}`} />
          ))}
        </div>
      </div>

      {/* CTAs */}
      <button
        onClick={next}
        className="mt-4 w-full rounded-2xl bg-yellow-500 py-3 text-center text-base font-semibold text-black active:scale-[0.99]"
      >
        {idx < slides.length - 1 ? "Próximo" : "Começar"}
      </button>
      <button onClick={skip} className="mt-3 text-sm font-medium text-gray-500 underline-offset-4 hover:underline">
        Pular
      </button>
    </div>
  );
};

export default Onboarding;
