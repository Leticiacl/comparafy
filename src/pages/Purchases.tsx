import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageHeader from "../components/ui/PageHeader";
import BottomNav from "@/components/BottomNav";
import { Menu, Dialog } from "@headlessui/react";
import { EllipsisVerticalIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useData } from "@/context/DataContext";

const currency = (n: number) => `R$ ${Number(n || 0).toFixed(2)}`;
const fmtDateOnly = (any: any) => {
  const ms =
    typeof any === "number" ? any : any?.seconds ? any.seconds * 1000 : Date.parse(any || "");
  if (!Number.isFinite(ms)) return "-";
  return new Date(ms).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const Purchases: React.FC = () => {
  const { purchases, fetchPurchases, renamePurchaseInContext, deletePurchaseInContext } = useData();
  const navigate = useNavigate();

  const [openRename, setOpenRename] = useState<{ id: string; name: string } | null>(null);
  const [openDelete, setOpenDelete] = useState<string | null>(null);

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
            <div key={p.id} className="relative rounded-2xl border border-gray-200 bg-white p-4">
              {/* menu */}
              <Menu as="div" className="absolute right-1 top-1">
                <Menu.Button className="rounded p-1 text-gray-500 hover:bg-gray-100" aria-label="Mais opções">
                  <EllipsisVerticalIcon className="h-5 w-5" />
                </Menu.Button>
                <Menu.Items className="absolute right-0 z-10 mt-1 w-48 overflow-hidden rounded-md bg-white text-sm shadow ring-1 ring-black/5">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => setOpenRename({ id: p.id, name: p.name })}
                        className={`flex w-full items-center gap-2 px-3 py-2 text-left ${active ? "bg-gray-100" : ""}`}
                      >
                        <PencilSquareIcon className="h-4 w-4" />
                        Renomear
                      </button>
                    )}
                  </Menu.Item>
                  <div className="h-px bg-gray-100" />
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => setOpenDelete(p.id)}
                        className={`flex w-full items-center gap-2 px-3 py-2 text-left text-red-600 ${active ? "bg-gray-100" : ""}`}
                      >
                        <TrashIcon className="h-4 w-4" />
                        Excluir
                      </button>
                    )}
                  </Menu.Item>
                </Menu.Items>
              </Menu>

              {/* conteúdo do card */}
              <button className="w-full text-left" onClick={() => p.id && navigate(`/purchases/${p.id}`)}>
                <div className="mb-1 text-lg font-semibold text-gray-900">{p.name || "Compra"}</div>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="truncate">
                    {fmtDateOnly(p.createdAt)} · {p.market || "—"} · {p.itemCount ?? p.itens?.length ?? 0} itens
                  </div>
                  <div className="ml-3 shrink-0 font-semibold text-gray-900">{currency(total)}</div>
                </div>
              </button>
            </div>
          );
        })}
      </div>

      <BottomNav activeTab="purchases" />

      {/* Modal: Renomear */}
      <Dialog open={!!openRename} onClose={() => setOpenRename(null)} className="relative z-50">
        <div className="fixed inset-0 bg-black/20" />
        <div className="fixed inset-0 grid place-items-center p-4">
          <Dialog.Panel className="w-full max-w-sm rounded-xl bg-white p-4 shadow">
            <Dialog.Title className="mb-3 text-lg font-semibold">Renomear compra</Dialog.Title>
            <input
              autoFocus
              value={openRename?.name || ""}
              onChange={(e) => setOpenRename((r) => (r ? { ...r, name: e.target.value } : r))}
              className="mb-4 w-full rounded-lg border border-gray-300 px-3 py-2"
            />
            <div className="flex justify-end gap-2">
              <button className="rounded-lg bg-gray-100 px-3 py-2" onClick={() => setOpenRename(null)}>
                Cancelar
              </button>
              <button
                className="rounded-lg bg-yellow-500 px-3 py-2 text-black"
                onClick={async () => {
                  if (openRename && openRename.name.trim()) {
                    await renamePurchaseInContext(openRename.id, openRename.name.trim());
                    setOpenRename(null);
                  }
                }}
              >
                Salvar
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Modal: Excluir */}
      <Dialog open={!!openDelete} onClose={() => setOpenDelete(null)} className="relative z-50">
        <div className="fixed inset-0 bg-black/20" />
        <div className="fixed inset-0 grid place-items-center p-4">
          <Dialog.Panel className="w-full max-w-sm rounded-xl bg-white p-4 shadow">
            <Dialog.Title className="mb-4 text-lg font-semibold">Deseja excluir esta compra?</Dialog.Title>
            <div className="flex justify-end gap-2">
              <button className="rounded-lg bg-gray-100 px-3 py-2" onClick={() => setOpenDelete(null)}>
                Cancelar
              </button>
              <button
                className="rounded-lg bg-red-500 px-3 py-2 text-white"
                onClick={async () => {
                  if (openDelete) {
                    await deletePurchaseInContext(openDelete);
                    setOpenDelete(null);
                  }
                }}
              >
                Excluir
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

export default Purchases;
