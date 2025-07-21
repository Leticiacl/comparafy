// src/pages/Profile.tsx

import React from "react";
import { auth } from "../services/firebase";
import { useNavigate } from "react-router-dom";
import BottomNav from "../components/BottomNav";
import {
  BellIcon,
  MoonIcon,
  DocumentTextIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";

const Profile = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await auth.signOut();
    sessionStorage.clear();
    navigate("/");
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex items-center justify-between p-4">
        <h1 className="text-2xl font-bold">Perfil</h1>
        <img src="/LOGO_REDUZIDA.png" alt="Logo" className="w-10 h-10" />
      </div>

      <div className="px-4 space-y-4 flex-1 overflow-y-auto">
        <div className="flex items-center gap-4">
          <UserCircleIcon className="w-14 h-14 text-gray-400" />
          <div>
            <p className="text-lg font-semibold">Usuário</p>
            <p className="text-sm text-gray-500">{auth.currentUser?.email || "Visitante"}</p>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BellIcon className="w-6 h-6 text-gray-400" />
              <span className="text-sm">Notificações</span>
            </div>
            <input type="checkbox" className="toggle toggle-sm" />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MoonIcon className="w-6 h-6 text-gray-400" />
              <span className="text-sm">Modo escuro</span>
            </div>
            <input type="checkbox" className="toggle toggle-sm" />
          </div>

          <div className="flex items-center gap-3">
            <DocumentTextIcon className="w-6 h-6 text-gray-400" />
            <span className="text-sm">Termos e privacidade</span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="mt-10 flex items-center gap-2 text-red-500 font-medium text-sm"
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5" />
          Sair do Comparafy
        </button>
      </div>

      <BottomNav activeTab="profile" />
    </div>
  );
};

export default Profile;
