// src/pages/Profile.tsx
import React, {
  useState,
  useEffect,
  ChangeEvent,
  useRef
} from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../services/firebase";
import { updateProfile, signOut } from "firebase/auth";
import { CameraIcon } from "@heroicons/react/24/outline";
import BottomNav from "../components/BottomNav";

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const user = auth.currentUser!;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(user.displayName || "");
  const [editingName, setEditingName] = useState(false);
  const [uploading, setUploading] = useState(false);

  // photoURL vazio para visitante
  const [photoURL, setPhotoURL] = useState<string>(
    () => user.photoURL || ""
  );

  useEffect(() => {
    setName(user.displayName || "");
    setPhotoURL(user.photoURL || "");
  }, [user]);

  // somente atualiza profile auth, sem storage externo
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
      <h1 className="text-2xl font-bold">Perfil</h1>

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
                    e.currentTarget.onerror = null;
                    // se der erro, esvazia
                    setPhotoURL("");
                  }}
                />
              )}
            </div>
            {/* Botão de câmera (sempre visível) */}
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
                  {user.displayName || "—"}
                </span>
                <button
                  onClick={() => setEditingName(true)}
                  className="text-sm text-yellow-600 hover:underline"
                >
                  Editar
                </button>
              </div>
            )}
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
        </div>
      </div>

      {/* Termos de uso */}
      <div className="bg-white rounded-xl shadow divide-y">
        <Link
          to="/terms"
          className="w-full text-left px-4 py-3 flex justify-between items-center hover:bg-gray-50"
        >
          <span>Termos de uso</span>
          <span className="text-gray-400">&gt;</span>
        </Link>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full py-3 bg-red-50 text-red-600 font-medium rounded-lg hover:bg-red-100 transition"
      >
        Sair da conta
      </button>

      <BottomNav activeTab="profile" />
    </div>
  );
};

export default Profile;
