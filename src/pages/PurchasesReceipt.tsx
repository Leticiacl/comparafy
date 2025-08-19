import React from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav";
import { useData } from "../context/DataContext";
import { toast } from "react-hot-toast";
import PageHeader from "../components/ui/PageHeader";

// Import dinâmico resiliente ao pacote (@yudiel/react-qr-scanner)
const QrAny = React.lazy(async () => {
  const m: any = await import("@yudiel/react-qr-scanner");
  return { default: m.QrScanner || m.Scanner || m.default };
});

const endpoint = import.meta.env.VITE_PARSE_NFCE_URL as string | undefined;

type ParsedItem = {
  nome: string;
  quantidade: number;
  unidade: string;
  preco: number;
  mercado?: string;
};

const todayISO = () => new Date().toISOString().slice(0, 10);

const PurchasesReceipt: React.FC = () => {
  const navigate = useNavigate();
  const { createPurchaseFromReceiptInContext } = useData();

  const [scanUrl, setScanUrl] = React.useState<string>("");
  const [loading, setLoading] = React.useState(false);
  const [items, setItems] = React.useState<ParsedItem[]>([]);
  const [name, setName] = React.useState("Compra via QR Code");
  const [market, setMarket] = React.useState("");
  const [date, setDate] = React.useState(todayISO());

  const handleDecode = async (text: string) => {
    if (!text || text === scanUrl) return;
    setScanUrl(text);
    if (!endpoint) {
      toast.error("Configure VITE_PARSE_NFCE_URL no .env");
      return;
    }
    setLoading(true);
    try {
      const resp = await fetch(`${endpoint}?url=${encodeURIComponent(text)}`);
      const json = await resp.json();
      if (!json?.items?.length) {
        toast.error("Não foi possível ler itens da NFC-e.");
        return;
      }
      setItems(json.items as ParsedItem[]);
      toast.success(`Itens carregados (${json.items.length})`);
    } catch (e) {
      console.error(e);
      toast.error("Falha ao consultar a NFC-e.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!items.length) {
      toast.error("Nenhum item para salvar.");
      return;
    }
    setLoading(true);
    try {
      await createPurchaseFromReceiptInContext({
        name: name || "Compra",
        market,
        date: new Date(date),
        itens: items,
      });
      toast.success("Compra salva!");
      navigate("/purchases");
    } catch (e) {
      console.error(e);
      toast.error("Erro ao salvar compra.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 pb-32 max-w-xl mx-auto bg-white space-y-6">
      <PageHeader title="Recibo" />

      {/* Scanner */}
      <div className="rounded-xl overflow-hidden border border-gray-200">
        <React.Suspense fallback={<div className="p-6 text-center">Abrindo câmera…</div>}>
          <QrAny
            onDecode={handleDecode}
            onError={(err: any) => {
              console.error(err);
              toast.error("Erro na câmera/permits.");
            }}
            constraints={{ facingMode: "environment" }}
            containerStyle={{ width: "100%", minHeight: 240 }}
          />
        </React.Suspense>
      </div>

      {/* Dados da compra */}
      <div className="space-y-3">
        <input
          placeholder="Nome da compra"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded-xl px-4 py-2"
        />
        <input
          placeholder="Mercado (opcional)"
          value={market}
          onChange={(e) => setMarket(e.target.value)}
          className="w-full border rounded-xl px-4 py-2"
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full border rounded-xl px-4 py-2"
        />
      </div>

      {/* Itens lidos */}
      {items.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Itens importados</h2>
          <ul className="divide-y rounded-xl border border-gray-200">
            {items.map((it, idx) => (
              <li key={idx} className="p-3">
                <div className="font-medium text-gray-800">{it.nome}</div>
                <div className="text-xs text-gray-500">
                  {it.quantidade} {it.unidade} · R$ {it.preco.toFixed(2)}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        disabled={loading || !items.length}
        onClick={handleSave}
        className="w-full bg-yellow-500 disabled:opacity-60 px-4 py-3 rounded-xl text-black font-semibold"
      >
        {loading ? "Salvando..." : "Salvar compra"}
      </button>

      <BottomNav activeTab="purchases" />
    </div>
  );
};

export default PurchasesReceipt;
