// src/pages/PurchasesReceipt.tsx
import React, { useEffect, useRef, useState } from "react";
import BottomNav from "../components/BottomNav";
import { useData } from "../context/DataContext";
import { BrowserQRCodeReader, IScannerControls } from "@zxing/browser";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

function isLikelyNfceUrl(text: string) {
  try {
    const u = new URL(text);
    const host = u.hostname.toLowerCase();
    // Portais comuns (cada UF tem um)
    return (
      host.includes("sefaz") ||
      host.includes("fazenda") ||
      host.includes("nfe") ||
      host.includes("nfce")
    );
  } catch {
    return false;
  }
}

function guessMarketFromHost(host: string) {
  // nome simples a partir do host do portal da NFC-e
  const h = host.toLowerCase();
  if (h.includes("mg") || h.includes("minas")) return "NFC-e MG";
  if (h.includes("sp") || h.includes("paul")) return "NFC-e SP";
  if (h.includes("rj")) return "NFC-e RJ";
  if (h.includes("rs")) return "NFC-e RS";
  return "NFC-e";
}

const PurchasesReceipt: React.FC = () => {
  const navigate = useNavigate();
  const { createPurchaseFromReceiptInContext, appendItemsToPurchaseInContext } = useData() as any;
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);

  const [scanning, setScanning] = useState(false);
  const [busy, setBusy] = useState(false);

  // inicia scanner
  const startScan = async () => {
    try {
      setScanning(true);
      const reader = new BrowserQRCodeReader();
      controlsRef.current = await reader.decodeFromVideoDevice(
        undefined, // câmera padrão (traseira em mobile)
        videoRef.current!,
        (result, err, controls) => {
          if (result) {
            controls.stop();
            controlsRef.current = null;
            setScanning(false);
            handleDecoded(result.getText());
          }
          // ignore 'err' de frames sem QR
        }
      );
    } catch (e) {
      console.error(e);
      setScanning(false);
      toast.error("Não foi possível acessar a câmera.");
    }
  };

  const stopScan = () => {
    controlsRef.current?.stop();
    controlsRef.current = null;
    setScanning(false);
  };

  useEffect(() => {
    return () => {
      // cleanup ao sair
      controlsRef.current?.stop();
    };
  }, []);

  // quando decodificar o QR
  const handleDecoded = async (text: string) => {
    try {
      if (!isLikelyNfceUrl(text)) {
        toast.error("QR lido não parece ser de uma NFC-e.");
        return;
      }

      const u = new URL(text);
      const market = guessMarketFromHost(u.hostname);
      const name = "Compra (QR Code)";
      const date = new Date();

      setBusy(true);

      // cria a compra vazia primeiro
      await createPurchaseFromReceiptInContext({
        name,
        market,
        date,
      });

      // chama a função de parsing (Cloud Function ou outro endpoint)
      const endpoint =
        import.meta.env.VITE_PARSE_NFCE_URL ||
        import.meta.env.VITE_FUNCTIONS_PARSE_NFCE_URL; // use qualquer uma configurada

      if (!endpoint) {
        setBusy(false);
        toast("Compra criada. Configure VITE_PARSE_NFCE_URL para importar itens.");
        navigate("/purchases");
        return;
      }

      const resp = await fetch(`${endpoint}?url=${encodeURIComponent(text)}`);
      if (!resp.ok) {
        throw new Error("Falha ao chamar o parser");
      }
      const data = await resp.json();

      // data.items = [{ nome, quantidade, unidade, preco }]
      const items = Array.isArray(data.items) ? data.items : [];

      if (!items.length) {
        setBusy(false);
        toast("Compra criada, mas não encontrei itens na nota.");
        navigate("/purchases");
        return;
      }

      // adiciona itens à última compra criada (no topo da lista)
      const createdId = await appendItemsToPurchaseInContext(items);
      setBusy(false);
      toast.success("Compra criada a partir do QR Code!");
      navigate("/purchases");
    } catch (e) {
      console.error(e);
      setBusy(false);
      toast.error("Erro ao processar o QR Code.");
    }
  };

  return (
    <div className="p-4 pb-28 max-w-xl mx-auto bg-white">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Nova compra (QR Code)</h1>
        <img src="/LOGO_REDUZIDA.png" alt="Logo" className="h-8" />
      </div>

      <div className="space-y-4">
        <div className="rounded-xl border border-gray-200 p-4">
          <p className="text-gray-600 mb-3">
            Aponte a câmera para o QR Code da sua nota fiscal eletrônica (NFC-e).
          </p>

          <div className="aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center">
            <video ref={videoRef} className="w-full h-full" muted playsInline />
          </div>

          <div className="flex gap-2 mt-3">
            {!scanning ? (
              <button
                onClick={startScan}
                className="flex-1 bg-yellow-500 text-black font-medium py-2 rounded-lg"
              >
                Iniciar scanner
              </button>
            ) : (
              <button
                onClick={stopScan}
                className="flex-1 bg-gray-200 text-gray-800 font-medium py-2 rounded-lg"
              >
                Parar
              </button>
            )}
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 rounded-lg border"
            >
              Voltar
            </button>
          </div>
        </div>

        {busy && (
          <div className="text-center text-sm text-gray-600">
            Processando itens da nota…
          </div>
        )}
      </div>

      <BottomNav activeTab="purchases" />
    </div>
  );
};

export default PurchasesReceipt;
