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
  // pega a 1ª ocorrência de http(s)://... até espaço
  const m = String(raw).match(/https?:\/\/\S+/i);
  if (m && m[0]) {
    // remove caracteres finais comuns em QR libs (quebra de linha, etc.)
    return m[0].replace(/[)\]}>,.;]*$/, "");
  }
  return null;
}

const PurchasesReceipt: React.FC = () => {
  const navigate = useNavigate();
  const { createPurchaseFromReceiptInContext } = useData();

  const [manualUrl, setManualUrl] = React.useState("");
  const [scanning, setScanning] = React.useState(true);
  const lastScanRef = React.useRef<number>(0);

  async function importFromUrl(url: string) {
    try {
      const parsed = await parseNFCeFromUrl(url);
      // Esperado do parser:
      // {
      //   name?: string;
      //   market?: string;
      //   date?: Date;
      //   itens: Array<{ nome: string; quantidade?: number; unidade?: string; preco: number; peso?: number; }>
      // }
      if (!parsed || !Array.isArray(parsed.itens) || parsed.itens.length === 0) {
        toast.error("Não foi possível ler itens na NFC-e.");
        return;
      }

      await createPurchaseFromReceiptInContext({
        name: parsed.name || "Compra (NFC-e)",
        market: parsed.market || "—",
        date: parsed.date instanceof Date ? parsed.date : new Date(),
        itens: parsed.itens,
      });

      toast.success("Compra importada!");
      navigate("/purchases");
    } catch (e: any) {
      console.error(e);
      toast.error("Falha ao importar a NFC-e.");
    }
  }

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
    await importFromUrl(url);
  };

  return (
    <div className="p-4 pb-32 max-w-xl mx-auto bg-white">
      <PageHeader title="Importar por QR Code" />

      {/* Scanner */}
      <div className="mt-4 overflow-hidden rounded-xl border border-gray-200">
        {scanning ? (
          <Scanner
            onScan={(detected) => {
              // o componente retorna uma lista; pegue o texto do primeiro
              const value = Array.isArray(detected) && detected[0]?.rawValue
                ? detected[0].rawValue
                : (detected as any)?.[0] || (detected as any)?.rawValue || "";
              if (value) handleDecode(String(value));
            }}
            onError={(err) => {
              console.error(err);
              toast.error("Erro ao acessar a câmera.");
            }}
            components={{ // remove controles internos
              audio: false,
              torch: false,
              zoom: false,
              finder: false,
            }}
            constraints={{ facingMode: "environment" }}
            styles={{ container: { width: "100%", height: 300 } }}
          />
        ) : (
          <div className="p-6 text-center text-gray-600">
            Processando leitura...
          </div>
        )}
      </div>

      {/* Controles */}
      <div className="mt-3 flex gap-2">
        <button
          onClick={() => setScanning(true)}
          className="rounded-xl border border-gray-300 px-4 py-2 text-gray-800 active:scale-95"
        >
          Reescanear
        </button>
      </div>

      {/* Ou colar a URL manualmente */}
      <div className="mt-6">
        <label className="mb-2 block font-medium text-gray-800">Ou cole a URL da NFC-e</label>
        <input
          value={manualUrl}
          onChange={(e) => setManualUrl(e.target.value)}
          placeholder="https://... (URL da nota fiscal)"
          className="w-full rounded-2xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-yellow-400"
        />
        <button
          onClick={async () => {
            const url = extractUrl(manualUrl);
            if (!url) {
              toast.error("Informe uma URL válida.");
              return;
            }
            await importFromUrl(url);
          }}
          className="mt-3 w-full rounded-xl bg-yellow-500 py-3 font-semibold text-black active:scale-[0.99]"
        >
          Importar NFC-e
        </button>
      </div>

      <BottomNav activeTab="purchases" />
    </div>
  );
};

export default PurchasesReceipt;
