import React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Scanner } from "@yudiel/react-qr-scanner";
import BottomNav from "@/components/BottomNav";
import PageHeader from "@/components/ui/PageHeader";
import { useData } from "@/context/DataContext";
import { parseNFCeFromUrl } from "@/services/nfceParser";

/**
 * Aceita:
 * - URL completa do portal/SEFAZ
 * - URL curta da NFC-e
 * - strings com a URL dentro
 */
function extractUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const m = String(raw).match(/https?:\/\/\S+/i);
  if (m && m[0]) {
    return m[0].replace(/[)\]}>,.;]*$/, "");
  }
  return null;
}

const PurchasesReceipt: React.FC = () => {
  const navigate = useNavigate();
  const { createPurchaseFromReceiptInContext } = useData();

  const [scanning, setScanning] = React.useState(true);        // exibindo câmera?
  const [loading, setLoading] = React.useState(false);         // processando cupom?
  const [parsedOk, setParsedOk] = React.useState(false);       // já temos itens?
  const lastScanRef = React.useRef<number>(0);

  // campos que o usuário vai preencher DEPOIS de ler o QR
  const [market, setMarket] = React.useState("");
  const [listName, setListName] = React.useState("");

  const handleCreate = async () => {
    try {
      setLoading(true);
      await createPurchaseFromReceiptInContext({
        name: listName || "Compra (NFC-e)",
        market: market || "—",
        date: new Date(),
        // os itens vêm do parser; createPurchaseFromReceiptInContext já busca do buffer interno
        // (se seu context exigir, adapte para receber itens por parâmetro)
      });
      toast.success("Compra importada!");
      navigate("/purchases");
    } catch (e) {
      console.error(e);
      toast.error("Falha ao salvar a compra.");
    } finally {
      setLoading(false);
    }
  };

  const handleDecode = async (value: string) => {
    // throttle 2s para evitar repetição
    const now = Date.now();
    if (now - lastScanRef.current < 2000) return;
    lastScanRef.current = now;

    const url = extractUrl(value);
    if (!url) {
      toast.error("QR lido não contém uma URL válida.");
      return;
    }

    setScanning(false);
    setLoading(true);

    try {
      const parsed = await parseNFCeFromUrl(url);

      if (!parsed || !Array.isArray(parsed.itens) || parsed.itens.length === 0) {
        toast.error("Não foi possível identificar itens na NFC-e.");
        setLoading(false);
        setScanning(true);
        return;
      }

      // pré-preencher com dados do cupom (se vierem)
      if (parsed.market) setMarket(parsed.market);
      if (parsed.name) setListName(parsed.name);

      setParsedOk(true);
      toast.success("QR escaneado! Revise e salve.");
    } catch (e) {
      console.error(e);
      toast.error("Falha ao ler a NFC-e.");
      setScanning(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 pb-32 max-w-xl mx-auto bg-white">
      <PageHeader title="Importar por QR Code" />

      {/* Scanner */}
      <div className="mt-4 overflow-hidden rounded-xl border border-gray-200">
        {scanning ? (
          <Scanner
            onScan={(detected) => {
              const value =
                Array.isArray(detected) && detected[0]?.rawValue
                  ? detected[0].rawValue
                  : (detected as any)?.[0] || (detected as any)?.rawValue || "";
              if (value) handleDecode(String(value));
            }}
            onError={(err) => {
              console.error(err);
              toast.error("Erro ao acessar a câmera.");
            }}
            components={{ audio: false, torch: false, zoom: false, finder: false }}
            constraints={{ facingMode: "environment" }}
            styles={{ container: { width: "100%", height: 300 } }}
          />
        ) : (
          <div className="p-6 text-center text-gray-600">
            {loading ? "QR lido — processando dados..." : "QR lido com sucesso!"}
          </div>
        )}
      </div>

      {/* Apenas botão Reescanear (removemos a área de URL manual) */}
      <div className="mt-3 flex gap-2">
        <button
          onClick={() => {
            setParsedOk(false);
            setMarket("");
            setListName("");
            setScanning(true);
          }}
          className="rounded-xl border border-gray-300 px-4 py-2 text-gray-800 active:scale-95"
        >
          Reescanear
        </button>
      </div>

      {/* Após processamento: pedir Mercado e Nome da lista */}
      {parsedOk && !loading && (
        <div className="mt-6 space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-800">Mercado</label>
            <input
              value={market}
              onChange={(e) => setMarket(e.target.value)}
              placeholder="Ex.: Carrefour, Extra..."
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
            onClick={handleCreate}
            disabled={loading}
            className="mt-1 w-full rounded-xl bg-yellow-500 py-3 font-semibold text-black active:scale-[0.99] disabled:opacity-60"
          >
            {loading ? "Salvando..." : "Salvar compra"}
          </button>
        </div>
      )}

      <BottomNav activeTab="purchases" />
    </div>
  );
};

export default PurchasesReceipt;
