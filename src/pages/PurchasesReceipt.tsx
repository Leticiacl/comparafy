import React, { useEffect, useRef, useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import BottomNav from "@/components/BottomNav";
import PageHeader from "@/components/ui/PageHeader";
import { useData } from "@/context/DataContext";
import { parseNFCeFromUrl, ReceiptParseResult } from "@/services/nfceParser";
import { anyToISODate, toISO } from "@/utils/date";
import { formatBRL } from "@/utils/price";

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

// helpers para edição inline
const UNIDADES = ["un", "kg", "g", "l", "ml", "bd", "dz"] as const;
type Unidade = (typeof UNIDADES)[number];
const clamp2 = (n: number) => +Number(n || 0).toFixed(2);

export default function PurchasesReceipt() {
  const nav = useNavigate();
  const { createPurchaseFromReceiptInContext } = useData();

  const [scanning, setScanning] = useState(true);
  const [loading, setLoading] = useState(false);
  const [parsed, setParsed] = useState<ReceiptParseResult | null>(null);
  const [market, setMarket] = useState("");
  const [listName, setListName] = useState("");
  const [dateISO, setDateISO] = useState<string>(toISO(new Date()));
  const [showAll, setShowAll] = useState(false);

  // estado editável dos itens (uma cópia mutável de parsed.itens)
  const [items, setItems] = useState<any[]>([]);

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
      setItems((data as any)?.itens ? JSON.parse(JSON.stringify((data as any).itens)) : []); // deep copy simples
      setMarket((data as any)?.market || "");
      setListName((data as any)?.name || "");

      const iso = anyToISODate((data as any)?.date) || toISO(new Date());
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
      // monta itens finais a partir do array editável
      const finalItems = (items || [])
        .filter((it) => it && it.nome && (it.total || it.preco)) // evita salvar vazios
        .map((it) => ({
          nome: String(it.nome).trim(),
          quantidade: Number(it.quantidade) || 1,
          unidade: it.unidade || undefined,
          peso: it.peso ? Number(it.peso) : undefined,
          preco: clamp2(Number(it.preco || 0)),
          total: typeof it.total === "number" ? clamp2(it.total) : undefined,
        }));

      await createPurchaseFromReceiptInContext({
        name: listName || "Compra (NFC-e)",
        market: market || "—",
        date: dateObj,
        itens: finalItems,
        source: "receipt",
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

  const previewCount = (parsed as any)?.totalItems ?? items.length ?? 0;
  const computedTotal =
    (parsed as any)?.grandTotal ??
    +(((items ?? []).reduce((acc: number, it: any) => {
      const totalLinha =
        (typeof it.total === "number" && it.total) ||
        (Number(it.preco) || 0) * (Number(it.quantidade) || 1);
      return acc + totalLinha;
    }, 0) || 0).toFixed(2));

  const flagged = (it: any) => !it?.unidade || !(it?.preco || it?.total);

  // mutators
  const setField = (idx: number, key: string, val: any) =>
    setItems((arr) => {
      const next = [...arr];
      next[idx] = { ...next[idx], [key]: val };
      // se mudar quantidade/unidade e não houver total (caso peso), recalcula total básico
      return next;
    });
  const removeItem = (idx: number) =>
    setItems((arr) => arr.filter((_: any, i: number) => i !== idx));

  return (
    <div className="mx-auto max-w-xl bg-white px-4 md:px-6 pb-32 pt-safe">
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
            onClick={() => { setParsed(null); setItems([]); setMarket(""); setListName(""); setShowAll(false); setScanning(true); }}
            className="rounded-xl border border-gray-300 px-3 py-1.5 text-sm text-gray-800 active:scale-95"
          >
            Reescanear
          </button>
        </div>
      )}

      {parsed && (
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-gray-200 p-3">
            <div className="text-xs text-gray-500">Itens</div>
            <div className="text-lg font-semibold text-gray-900">{previewCount}</div>
          </div>
          <div className="rounded-2xl border border-gray-200 p-3">
            <div className="text-xs text-gray-500">Total</div>
            <div className="text-lg font-semibold text-gray-900">{formatBRL(computedTotal)}</div>
          </div>
        </div>
      )}

      {/* Lista de itens com edição inline */}
      {parsed && (
        <>
          <div className="mt-4 rounded-2xl border border-gray-200">
            <div className="flex items-center justify-between border-b bg-gray-50 p-3 text-sm">
              <div className="font-medium text-gray-800">Itens lidos</div>
              <div className="text-gray-600">{items.length}</div>
            </div>

            <ul className="max-h-[420px] overflow-auto p-3 text-sm">
              {(items ?? []).slice(0, showAll ? undefined : 20).map((it, i) => {
                const totalLinha =
                  (typeof it.total === "number" && it.total) ||
                  (Number(it.preco) || 0) * (Number(it.quantidade) || 1);

                return (
                  <li
                    key={`${it.nome}-${i}`}
                    className={`mb-2 rounded-xl border p-3 ${flagged(it) ? "border-amber-300 bg-amber-50" : "border-gray-200 bg-white"}`}
                  >
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <div className="font-medium text-gray-900">{it.nome}</div>
                      <button
                        onClick={() => removeItem(i)}
                        className="rounded-lg border border-red-200 px-2 py-1 text-xs font-medium text-red-600"
                      >
                        Remover
                      </button>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      {/* Unidade */}
                      <div className="col-span-1">
                        <label className="block text-[11px] text-gray-500">Unidade</label>
                        <select
                          value={it.unidade || ""}
                          onChange={(e) => setField(i, "unidade", e.target.value as Unidade)}
                          className="w-full rounded-lg border border-gray-300 px-2 py-1.5"
                        >
                          <option value="">—</option>
                          {UNIDADES.map((u) => (
                            <option key={u} value={u}>{u}</option>
                          ))}
                        </select>
                      </div>

                      {/* Quantidade / Peso */}
                      <div className="col-span-1">
                        <label className="block text-[11px] text-gray-500">{it.unidade && ["kg","g","l","ml"].includes(it.unidade) ? "Peso" : "Quantidade"}</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={it.unidade && ["kg","g","l","ml"].includes(it.unidade) ? (it.peso ?? it.quantidade ?? 0) : (it.quantidade ?? 1)}
                          onChange={(e) => {
                            const v = Number(e.target.value);
                            if (it.unidade && ["kg","g","l","ml"].includes(it.unidade)) {
                              setField(i, "peso", v);
                              setField(i, "quantidade", 1);
                            } else {
                              setField(i, "quantidade", v || 1);
                            }
                          }}
                          className="w-full rounded-lg border border-gray-300 px-2 py-1.5"
                        />
                      </div>

                      {/* Preço unitário (ou total se peso) */}
                      <div className="col-span-1">
                        <label className="block text-[11px] text-gray-500">
                          {it.unidade && ["kg","g","l","ml"].includes(it.unidade) ? "Total (linha)" : "Preço un."}
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={
                            it.unidade && ["kg","g","l","ml"].includes(it.unidade)
                              ? (it.total ?? 0)
                              : (it.preco ?? 0)
                          }
                          onChange={(e) => {
                            const v = clamp2(Number(e.target.value));
                            if (it.unidade && ["kg","g","l","ml"].includes(it.unidade)) {
                              setField(i, "total", v);
                              setField(i, "preco", undefined);
                            } else {
                              setField(i, "preco", v);
                              setField(i, "total", undefined);
                            }
                          }}
                          className="w-full rounded-lg border border-gray-300 px-2 py-1.5"
                        />
                      </div>

                      {/* Total calculado */}
                      <div className="col-span-1">
                        <label className="block text-[11px] text-gray-500">Total</label>
                        <div className="rounded-lg border border-gray-200 px-2 py-2 text-right font-semibold text-gray-900">
                          {formatBRL(clamp2(totalLinha))}
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}

              {(items ?? []).length > 20 && !showAll && (
                <li className="pt-2 text-center">
                  <button onClick={() => setShowAll(true)} className="text-xs font-medium text-yellow-600 underline">
                    … ver mais {(items ?? []).length - 20} itens
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Itens a revisar (atalho visual) */}
          {items.some(flagged) && (
            <div className="mt-3 rounded-2xl border border-amber-300 bg-amber-50">
              <div className="border-b border-amber-200 p-3 text-sm font-medium text-amber-900">
                Itens a revisar
              </div>
              <ul className="max-h-[240px] overflow-auto p-3 text-sm text-amber-900">
                {items.map((it, i) => flagged(it) && (
                  <li key={i} className="flex items-center justify-between py-1.5">
                    <span className="pr-3">{it.nome}</span>
                    <span className="text-xs">
                      {!it.unidade ? "sem unidade" : ""}{!it.unidade && !(it.preco || it.total) ? " · " : ""}
                      {!(it.preco || it.total) ? "preço ausente" : ""}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {/* Metadados e salvar */}
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

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-800">Data da compra</label>
            <input
              type="date"
              value={dateISO}
              onChange={(e) => setDateISO(e.target.value)}
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
