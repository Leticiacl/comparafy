import React from "react";

/**
 * Mostra um botão "Instalar" apenas quando o navegador
 * dispara o evento `beforeinstallprompt` (PWA instalável).
 * Em iOS/Safari esse evento não existe → o botão some.
 */
export default function InstallButton({
  className = "",
  label = "Instalar",
}: {
  className?: string;
  label?: string;
}) {
  const [deferred, setDeferred] = React.useState<any>(null);

  React.useEffect(() => {
    const onBeforeInstall = (e: Event) => {
      // cancela o banner nativo e guarda para disparar sob-demanda
      (e as any).preventDefault?.();
      setDeferred(e);
    };
    const onInstalled = () => setDeferred(null);

    window.addEventListener("beforeinstallprompt", onBeforeInstall as any);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall as any);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const handleClick = async () => {
    if (!deferred) return;
    (deferred as any).prompt?.();
    try {
      await (deferred as any).userChoice;
    } catch {}
    setDeferred(null);
  };

  if (!deferred) return null;

  return (
    <button
      onClick={handleClick}
      className={`rounded-xl bg-yellow-500 px-3 py-2 text-sm font-medium text-black hover:brightness-95 ${className}`}
    >
      {label}
    </button>
  );
}
