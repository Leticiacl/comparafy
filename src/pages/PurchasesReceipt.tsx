import { useEffect, useRef, useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import BottomNav from "@/components/BottomNav";
import PageHeader from "@/components/ui/PageHeader";
import { useData } from "@/context/DataContext";
import { parseNFCeFromUrl, ReceiptParseResult } from "@/services/nfceParser";

const brl = (v?: number) =>
  (Number(v) || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/* ------- helpers de data ------- */
function toISODate(d?: Date | null) {
  if (!d || isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function brToISODate(str: string) {
  const m = str.match(/([0-3]?\d)[/|-]([01]?\d)[/|-](\d{4})/);
  if (!m) return "";
  const [, dd, mm, yyyy] = m;
  const iso = `${yyyy}-${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`;
  const d = new Date(`${iso}T00:00:00`);
  return isNaN(d.getTime()) ? "" : iso;
}
function isoLikeToISO(str: string) {
  const m = str.match(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (!m) return "";
  const [, yyyy, mm, dd] = m;
  const iso = `${yyyy}-${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`;
  const d = new Date(`${iso}T00:00:00`);
  return isNaN(d.getTime()) ? "" : iso;
}
function anyToISODate(val: unknown): string {
  if (val instanceof Date) return toISODate(val);
  if (typeof val === "number") {
    const ms = val > 1e12 ? val : val * 1000; // aceita seg ou ms
    return toISODate(new Date(ms));
  }
  if (typeof val === "string") {
    return brToISODate(val) || isoLikeToISO(val) || toISODate(new Date(val));
  }
  return "";
}

/* ------- url do scanner ------- */
function extractUrl(payload: unknown): string | null {
  const raw =
    typeof payload === "string"
      ? payload
      : Array.isArray(payload) && (payload[0] as any)?.rawValue
      ? String((payload[0] as any).rawValue)
      : (payload as any)?.rawValue ?? String((payload as any)?.[0] ?? "");
  const m = String(raw).match(/https?:\/\/[^\s<>"')]+/i);
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
  const [dateISO, setDateISO] = useState<string>(toISODate(new Date())); // << campo exibido
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
      setMarket((data as any)?.market || "");
      setListName((data as any)?.name || "");

      // data padrão: a do cupom; se não houver, hoje
      const iso = anyToISODate((data as any)?.date) || toISODate(new Date());
      setDateISO(iso);

      const n = (data as any)?.totalItems ?? (data as any)?.itens?.length ?? 0;
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
      const dateObj = dateISO ? new Date(`${dateISO}T00:00:00`) : new Date();
      await createPurchaseFromReceiptInContext({
        name: listName || "Compra (NFC-e)",
        market: market || "—",
        date: dateObj,
        itens: (parsed as any)?.itens || [],
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

  const previewCount = (parsed as any)?.totalItems ?? (parsed as any)?.itens?.length ?? 0;
  const computedTotal =
    (parsed as any)?.grandTotal ??
    +(((parsed as any)?.itens ?? []).reduce((acc: number, it: any) => {
      const totalLinha =
        (typeof it.total === "number" && it.total) ||
        (Number(it.preco) || 0) * (Number(it.quantidade) || 1);
      return acc + totalLinha;
    }, 0) || 0).toFixed(2);

  return (
    <div className="mx-auto max-w-xl bg-white p-4 pb-32">
      <PageHeader title="Importar por QR Code" />

      {scanning ? (
        <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200">
          <Scanner
            onScan={handleScan}
            onError={(err) => { console.error(err); toast.error("Erro ao acessar a câmera."); }}
            components={{ audio: true, torch: false, zoom: false, finder: false }}
            constraints={{ facingMode: "environment" }}
            styles={{ container: { width: "100%", height: 320 } }}
          />
        </div>
      ) : (
        <div className="mt-3 flex items-center justify-between rounded-xl border border-gray-200 px-3 py-2">
          <div className="text-sm text-gray-700">✅ QR code lido</div>
          <button
            onClick={() => { setParsed(null); setMarket(""); setListName(""); setShowAll(false); setScanning(true); }}
            className="rounded-xl border border-gray-300 px-3 py-1.5 text-sm text-gray-800 active:scale-95"
          >
            Reescanear
          </button>
        </div>
      )}

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

      {parsed && (
        <div className="mt-4 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between border-b bg-gray-50 p-3 text-sm">
            <div className="font-medium text-gray-800">Itens lidos</div>
            <div className="text-gray-600">{previewCount}</div>
          </div>
          <ul className="max-h-[360px] overflow-auto p-3 text-sm text-gray-800">
            {((parsed as any).itens ?? []).slice(0, showAll ? undefined : 10).map((it: any, i: number) => (
              <li key={i} className="flex items-center justify-between py-1.5">
                <span className="pr-3">{it.nome}</span>
                <span className="font-medium">
                  {brl(typeof it.total === "number" ? it.total : it.preco)}
                </span>
              </li>
            ))}
            {(parsed as any).itens?.length > 10 && !showAll && (
              <li className="pt-2 text-center">
                <button onClick={() => setShowAll(true)} className="text-xs font-medium text-yellow-600 underline">
                  … ver mais {(parsed as any).itens.length - 10} itens
                </button>
              </li>
            )}
          </ul>
        </div>
      )}

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
            <label className="mb-1 block text-sm font-medium text-gray-800">Nome da compra</label>
            <input
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              placeholder="Ex.: Compra do mês"
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          {/* CAMPO DE DATA (voltou) */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-800">Data da compra</label>
            <input
              type="date"
              value={dateISO}
              onChange={(e) => setDateISO(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-yellow-400"
            />
            <p className="mt-1 text-xs text-gray-500">Se preferir, altere a data.</p>
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
