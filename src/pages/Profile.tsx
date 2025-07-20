// src/pages/Profile.tsx
import React from 'react';
import { LogOut, UserCircle } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';

const Profile: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    sessionStorage.removeItem('userLogged');
    navigate('/login');
  };

  return (
    <div className="p-6 pb-24 space-y-6">
      <div className="flex flex-col items-center space-y-3">
        <UserCircle className="w-16 h-16 text-gray-500" />
        <p className="text-lg font-semibold text-gray-800">Minha Conta</p>
      </div>

      <div className="space-y-4">
        <button className="w-full text-left text-gray-800 text-sm py-3 border-b">
          Editar nome
        </button>
        <button className="w-full text-left text-gray-800 text-sm py-3 border-b">
          Alterar foto de perfil
        </button>
        <button className="w-full text-left text-gray-800 text-sm py-3 border-b">
          Notificações
        </button>
        <button className="w-full text-left text-gray-800 text-sm py-3 border-b">
          Termos de uso
        </button>
      </div>

      <button
        onClick={handleLogout}
        className="flex items-center justify-center gap-2 w-full text-red-500 mt-6 font-medium"
      >
        <LogOut className="w-5 h-5" />
        Sair da conta
      </button>

      <BottomNav />
    </div>
  );
};

export default Profile;
