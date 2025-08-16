import React, { useEffect, useMemo, useState } from "react";
import BottomNav from "../components/BottomNav";
import { useData } from "../context/DataContext";
import { Toaster, toast } from "sonner";

export default function PurchaseFromList() {
  const { lists, fetchItems, createPurchaseFromListInContext } = useData();
  const [selectedListId, setSelectedListId] = useState<string>("");
  const [name, setName] = useState("");
  const [market, setMarket] = useState("");
  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0,10));
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedListId) return;
    fetchItems(selectedListId);
  }, [selectedListId, fetchItems]);

  const current = useMemo(() => lists.find(l => l.id === selectedListId), [lists, selectedListId]);

  useEffect(() => {
    if (current) {
      // default: todos marcados
      const map: Record<string,boolean> = {};
      current.itens.forEach(i => { map[i.id] = true; });
      setSelected(map);
      if (!name) setName(current.nome);
    }
  }, [current]);

  const toggleAll = (value: boolean) => {
    const map: Record<string,boolean> = {};
    current?.itens.forEach(i => { map[i.id] = value; });
    setSelected(map);
  };

  const handleCreate = async () => {
    if (!selectedListId || !name.trim() || !date) {
      toast.error("Preencha os campos obrigatórios.");
      return;
    }
    setLoading(true);
    try {
      const ids = Object.entries(selected).filter(([,v])=>v).map(([k])=>k);
      await createPurchaseFromListInContext({
        listId: selectedListId,
        name: name.trim(),
        market: market.trim(),
        date: new Date(date),
        selectedItemIds: ids,
      });
      toast.success("Compra criada a partir da lista.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 pb-28 max-w-xl mx-auto">
      <Toaster richColors closeButton />
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold">Escolha a lista</h1>
        <img src="/LOGO_REDUZIDA.png" alt="Logo" className="h-9 w-9" />
      </div>

      {/* Listas */}
      <div className="mt-4 space-y-3">
        {lists.map(l => (
          <button
            key={l.id}
            onClick={() => setSelectedListId(l.id)}
            className={`w-full text-left border rounded-2xl p-4 ${selectedListId===l.id ? 'border-yellow-500 ring-2 ring-yellow-200' : ''}`}
          >
            <div className="font-semibold text-lg">{l.nome}</div>
            <div className="text-sm text-gray-500">{l.itens?.length || 0} itens</div>
          </button>
        ))}
      </div>

      {/* Form e seleção de itens */}
      {current && (
        <div className="mt-5 border rounded-2xl p-4">
          <div className="text-lg font-semibold mb-3">Nova compra baseada em {current.nome}</div>

          <label className="block text-sm text-gray-700 mb-1">Nome da compra</label>
          <input className="w-full border rounded-xl px-3 py-2 mb-3" value={name} onChange={e=>setName(e.target.value)} />

          <label className="block text-sm text-gray-700 mb-1">Mercado</label>
          <input className="w-full border rounded-xl px-3 py-2 mb-3" value={market} onChange={e=>setMarket(e.target.value)} placeholder="Opcional" />

          <label className="block text-sm text-gray-700 mb-1">Data</label>
          <input type="date" className="w-full border rounded-xl px-3 py-2 mb-4" value={date} onChange={e=>setDate(e.target.value)} />

          <div className="mb-3 flex items-center justify-between">
            <div className="font-medium">Itens da lista</div>
            <div className="text-sm flex gap-2">
              <button className="underline" onClick={()=>toggleAll(true)}>Selecionar todos</button>
              <span>•</span>
              <button className="underline" onClick={()=>toggleAll(false)}>Limpar</button>
            </div>
          </div>

          <ul className="max-h-60 overflow-auto divide-y">
            {current.itens.map(it => (
              <li key={it.id} className="py-2 flex items-center justify-between">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={!!selected[it.id]}
                    onChange={e=>setSelected(s=>({...s, [it.id]: e.target.checked}))}
                  />
                  <span>{it.nome}</span>
                </label>
                <span className="text-sm text-gray-600">R$ {Number(it.preco).toFixed(2)}</span>
              </li>
            ))}
            {!current.itens.length && <li className="py-6 text-center text-gray-400">Lista sem itens.</li>}
          </ul>

          <button
            className="mt-4 w-full bg-yellow-500 text-black py-3 rounded-xl font-medium shadow disabled:opacity-50"
            disabled={loading || !name.trim()}
            onClick={handleCreate}
          >
            {loading ? "Salvando..." : "Criar compra"}
          </button>
        </div>
      )}

      <BottomNav activeTab="purchases" />
    </div>
  );
}
