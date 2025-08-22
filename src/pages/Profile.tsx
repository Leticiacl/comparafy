// src/pages/Profile.tsx
import React, { useState, useEffect, ChangeEvent, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../services/firebase";
import { updateProfile, signOut } from "firebase/auth";
import { CameraIcon } from "@heroicons/react/24/outline";
import BottomNav from "../components/BottomNav";
import PageHeader from "../components/ui/PageHeader";

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const user = auth.currentUser!;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(user.displayName || "");
  const [editingName, setEditingName] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photoURL, setPhotoURL] = useState<string>(() => user.photoURL || "");

  useEffect(() => {
    setName(user.displayName || "");
    setPhotoURL(user.photoURL || "");
  }, [user]);

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      await updateProfile(user, { photoURL: dataUrl });
      setPhotoURL(dataUrl);
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleNameSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    await updateProfile(user, { displayName: trimmed });
    setEditingName(false);
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <div className="p-4 pb-32 max-w-xl mx-auto bg-white space-y-6">
      <PageHeader title="Perfil" />

      {/* Card de avatar + nome */}
      <div className="bg-white rounded-xl shadow p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="relative">
            <div className="h-16 w-16 rounded-full bg-gray-200 overflow-hidden">
              {photoURL && (
                <img
                  src={photoURL}
                  alt="Avatar"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).onerror = null;
                    setPhotoURL("");
                  }}
                />
              )}
            </div>
            {/* Botão de câmera */}
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

          {/* Nome + editar */}
          <div>
            {editingName ? (
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded border px-2 py-1"
                />
                <button
                  className="text-sm font-semibold text-yellow-600"
                  onClick={handleNameSave}
                >
                  Salvar
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-gray-900">
                  {name || "Visitante"}
                </h2>
                <button
                  className="text-sm text-yellow-600 underline"
                  onClick={() => setEditingName(true)}
                >
                  Editar
                </button>
              </div>
            )}
            <p className="text-sm text-gray-600">
              <span className="font-medium">E-mail:</span>{" "}
              {user.email || "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="space-y-3">
        <Link
          to="/terms"
          className="block rounded-xl border border-gray-200 p-4 hover:bg-gray-50"
        >
          Termos de Uso
        </Link>
        <button
          onClick={handleLogout}
          className="w-full rounded-2xl bg-gray-100 hover:bg-gray-200 text-black py-3"
        >
          Sair
        </button>
      </div>

      <BottomNav activeTab="profile" />
    </div>
  );
};

export default Profile;
