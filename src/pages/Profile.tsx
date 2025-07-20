// src/pages/Profile.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import BottomNav from '../components/BottomNav';
import {
  ArrowRightOnRectangleIcon,
  BellIcon,
  DocumentTextIcon,
  PencilSquareIcon,
  UserCircleIcon,
  CameraIcon,
} from '@heroicons/react/24/outline';

const Profile: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    <div className="flex flex-col min-h-screen pb-24">
      <div className="flex flex-col items-center py-6 space-y-2">
        <UserCircleIcon className="h-20 w-20 text-gray-400" />
        <h2 className="text-xl font-semibold text-gray-900">Minha Conta</h2>
      </div>

      <div className="space-y-1 px-4 text-sm text-gray-800">
        <div className="flex items-center justify-between py-4 border-b">
          <span className="flex items-center gap-2">
            <PencilSquareIcon className="h-5 w-5 text-gray-500" />
            Editar nome
          </span>
        </div>
        <div className="flex items-center justify-between py-4 border-b">
          <span className="flex items-center gap-2">
            <CameraIcon className="h-5 w-5 text-gray-500" />
            Alterar foto de perfil
          </span>
        </div>
        <div className="flex items-center justify-between py-4 border-b">
          <span className="flex items-center gap-2">
            <BellIcon className="h-5 w-5 text-gray-500" />
            Notificações
          </span>
        </div>
        <div className="flex items-center justify-between py-4 border-b">
          <span className="flex items-center gap-2">
            <DocumentTextIcon className="h-5 w-5 text-gray-500" />
            Termos de uso
          </span>
        </div>
      </div>

      {/* Botão de sair - somente nesta tela */}
      <div className="mt-auto px-4">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-red-500 text-sm mt-6"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5" />
          Sair da conta
        </button>
      </div>

      <BottomNav activeTab="profile" />
    </div>
  );
};

export default Profile;
