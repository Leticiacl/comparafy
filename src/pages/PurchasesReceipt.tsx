// src/pages/PurchasesReceipt.tsx
import React, { useMemo, useRef, useState } from "react";
import BottomNav from "../components/BottomNav";
import { useData } from "../context/DataContext";
import { useNavigate } from "react-router-dom";
import { Scanner } from "@yudiel/react-qr-scanner";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function isLikelyNfceUrl(text: string) {
  if (!text) return false;
  const t = text.trim();
  // URLs comuns de NFC-e (variam por estado). Ex.: .../QRCode?p=..., ...?chNFe=...
  return (
    /^https?:\/\//i.test(t) &&
    (t.includes("nfce") || t.includes("QRCode") || t.includes("chNFe=") || t.includes("?p="))
  );
}

const PurchasesReceipt: React.FC = () => {
  const { createPurchaseFromReceiptInContext } = useData();
  const nav = useNavigate();

  const [name, setName] = useState("");
  const [market, setMarket] = useState("");
  const [date, setDate] = useState<string>(todayISO());

  const [isScanning, setIsScanning] = useState(false);
  const [lastScan, setLastScan] = useState<string>("");

  // impede múltiplos disparos para o mesmo QR no onResult (que pode chamar mais de uma vez)
  const lastHandled = useRef<string>("");

  const canCreate = useMemo(
    () => name.trim().length > 0 && market.trim().length > 0 && date,
    [name, market, date]
  );

  async function createPurchaseAndGo(msg?: string) {
    await createPurchaseFromReceiptInContext({
      name: name.trim(),
      market: market.trim(),
      date: new Date(date),
    });
    if (msg) {
      // mensagem discreta (sem “códigos” na tela)
      console.info(msg);
    }
    nav("/purchases");
  }

  async function handleManualCreate() {
    if (!canCreate) {
      alert("Preencha Nome e Mercado para continuar.");
      return;
    }
    await createPurchaseAndGo();
  }

  async function handleScanResult(text: string) {
    if (!text || text === lastHandled.current) return;
    lastHandled.current = text;
    setLastScan(text);

    if (!canCreate) {
      alert("Antes de escanear, preencha Nome e Mercado.");
      setIsScanning(false);
      return;
    }

    // Valida se parece NFC-e
    if (!isLikelyNfceUrl(text)) {
      alert("QR lido, mas não parece um QR de NFC-e. Tente novamente.");
      return;
    }

    setIsScanning(false);

    // TODO: (backend) enviar `text` para sua Cloud Function que faz:
    // 1) busca da página da NFC-e (server-side, sem CORS)
    // 2) parse dos itens/preços
    // 3) cria a compra com itens já preenchidos
    //
    // Enquanto isso, criamos a compra “vazia” (nome/mercado/data) para não travar o fluxo:
    await createPurchaseAndGo("QR lido com sucesso. Integração de itens virá do backend.");
  }

  return (
    <div className="p-4 pb-28 max-w-xl mx-auto">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Cupom fiscal</h1>
        <img src="/LOGO_REDUZIDA.png" alt="Logo" className="h-8" />
      </div>

      {/* Card principal */}
      <div className="mt-4 border rounded-2xl p-4">
        {/* Nome */}
        <label className="block text-sm text-gray-700 mb-1">Nome da compra *</label>
        <input
          className="w-full border rounded-lg px-3 py-2 mb-3"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex.: Compra do mês"
        />

        {/* Mercado */}
        <label className="block text-sm text-gray-700 mb-1">Mercado *</label>
        <input
          className="w-full border rounded-lg px-3 py-2 mb-3"
          value={market}
          onChange={(e) => setMarket(e.target.value)}
          placeholder="Ex.: Carrefour"
        />

        {/* Data */}
        <label className="block text-sm text-gray-700 mb-1">Data *</label>
        <input
          type="date"
          className="w-full border rounded-lg px-3 py-2 mb-4"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        {/* Botões */}
        <div className="flex gap-3">
          <button
            className="flex-1 bg-yellow-500 text-black py-3 rounded-xl font-medium shadow disabled:opacity-60"
            onClick={() => {
              if (!canCreate) return alert("Preencha Nome e Mercado.");
              setIsScanning(true);
            }}
            disabled={!canCreate}
          >
            Escanear QR Code
          </button>

          <button
            className="flex-1 bg-gray-100 text-gray-900 py-3 rounded-xl font-medium"
            onClick={handleManualCreate}
          >
            Criar sem QR
          </button>
        </div>

        {/* Dica discreta */}
        {lastScan ? (
          <p className="text-xs text-gray-500 mt-3">
            Último QR lido: {lastScan.slice(0, 48)}{lastScan.length > 48 ? "…" : ""}
          </p>
        ) : null}
      </div>

      {/* Modal de Scanner */}
      {isScanning && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-3">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold">Aponte para o QR do cupom</h2>
              <button
                className="text-sm text-gray-600 px-2 py-1 rounded hover:bg-gray-100"
                onClick={() => setIsScanning(false)}
              >
                Fechar
              </button>
            </div>

            <div className="overflow-hidden rounded-xl border">
              <Scanner
                components={{ audio: false }}
                constraints={{ facingMode: "environment" }}
                onResult={(text) => {
                  if (typeof text === "string") handleScanResult(text);
                }}
                onError={(err) => {
                  console.error("QR error:", err);
                }}
              />
            </div>

            <p className="text-xs text-gray-500 mt-2">
              A câmera pode pedir permissão. Certifique-se de estar em um ambiente bem iluminado.
            </p>
          </div>
        </div>
      )}

      <BottomNav activeTab="purchases" />
    </div>
  );
};

export default PurchasesReceipt;
