import React, { useEffect, useRef, useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import BottomNav from "@/components/BottomNav";
import PageHeader from "@/components/ui/PageHeader";
import { useData } from "@/context/DataContext";
import { parseNFCeFromUrl, ReceiptParseResult } from "@/services/nfceParser";

const brl = (v?: number) =>
  (Number(v) || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const LS_KEY = "qr_cam_granted";

/* =================== HELPERS DE DATA (robustos) =================== */
function toISODate(d?: Date | null) {
  if (!d || isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** dd/mm/aaaa -> aaaa-mm-dd (retorna "" se inválida) */
function brToISODate(str: string) {
  const m = str.match(/([0-3]?\d)[/|-]([01]?\d)[/|-](\d{4})/);
  if (!m) return "";
  const [, dd, mm, yyyy] = m;
  const iso = `${yyyy}-${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`;
  const d = new Date(`${iso}T00:00:00`);
  return isNaN(d.getTime()) ? "" : iso;
}

/** aaaa-mm-dd -> aaaa-mm-dd */
function isoLikeToISO(str: string) {
  const m = str.match(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (!m) return "";
  const [, yyyy, mm, dd] = m;
  const iso = `${yyyy}-${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`;
  const d = new Date(`${iso}T00:00:00`);
  return isNaN(d.getTime()) ? "" : iso;
}

/** recebe Date | number (ms/seg) | string (vários formatos) e devolve ISO */
function anyToISODate(val: unknown): string {
  if (val instanceof Date) return toISODate(val);
  if (typeof val === "number") {
    const ms = val > 1e12 ? val : val * 1000; // aceita seg e ms
    return toISODate(new Date(ms));
  }
  if (typeof val === "string") {
    const br = brToISODate(val);
    if (br) return br;
    const iso = isoLikeToISO(val);
    if (iso) return iso;
    const d = new Date(val);
    return toISODate(isNaN(d.getTime()) ? undefined : d);
  }
  return "";
}

/** Varre PROFUNDAMENTE o objeto e coleta TODAS as datas; devolve a ÚLTIMA encontrada */
function extractFooterDateISO(from: unknown): string {
  const found: string[] = [];
  const scan = (v: any) => {
    if (!v) return;
    if (typeof v === "string") {
      const allBR = [...v.matchAll(/([0-3]?\d)[/|-]([01]?\d)[/|-](\d{4})/g)].map((m) => m[0]);
      const allISO = [...v.matchAll(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})/g)].map((m) => m[0]);
      [...allBR, ...allISO].forEach((s) => {
        const iso = anyToISODate(s);
        if (iso) found.push(iso);
      });
      return;
    }
    if (Array.isArray(v)) v.forEach(scan);
    else if (typeof v === "object") Object.values(v).forEach(scan);
  };
  scan(from);
  return found.length ? found[found.length - 1] : "";
}

/** Extrai URL do payload do scanner (aceita formatos novos/antigos) */
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

/* =================== COMPONENTE =================== */
export default function PurchasesReceipt() {
  const nav = useNavigate();
  const { createPurchaseFromReceiptInContext } = useData();

  const [ready, setReady] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);

  const [parsed, setParsed] = useState<ReceiptParseResult | null>(null);
  const [market, setMarket] = useState("");
  const [listName, setListName] = useState("");
  const [dateISO, setDateISO] = useState("");
  const [showAll, setShowAll] = useState(false);

  const lastScan = useRef(0);

  useEffect(() => {
    if (localStorage.getItem(LS_KEY) === "1") {
      setReady(true);
      setScanning(true);
    }
  }, []);

  const startScanner = () => {
    localStorage.setItem(LS_KEY, "1");
    setReady(true);
    setScanning(true);
  };

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

      // 1) tenta usar o campo date em QUALQUER formato comum
      let iso = anyToISODate((data as any)?.date);
      // 2) se não vier, varre o objeto e pega a ÚLTIMA data do conteúdo (rodapé)
      if (!iso) iso = extractFooterDateISO(data);
      // 3) se continuar vazio, não preenche (nada de 1969/1970)
      setDateISO(iso);

      const n = (data as any)?.totalItems ?? (data as any)?.itens?.length ?? 0;
      toast.success(n ? `QR lido! ${n} item(ns) detectado(s).` : "QR lido!");
    } catch (e: any) {
      if (String(e?.name || e).includes("NotAllowedError")) {
        localStorage.removeItem(LS_KEY);
      }
      console.error(e);
      toast.error("Falha ao processar a NFC-e.");
      setScanning(true);
    } finally {
      setLoading(false);
    }
  };

  const handleError = (err: any) => {
    console.error(err);
    if (String(err?.name || err).includes("NotAllowedError")) {
      localStorage.removeItem(LS_KEY);
    }
    toast.error("Erro ao acessar a câmera.");
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

  const previewCount =
    (parsed as any)?.totalItems ?? (parsed as any)?.itens?.length ?? 0;

  const computedTotal =
    (parsed as any)?.grandTotal ??
    +(((parsed as any)?.itens ?? []).reduce((acc: number, it: any) => {
      const totalLinha =
        (typeof it.total === "number" && it.total) ||
        (Number(it.preco) || 0) * (Number(it.quantidade) || 1);
      return acc + totalLinha;
    }, 0) || 0).toFixed(2);

  return (
    <main className="mx-auto w-full max-w-screen-sm md:max-w-screen-md lg:max-w-screen-lg xl:max-w-screen-xl bg-white px-4 md:px-6 pt-safe pb-[88px]">
      <PageHeader title="Importar por QR Code" />

      {/* permissão (só primeira vez) */}
      {!ready && (
        <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-5">
          <h2 className="text-lg font-semibold text-gray-900">Permitir acesso à câmera</h2>
          <p className="mt-1 text-sm text-gray-600">
            Para ler o QR da nota fiscal, o Comparafy precisa de acesso à sua câmera.
          </p>
          <button
            className="mt-3 rounded-xl bg-yellow-500 px-4 py-2 font-semibold text-black active:scale-95"
            onClick={startScanner}
          >
            Permitir
          </button>
          <p className="mt-2 text-xs text-gray-500">
            O navegador mostrará o pedido de permissão.
          </p>
        </div>
      )}

      {/* scanner QUADRADO */}
      {ready && scanning && (
        <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-3">
          <div className="relative w-full overflow-hidden rounded-xl" style={{ aspectRatio: "1 / 1" }}>
            <Scanner
              onScan={handleScan}
              onDecode={handleScan as any}
              onError={handleError}
              constraints={{ facingMode: "environment" }}
              components={{ audio: true, torch: false, zoom: false, finder: false }}
              styles={{
                container: { width: "100%", height: "100%" },
                video: { width: "100%", height: "100%", objectFit: "cover" },
              }}
            />
          </div>
        </div>
      )}

      {/* badges compactos após leitura */}
      {ready && !scanning && (
        <div className="mt-3 flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
            <span>✓</span> QR code lido
          </span>
          <button
            onClick={() => {
              setParsed(null);
              setMarket("");
              setListName("");
              setShowAll(false);
              setScanning(true);
            }}
            className="inline-flex items-center gap-1 rounded-full bg-gray-200 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-300 active:scale-95"
          >
            Reescanear
          </button>
        </div>
      )}

      {/* totais */}
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

      {/* lista (preview) */}
      {parsed && (
        <div className="mt-4 rounded-xl border border-gray-200">
          <div className="flex items-center justify-between border-b bg-gray-50 p-3 text-sm">
            <div className="font-medium text-gray-800">Itens lidos</div>
            <div className="text-gray-600">{previewCount}</div>
          </div>
          <ul className="max-h-[360px] overflow-auto p-3 text-sm text-gray-800">
            {((parsed as any)?.itens ?? []).slice(0, showAll ? undefined : 10).map((it: any, i: number) => (
              <li key={i} className="flex items-center justify-between py-1.5">
                <span className="pr-3">{it.nome}</span>
                <span className="font-medium">
                  {brl(typeof it.total === "number" ? it.total : it.preco)}
                </span>
              </li>
            ))}
            {((parsed as any)?.itens ?? []).length > 10 && !showAll && (
              <li className="pt-2 text-center">
                <button
                  onClick={() => setShowAll(true)}
                  className="text-xs font-medium text-yellow-600 underline"
                >
                  … ver mais {((parsed as any)?.itens ?? []).length - 10} itens
                </button>
              </li>
            )}
          </ul>
        </div>
      )}

      {/* formulário */}
      {parsed && (
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
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
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-800">Data da compra</label>
            <input
              type="date"
              value={dateISO}
              onChange={(e) => setDateISO(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-yellow-400"
            />
            <p className="mt-1 text-xs text-gray-500">
              Usamos a data exibida no rodapé da página de itens (ajuste se necessário).
            </p>
          </div>

          <div className="md:row-start-3 md:col-span-2">
            <button
              onClick={handleSave}
              disabled={loading}
              className="w-full rounded-xl bg-yellow-500 py-3 font-semibold text-black active:scale-[0.99] disabled:opacity-60"
            >
              {loading ? "Salvando..." : "Salvar compra"}
            </button>
          </div>
        </div>
      )}

      <BottomNav activeTab="purchases" />
    </main>
  );
}
