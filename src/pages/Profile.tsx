// src/pages/Profile.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "@/components/ui/PageHeader";
import BottomNav from "@/components/BottomNav";
import { auth } from "@/services/firebase";
import {
  updateProfile,
  onAuthStateChanged,
  signOut as firebaseSignOut,
} from "firebase/auth";
import {
  CameraIcon,
  PencilSquareIcon,
  ArrowTopRightOnSquareIcon,
  PowerIcon,
  DevicePhoneMobileIcon,
  DocumentTextIcon,
  ComputerDesktopIcon,
} from "@heroicons/react/24/outline";
import { Dialog } from "@headlessui/react";
import InstallHowToModal from "@/components/ui/InstallHowToModal";

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

  const avatarLetter = useMemo(
    () => (displayName || " ").trim().slice(0, 1).toUpperCase(),
    [displayName]
  );

  const saveName = async () => {
    const name = (inputRef.current?.value || "").trim();
    if (!auth.currentUser || !name) {
      setEditing(false);
      return;
    }
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

  return (
    <div className="mx-auto max-w-xl bg-white p-4 pb-28">
      <PageHeader title="Perfil" />

      {/* Card do perfil */}
      <section className="mt-3 rounded-2xl border border-gray-200 bg-white p-4">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="relative h-16 w-16 shrink-0">
            {photoURL ? (
              <img
                src={photoURL}
                alt="Foto do perfil"
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <div className="grid h-16 w-16 place-items-center rounded-full bg-yellow-100 text-lg font-semibold text-yellow-900">
                {avatarLetter}
              </div>
            )}

            {/* Câmera pequena (não altera o tamanho da foto) */}
            <button
              type="button"
              onClick={triggerFile}
              title="Alterar foto"
              className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full bg-yellow-500 text-black shadow hover:brightness-95"
            >
              <CameraIcon className="h-3 w-3" />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onPickFile}
            />
          </div>

          {/* Nome + lápis */}
          <div className="min-w-0 flex-1">
            {!editing ? (
              <div className="flex items-center gap-2">
                <h2 className="truncate text-base font-semibold text-gray-900">
                  {displayName || "Seu nome"}
                </h2>
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="rounded p-1 text-gray-500 hover:bg-gray-100"
                  title="Editar nome"
                >
                  <PencilSquareIcon className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  defaultValue={displayName}
                  placeholder="Seu nome"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-yellow-400"
                />
                <button
                  type="button"
                  onClick={saveName}
                  className="rounded-lg bg-yellow-500 px-3 py-2 text-sm font-medium text-black hover:brightness-95"
                >
                  Salvar
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-700 hover:bg-gray-200"
                >
                  Cancelar
                </button>
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

      {/* Instalar aplicativo */}
      <section className="mt-4 rounded-2xl border border-gray-200 bg-white p-4">
        <div className="flex items-start gap-3">
          <DevicePhoneMobileIcon className="mt-0.5 h-5 w-5 text-yellow-600" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">Instalar aplicativo</h3>
              <button
                className="rounded p-1 text-gray-500 hover:bg-gray-100"
                onClick={() => setInstallOpen(true)}
                title="Como instalar"
              >
                <ArrowTopRightOnSquareIcon className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-1 text-sm text-gray-600">
              Adicione o Comparafy à tela inicial para uma experiência melhor.
            </p>
          </div>
        </div>
      </section>

      {/* Termos de uso */}
      <section className="mt-4 rounded-2xl border border-gray-200 bg-white p-4">
        <div className="flex items-start gap-3">
          <DocumentTextIcon className="mt-0.5 h-5 w-5 text-yellow-600" />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">Termos de uso</h3>
              <button
                className="rounded p-1 text-gray-500 hover:bg-gray-100"
                onClick={() => setTermsOpen(true)}
                title="Abrir termos"
              >
                <ArrowTopRightOnSquareIcon className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-1 text-sm text-gray-600">
              Leia os termos e como tratamos seus dados.
            </p>
          </div>
        </div>
      </section>

      {/* Sair */}
      <div className="mt-6">
        <button
          type="button"
          onClick={handleSignOut}
          className="inline-flex items-center gap-2 text-sm font-medium text-red-600 hover:underline"
        >
          <PowerIcon className="h-4 w-4" />
          Sair do Comparafy
        </button>
      </div>

      <BottomNav activeTab="profile" />

      {/* Modal: Como instalar (usa o componente padronizado com ícones corretos) */}
      <InstallHowToModal open={installOpen} onClose={() => setInstallOpen(false)} />

      {/* Modal: Termos */}
      <Dialog open={termsOpen} onClose={() => setTermsOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
        <div className="fixed inset-0 grid place-items-center p-4">
          <Dialog.Panel className="w-full max-w-2xl rounded-2xl bg-white p-5 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <Dialog.Title className="text-lg font-semibold">Termos de uso</Dialog.Title>
              <button
                className="rounded px-2 py-1 text-sm text-gray-600 hover:bg-gray-100"
                onClick={() => setTermsOpen(false)}
              >
                Fechar
              </button>
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
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

export default Profile;
