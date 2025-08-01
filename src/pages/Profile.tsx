// src/pages/Profile.tsx
import React, { useState, useEffect, ChangeEvent, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { auth, storage } from "../services/firebase";
import { updateProfile, signOut } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { CameraIcon } from "@heroicons/react/24/outline";
import BottomNav from "../components/BottomNav";

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const user = auth.currentUser;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState(user?.displayName || "");
  const [photoURL, setPhotoURL] = useState(user?.photoURL || "");
  const [uploading, setUploading] = useState(false);

  // Sincroniza nome e foto do Firebase Auth
  useEffect(() => {
    if (user) {
      setName(user.displayName || "");
      setPhotoURL(user.photoURL || "");
    }
  }, [user]);

  const handleNameSave = async () => {
    if (user && name.trim()) {
      await updateProfile(user, { displayName: name.trim() });
      setEditingName(false);
    }
  };

  const handlePhotoChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files?.[0]) return;
    setUploading(true);
    const file = e.target.files[0];
    const avatarRef = ref(storage, `avatars/${user.uid}`);
    await uploadBytes(avatarRef, file);
    const url = await getDownloadURL(avatarRef);
    await updateProfile(user, { photoURL: url });
    setPhotoURL(url);
    setUploading(false);
  };

  const handleTerms = () => {
    // navega para a rota /terms (criada em src/pages/Terms.tsx)
    navigate("/terms");
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <div className="p-4 pb-32 max-w-xl mx-auto bg-white space-y-6">
      <h1 className="text-2xl font-bold">Perfil</h1>

      {/* Card com avatar, nome e botão de editar */}
      <div className="bg-white rounded-xl shadow p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-full bg-gray-200 overflow-hidden">
              {photoURL && (
                <img
                  src={photoURL}
                  alt="Avatar"
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 bg-yellow-400 rounded-full p-1 shadow"
              disabled={uploading}
              aria-label="Alterar foto"
            >
              <CameraIcon className="h-5 w-5 text-white" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
          </div>

          <div>
            {editingName ? (
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="border px-3 py-1 rounded-lg w-40"
                />
                <button
                  onClick={handleNameSave}
                  className="text-yellow-600 font-medium"
                >
                  Salvar
                </button>
              </div>
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-semibold">
                  {user?.displayName || "—"}
                </span>
                <button
                  onClick={() => setEditingName(true)}
                  className="text-sm text-yellow-600 hover:underline"
                >
                  Editar
                </button>
              </div>
            )}
            <div className="text-sm text-gray-500">{user?.email}</div>
          </div>
        </div>
      </div>

      {/* Lista de opções */}
      <div className="bg-white rounded-xl shadow divide-y">
        <button
          onClick={handleTerms}
          className="w-full text-left px-4 py-3 flex justify-between items-center hover:bg-gray-50"
        >
          <span>Termos de uso</span>
          <span className="text-gray-400">&gt;</span>
        </button>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full py-3 bg-red-50 text-red-600 font-medium rounded-lg hover:bg-red-100 transition"
      >
        Sair da conta
      </button>

      {/* Bottom Nav */}
      <BottomNav activeTab="profile" />
    </div>
  );
};

export default Profile;
