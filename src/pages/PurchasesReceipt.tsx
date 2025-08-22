// src/pages/PurchasesReceipt.tsx
import { useEffect, useRef, useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import BottomNav from "@/components/BottomNav";
import PageHeader from "@/components/ui/PageHeader";
import { useData } from "@/context/DataContext";
import { parseNFCeFromUrl, ReceiptParseResult } from "@/services/nfceParser";

const brl = (v?: number) =>
  (v ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function extractUrl(payload: unknown): string | null {
  const raw =
    typeof payload === "string"
      ? payload
      : Array.isArray(payload) && payload[0]?.rawValue
      ? String(payload[0].rawValue)
      : (payload as any)?.rawValue || String((payload as any)?.[0] || "");
  const m = String(raw).match(/https?:\/\/\S+/i);
  return m ? m[0].replace(/[)\]}>.,;]*$/, "") : null;
}

export default function PurchasesReceipt() {
  const nav = useNavigate();
  const { createPurchaseFromReceiptInContext } = useData();

  const [scanning, setScanning] = useState(true);
  const [loading, setLoading] = useState(false);
  const [parsed, setParsed] = useState<ReceiptParseResult | null>(null);
  const [market, setMarket] = useState("");
  const [listName, setListName] = useState("");
  const [showAll, setShowAll] = useState(false);

  const lastScan = useRef(0);

  const handleScan = async (detected: any) => {
    const now = Date.now();
    if (now - lastScan.current < 1500) return;
    lastScan.current = now;

    const url = extractUrl(detected);
    if (!url) return;

    setScanning(false);
    setLoading(true);
    try {
      const data = await parseNFCeFromUrl(url);
      setParsed(data);
      setMarket(data.market || "");
      setListName(data.name || "");
      const n = data.totalItems ?? data.itens.length;
      toast.success(n ? `QR lido! ${n} item(ns) detectado(s).` : "QR lido!");
    } catch (e) {
      console.error(e);
      toast.error("Falha ao processar a NFC-e.");
      setScanning(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!parsed) return;
    setLoading(true);
    try {
      await createPurchaseFromReceiptInContext({
        name: listName || "Compra (NFC-e)",
        market: market || "—",
        date: parsed.date || new Date(),
        itens: parsed.itens || [],
      });
      toast.success("Compra importada!");
      nav("/purchases");
    } catch (e) {
      console.error(e);
      toast.error("Falha ao salvar a compra.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => setScanning(true), []);

  const previewCount = parsed?.totalItems ?? parsed?.itens?.length ?? 0;

  // >>> NOVO: total do card com fallback calculado pelos itens
  const computedTotal =
    parsed?.grandTotal ??
    +(parsed?.itens?.reduce((acc, it) => {
      const totalLinha =
        (typeof it.total === "number" && it.total) ||
        (Number(it.preco) || 0) * (Number(it.quantidade) || 1);
      return acc + totalLinha;
    }, 0) ?? 0).toFixed(2);

  return (
    <div className="mx-auto max-w-xl bg-white p-4 pb-32">
      <PageHeader title="Importar por QR Code" />

      {/* scanner */}
      {scanning ? (
        <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200">
          <Scanner
            onScan={handleScan}
            onError={(err) => {
              console.error(err);
              toast.error("Erro ao acessar a câmera.");
            }}
            components={{ audio: true, torch: false, zoom: false, finder: false }}
            constraints={{ facingMode: "environment" }}
            styles={{ container: { width: "100%", height: 320 } }}
          />
        </div>
      ) : (
        <div className="mt-3 flex items-center justify-between rounded-xl border border-gray-200 px-3 py-2">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <span>✅ QR code lido</span>
          </div>
          <button
            onClick={() => {
              setParsed(null);
              setMarket("");
              setListName("");
              setShowAll(false);
              setScanning(true);
            }}
            className="rounded-xl border border-gray-300 px-3 py-1.5 text-sm text-gray-800 active:scale-95"
          >
            Reescanear
          </button>
        </div>
      )}

      {/* cards de totais */}
      {parsed && (
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-gray-200 p-3">
            <div className="text-xs text-gray-500">Itens</div>
            <div className="text-lg font-semibold text-gray-900">{previewCount}</div>
          </div>
          <div className="rounded-xl border border-gray-200 p-3">
            <div className="text-xs text-gray-500">Total</div>
            <div className="text-lg font-semibold text-gray-900">{brl(computedTotal)}</div>
          </div>
        </div>
      )}

      {/* prévia de itens */}
      {parsed && (
        <div className="mt-4 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between border-b bg-gray-50 p-3 text-sm">
            <div className="font-medium text-gray-800">Itens lidos</div>
            <div className="text-gray-600">{previewCount}</div>
          </div>

          <ul className="max-h-[360px] overflow-auto p-3 text-sm text-gray-800">
            {(showAll ? parsed.itens : parsed.itens.slice(0, 10)).map((it, i) => (
              <li key={i} className="flex items-center justify-between py-1.5">
                <span className="pr-3">{it.nome}</span>
                <span className="font-medium">
                  {brl(typeof it.total === "number" ? it.total : it.preco)}
                </span>
              </li>
            ))}
            {parsed.itens.length > 10 && !showAll && (
              <li className="pt-2 text-center">
                <button
                  onClick={() => setShowAll(true)}
                  className="text-xs font-medium text-yellow-600 underline"
                >
                  … ver mais {parsed.itens.length - 10} itens
                </button>
              </li>
            )}
          </ul>
        </div>
      )}

      {/* formulário */}
      {parsed && (
        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-800">Mercado</label>
            <input
              value={market}
              onChange={(e) => setMarket(e.target.value)}
              placeholder="Ex.: Carrefour"
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-yellow-400"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-800">Nome da lista</label>
            <input
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              placeholder="Ex.: Compra do mês"
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full rounded-xl bg-yellow-500 py-3 font-semibold text-black active:scale-[0.99] disabled:opacity-60"
          >
            {loading ? "Salvando..." : "Salvar compra"}
          </button>
        </div>
      )}

      <BottomNav activeTab="purchases" />
    </div>
  );
}
