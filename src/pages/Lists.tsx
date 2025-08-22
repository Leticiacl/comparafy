// src/pages/Lists.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../components/ui/PageHeader";
import BottomNav from "../components/BottomNav";
import ListaCard from "../components/ListaCard";
import NewListModal from "../components/ui/NewListModal";
import { useData } from "../context/DataContext";

const Lists: React.FC = () => {
  const navigate = useNavigate();
  const { lists = [], createList } = useData();
  const [open, setOpen] = useState(false);

  return (
    <div className="mx-auto max-w-xl bg-white p-4 pb-28">
      {/* Header IDENTICO ao das outras telas (sem subtítulo) para alinhar a logo */}
      <PageHeader title="Listas" />

      {/* CTA grande */}
      <button
        onClick={() => setOpen(true)}
        className="mb-3 w-full rounded-2xl bg-yellow-500 px-4 py-3 font-semibold text-black shadow hover:brightness-95"
      >
        + Nova lista
      </button>

      {lists.length === 0 ? (
        <div className="rounded-xl border border-dashed p-6 text-center text-gray-600">
          Você ainda não tem listas.
        </div>
      ) : (
        <div className="space-y-3">
          {lists.map((l) => (
            <ListaCard key={l.id} list={l} onClick={() => navigate(`/lists/${l.id}`)} />
          ))}
        </div>
      )}

      <NewListModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onCreate={async (name) => {
          const created = await createList(name);
          setOpen(false);
          const id = (created as any)?.id;
          if (id) navigate(`/lists/${id}`);
        }}
      />

      <BottomNav activeTab="lists" />
    </div>
  );
};

export default Lists;
