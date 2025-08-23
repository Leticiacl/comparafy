import React from "react";

/**
 * Mostra "Instalar" quando o navegador dispara `beforeinstallprompt`.
 * Em iOS (Safari) não aparece (Apple não suporta) — use o guia "Como instalar".
 */
const InstallButton: React.FC = () => {
  const [promptEvent, setPromptEvent] = React.useState<any>(null);
  const [canInstall, setCanInstall] = React.useState(false);

  React.useEffect(() => {
    // Oculta se já estiver instalado
    const isStandalone =
      window.matchMedia?.("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone;
    if (isStandalone) return;

    const onBIP = (e: any) => {
      e.preventDefault();
      setPromptEvent(e);
      setCanInstall(true);
    };
    window.addEventListener("beforeinstallprompt", onBIP);
    return () => window.removeEventListener("beforeinstallprompt", onBIP);
  }, []);

  if (!canInstall) return null;

  const onClick = async () => {
    try {
      await promptEvent.prompt();
      await promptEvent.userChoice;
    } catch {}
    setCanInstall(false);
    setPromptEvent(null);
  };

  return (
    <button
      onClick={onClick}
      className="rounded-xl bg-yellow-500 px-3 py-2 text-sm font-medium text-black hover:brightness-95"
    >
      Instalar
    </button>
  );
};

export default InstallButton;
