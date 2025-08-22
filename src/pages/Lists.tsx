import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "@/context/DataContext";
import ListaCard from "@/components/ListaCard";
import NewListModal from "@/components/ui/NewListModal";
import AddItemModal from "@/components/ui/AddItemModal";
import BottomNav from "@/components/BottomNav";

const Lists: React.FC = () => {
  const { lists, fetchUserData, createList } = useData() as any;

  const navigate = useNavigate();

  const [showNewList, setShowNewList] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [activeListId, setActiveListId] = useState<string | null>(null);
  const [redirectOnClose, setRedirectOnClose] = useState(false);

  useEffect(() => {
    fetchUserData?.();
  }, []);

  // cria a lista e já abre o modal de item
  const handleCreateList = async (nome: string) => {
    const nova = await createList(nome); // retorna { id, ... }
    if (!nova) return;
    setActiveListId(nova.id);
    setRedirectOnClose(true);           // ao fechar o modal, ir para o detalhe
    setShowNewList(false);
    setShowItemModal(true);
  };

  const handleCloseAddItem = () => {
    setShowItemModal(false);
    if (redirectOnClose && activeListId) {
      navigate(`/lists/${activeListId}`); // abre diretamente a lista recém-criada
      setRedirectOnClose(false);
      // mantém o activeListId – útil se o usuário voltar
    }
  };

  return (
    <div className="min-h-screen bg-white pb-28">
      <div className="mx-auto max-w-xl px-4">
        {/* Cabeçalho padronizado com o Dashboard */}
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-gray-900">Minhas listas</h1>
          <img src="/LOGO_REDUZIDA.png" alt="Comparafy" className="h-9 w-auto" />
        </div>

        {/* Botão igual ao do Dashboard */}
        <button
          onClick={() => setShowNewList(true)}
          className="mt-3 w-full rounded-2xl bg-yellow-500 py-3 font-semibold text-black shadow active:scale-[0.99]"
        >
          + Nova lista
        </button>

        <div className="mt-4 space-y-3">
          {(!lists || lists.length === 0) && (
            <p className="text-center text-gray-500">Você ainda não criou listas.</p>
          )}

          {lists?.map((list: any) => {
            const totalItems = list.itens?.length || 0;
            const purchased = list.itens?.filter((i: any) => i.comprado)?.length || 0;
            const total = (list.itens || []).reduce(
              (acc: number, i: any) => acc + Number(i.preco || 0),
              0
            );
            return (
              <ListaCard
                key={list.id}
                id={list.id}
                nome={list.nome}
                total={total}
                itens={totalItems}
                comprados={purchased}
              />
            );
          })}
        </div>
      </div>

      {/* criar lista */}
      <NewListModal
        isOpen={showNewList}
        onClose={() => setShowNewList(false)}
        onCreated={handleCreateList}
      />

      {/* adicionar item — mesmo modal sempre; ao fechar, vai para o detalhe da lista nova */}
      <AddItemModal
        isOpen={Boolean(showItemModal && activeListId)}
        onClose={handleCloseAddItem}
        listId={activeListId ?? null}
        keepOpen
      />

      <BottomNav activeTab="lists" />
    </div>
  );
};

export default Lists;
