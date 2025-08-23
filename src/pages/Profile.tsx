import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "@/components/ui/PageHeader";
import BottomNav from "@/components/BottomNav";
import InstallButton from "@/components/InstallButton";
import { auth } from "@/services/firebase";
import { updateProfile, onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { CameraIcon, PencilSquareIcon, ArrowTopRightOnSquareIcon, PowerIcon, DocumentTextIcon, ComputerDesktopIcon } from "@heroicons/react/24/outline";
import { Dialog as HeadlessDialog } from "@headlessui/react";

const IconIOS: React.FC<{ className?: string }> = ({ className = "h-5 w-5" }) => (
  <svg viewBox="0 0 24 24" className={`${className} text-yellow-600`} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="5.5" y="2.5" width="13" height="19" rx="3.2" />
    <rect x="9" y="3.5" width="6" height="1.7" rx="0.8" />
  </svg>
);
const IconAndroid: React.FC<{ className?: string }> = ({ className = "h-5 w-5" }) => (
  <svg viewBox="0 0 24 24" className={`${className} text-yellow-600`} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="4.3" y="2.6" width="15.4" height="18.8" rx="4.2" />
    <rect x="8.5" y="19.2" width="7" height="1.2" rx="0.6" fill="currentColor" stroke="none" />
  </svg>
);

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState<string>("");
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [isAnonymous, setIsAnonymous] = useState<boolean>(true);
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [installOpen, setInstallOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const off = onAuthStateChanged(auth, (u) => {
      setDisplayName(u?.displayName || "");
      setPhotoURL(u?.photoURL || null);
      setIsAnonymous(!!u?.isAnonymous);
    });
    return () => off();
  }, []);

  const avatarLetter = useMemo(() => (displayName || " ").trim().slice(0, 1).toUpperCase(), [displayName]);

  const saveName = async () => {
    const name = (inputRef.current?.value || "").trim();
    if (!auth.currentUser || !name) { setEditing(false); return; }
    await updateProfile(auth.currentUser, { displayName: name });
    setDisplayName(name);
    setEditing(false);
  };

  const triggerFile = () => fileRef.current?.click();
  const onPickFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !auth.currentUser) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = String(reader.result || "");
      setPhotoURL(dataUrl);
      await updateProfile(auth.currentUser!, { photoURL: dataUrl });
    };
    reader.readAsDataURL(file);
  };

  const handleSignOut = async () => {
    await firebaseSignOut(auth);
    navigate("/login");
  };

  const containerClass =
    "mx-auto w-full max-w-screen-sm md:max-w-screen-md lg:max-w-screen-lg xl:max-w-screen-xl bg-white px-4 md:px-6 pb-28";

  return (
    <div className={containerClass}>
      <PageHeader title="Perfil" />
      <section className="mt-3 rounded-2xl border border-gray-200 bg-white p-4">
        <div className="flex items-center gap-3">
          <div className="relative h-16 w-16 shrink-0">
            {photoURL ? (
              <img src={photoURL} alt="Foto do perfil" className="h-16 w-16 rounded-full object-cover" />
            ) : (
              <div className="grid h-16 w-16 place-items-center rounded-full bg-yellow-100 text-lg font-semibold text-yellow-900">
                {avatarLetter}
              </div>
            )}
            <button type="button" onClick={triggerFile} title="Alterar foto" className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full bg-yellow-500 text-black shadow hover:brightness-95">
              <CameraIcon className="h-3 w-3" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPickFile} />
          </div>

          <div className="min-w-0 flex-1">
            {!editing ? (
              <div className="flex items-center gap-2">
                <h2 className="truncate text-base font-semibold text-gray-900">{displayName || "Seu nome"}</h2>
                <button type="button" onClick={() => setEditing(true)} className="rounded p-1 text-gray-500 hover:bg-gray-100" title="Editar nome">
                  <PencilSquareIcon className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <input ref={inputRef} defaultValue={displayName} placeholder="Seu nome" className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-yellow-400" />
                <button type="button" onClick={saveName} className="rounded-lg bg-yellow-500 px-3 py-2 text-sm font-medium text-black hover:brightness-95">Salvar</button>
                <button type="button" onClick={() => setEditing(false)} className="rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-700 hover:bg-gray-200">Cancelar</button>
              </div>
            )}

            {isAnonymous && (
              <p className="mt-1 text-sm text-gray-600">
                Você está como <span className="font-medium">visitante</span>. Crie uma conta para não perder seus dados.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="mt-4 rounded-2xl border border-gray-200 bg-white p-4">
        <div className="flex items-start gap-3">
          <IconIOS className="mt-0.5 h-5 w-5" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">Instalar aplicativo</h3>
              <div className="flex items-center gap-2">
                <InstallButton />
                <button className="rounded p-1 text-gray-500 hover:bg-gray-100" onClick={() => setInstallOpen(true)} title="Como instalar">
                  <ArrowTopRightOnSquareIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
            <p className="mt-1 text-sm text-gray-600">Adicione o Comparafy à tela inicial para uma experiência melhor.</p>
          </div>
        </div>
      </section>

      <section className="mt-4 rounded-2xl border border-gray-200 bg-white p-4">
        <div className="flex items-start gap-3">
          <DocumentTextIcon className="mt-0.5 h-5 w-5 text-yellow-600" />
        </div>
        <div className="-mt-6 ml-8">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900">Termos de uso</h3>
            <button className="rounded p-1 text-gray-500 hover:bg-gray-100" onClick={() => setTermsOpen(true)} title="Abrir termos">
              <ArrowTopRightOnSquareIcon className="h-5 w-5" />
            </button>
          </div>
          <p className="mt-1 text-sm text-gray-600">Leia os termos e como tratamos seus dados.</p>
        </div>
      </section>

      <div className="mt-6">
        <button type="button" onClick={handleSignOut} className="inline-flex items-center gap-2 text-sm font-medium text-red-600 hover:underline">
          <PowerIcon className="h-4 w-4" />
          Sair do Comparafy
        </button>
      </div>

      <BottomNav activeTab="profile" />

      {/* Modal: Como instalar */}
      <HeadlessDialog open={installOpen} onClose={() => setInstallOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        <div className="fixed inset-0 grid place-items-center p-4">
          <HeadlessDialog.Panel className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <HeadlessDialog.Title className="text-lg font-semibold">Como instalar o Comparafy</HeadlessDialog.Title>
              <button className="rounded px-2 py-1 text-sm text-gray-600 hover:bg-gray-100" onClick={() => setInstallOpen(false)}>Fechar</button>
            </div>

            <div className="space-y-3">
              <div className="rounded-xl border border-gray-200 p-4">
                <div className="mb-1 flex items-center gap-2">
                  <IconIOS className="h-5 w-5" />
                  <span className="font-medium">iPhone / iPad (Safari)</span>
                </div>
                <ol className="list-decimal space-y-1 pl-5 text-sm text-gray-700">
                  <li>Toque em <strong>Compartilhar</strong> (quadrado com seta).</li>
                  <li>Escolha <strong>Adicionar à Tela de Início</strong>.</li>
                  <li>Confirme o nome e toque em <strong>Adicionar</strong>.</li>
                </ol>
              </div>

              <div className="rounded-xl border border-gray-200 p-4">
                <div className="mb-1 flex items-center gap-2">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 text-yellow-600" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="4.3" y="2.6" width="15.4" height="18.8" rx="4.2" /></svg>
                  <span className="font-medium">Android (Chrome / Edge / Brave)</span>
                </div>
                <ol className="list-decimal space-y-1 pl-5 text-sm text-gray-700">
                  <li>Procure o ícone <strong>Instalar</strong> na barra do navegador.</li>
                  <li>Ou abra o menu ⋮ → <strong>Instalar aplicativo</strong>.</li>
                </ol>
              </div>

              <div className="rounded-xl border border-gray-200 p-4">
                <div className="mb-1 flex items-center gap-2">
                  <ComputerDesktopIcon className="h-5 w-5 text-yellow-600" />
                  <span className="font-medium">Desktop (Chrome / Edge)</span>
                </div>
                <ol className="list-decimal space-y-1 pl-5 text-sm text-gray-700">
                  <li>Clique no ícone de <strong>Instalar</strong> na barra de endereço.</li>
                  <li>Ou menu: ≡ → <strong>Instalar “Comparafy”</strong>.</li>
                </ol>
              </div>
            </div>
          </HeadlessDialog.Panel>
        </div>
      </HeadlessDialog>

      {/* Modal: Termos */}
      <HeadlessDialog open={termsOpen} onClose={() => setTermsOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        <div className="fixed inset-0 grid place-items-center p-4">
          <HeadlessDialog.Panel className="w-full max-w-2xl rounded-2xl bg-white p-5 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <HeadlessDialog.Title className="text-lg font-semibold">Termos de uso</HeadlessDialog.Title>
              <button className="rounded px-2 py-1 text-sm text-gray-600 hover:bg-gray-100" onClick={() => setTermsOpen(false)}>Fechar</button>
            </div>
            <div className="prose prose-sm max-w-none text-gray-700">
              <h3>1. Introdução</h3>
              <p>Bem-vindo ao Comparafy! Estes Termos regem o uso do aplicativo.</p>
              <h3>2. Privacidade</h3>
              <p>Tratamos seus dados conforme nossa Política de Privacidade.</p>
              <h3>3. Uso do aplicativo</h3>
              <p>Use o Comparafy apenas para fins legais e pessoais.</p>
              <h3>4. Limitações de responsabilidade</h3>
              <p>Não garantimos a exatidão de preços informados por terceiros.</p>
              <h3>5. Alterações</h3>
              <p>Podemos atualizar estes Termos; notificaremos mudanças relevantes.</p>
              <h3>6. Contato</h3>
              <p>Dúvidas? Envie um e-mail para contato@comparafy.app.</p>
            </div>
          </HeadlessDialog.Panel>
        </div>
      </HeadlessDialog>
    </div>
  );
};

export default Profile;
