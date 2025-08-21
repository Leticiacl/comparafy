// src/pages/PurchasesReceipt.tsx
import { useEffect, useRef, useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import BottomNav from "@/components/BottomNav";
import PageHeader from "@/components/ui/PageHeader";
import { useData } from "@/context/DataContext";
import { parseNFCeFromUrl, ReceiptParseResult } from "@/services/nfceParser";

/** Extrai a URL do QR em diferentes formatos que o componente pode retornar */
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

  const lastScan = useRef(0);

  /** Lê o QR, busca a NFC-e via proxy e monta a prévia */
  const handleScan = async (detected: any) => {
    const now = Date.now();
    if (now - lastScan.current < 1500) return; // evita múltipliplos disparos
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
      const count = data.itens?.length ?? 0;
      console.info("[NFCe] itens lidos:", count);
      toast.success(count ? `QR lido! ${count} item(ns).` : "QR lido! Nenhum item detectado.");
    } catch (e) {
      console.error("[NFCe] parse error", e);
      toast.error("Falha ao processar a NFC-e.");
      setScanning(true);
    } finally {
      setLoading(false);
    }
  };

  /** Persiste a compra com os itens extraídos */
  const handleSave = async () => {
    if (!parsed) return;
    setLoading(true);
    try {
      await createPurchaseFromReceiptInContext({
        name: listName || "Compra (NFC-e)",
        market: market || "—",
        date: parsed.date instanceof Date ? parsed.date : new Date(),
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

  return (
    <div className="mx-auto max-w-xl bg-white p-4 pb-32">
      <PageHeader title="Importar por QR Code" />

      {/* Scanner */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200">
        {scanning ? (
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
        ) : (
          <div className="flex h-80 items-center justify-center bg-gray-50">
            <span className="text-gray-600">
              {loading ? "Processando leitura..." : parsed ? "QR lido" : "Pronto para reescanear"}
            </span>
          </div>
        )}
      </div>

      <div className="mt-3 flex gap-2">
        <button
          onClick={() => {
            setParsed(null);
            setMarket("");
            setListName("");
            setScanning(true);
            lastScan.current = 0;
          }}
          className="rounded-xl border border-gray-300 px-4 py-2 text-gray-800 active:scale-95"
        >
          Reescanear
        </button>
      </div>

      {/* Prévia e formulário */}
      {parsed && !loading && (
        <div className="mt-6 space-y-4">
          <div className="rounded-xl border border-gray-200">
            <div className="flex items-center justify-between border-b bg-gray-50 p-3 text-sm">
              <div className="font-medium text-gray-800">Itens lidos</div>
              <div className="text-gray-600">{parsed.itens.length}</div>
            </div>

            <div className="max-h-40 overflow-auto p-3 text-sm text-gray-700">
              {parsed.itens.length === 0 ? (
                <div className="text-center text-gray-500">
                  Nenhum item detectado. Verifique o .env (VITE_NFCE_PROXY) e tente novamente.
                </div>
              ) : (
                <ul>
                  {parsed.itens.slice(0, 10).map((it, i) => (
                    <li key={i} className="flex items-center justify-between py-1">
                      <span className="truncate">{it.nome}</span>
                      <span className="pl-3 font-medium">
                        {Number(it.preco || 0).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </span>
                    </li>
                  ))}
                  {parsed.itens.length > 10 && (
                    <li className="pt-1 text-center text-xs text-gray-500">
                      … e mais {parsed.itens.length - 10}
                    </li>
                  )}
                </ul>
              )}
            </div>
          </div>

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
