import React, { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import PageHeader from "../components/ui/PageHeader";
import BottomNav from "@/components/BottomNav";
import { useData } from "@/context/DataContext";

const currency = (n: number) => `R$ ${Number(n || 0).toFixed(2)}`;
const fmtDate = (any: any) => {
  const ms =
    typeof any === "number" ? any : any?.seconds ? any.seconds * 1000 : Date.parse(any || "");
  if (!Number.isFinite(ms)) return "-";
  return new Date(ms).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const Purchases: React.FC = () => {
  const { purchases, fetchPurchases } = useData();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPurchases();
  }, []);

  return (
    <div className="p-4 pb-28 max-w-xl mx-auto bg-white">
      <PageHeader title="Compras" />

      <Link
        to="/purchases/new"
        className="w-full bg-yellow-500 hover:bg-yellow-500/90 text-black font-medium py-3 rounded-xl mb-4 flex items-center justify-center gap-2"
      >
        <span className="text-xl">+</span>
        <span>Nova compra</span>
      </Link>

      {purchases.length === 0 && (
        <div className="text-sm text-gray-500 px-1 mb-2">Nenhuma compra ainda.</div>
      )}

      <div className="space-y-3">
        {purchases.map((p) => {
          const total =
            p.total ??
            p.itens?.reduce(
              (acc, it) => acc + (Number(it.preco) || 0) * (Number(it.quantidade) || 1),
              0
            ) ??
            0;

          return (
            <button
              key={p.id}
              onClick={() => p.id && navigate(`/purchases/${p.id}`)}
              className="w-full text-left rounded-2xl border border-gray-200 p-4 active:scale-[0.99] transition bg-white"
            >
              <div className="flex items-center justify-between">
                <div className="text-lg font-semibold text-gray-900">{p.name || "Compra"}</div>
                <div className="text-gray-900 font-semibold">{currency(total)}</div>
              </div>
              <div className="mt-1 text-sm text-gray-500">
                {fmtDate(p.createdAt)} · {p.market || "—"} · {p.itemCount ?? p.itens?.length ?? 0} itens
              </div>
            </button>
          );
        })}
      </div>

      <BottomNav activeTab="purchases" />
    </div>
  );
};

export default Purchases;
