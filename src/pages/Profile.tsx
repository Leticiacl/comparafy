import React from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/firebase';
import { LogOutIcon } from 'lucide-react';

const Profile: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    auth.signOut().then(() => {
      sessionStorage.clear();
      navigate('/login');
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6 text-center space-y-6">
      {/* Logo */}
      <img
        src="/COMPARAFY.png"
        alt="Logo Comparify"
        className="w-20 h-20 mx-auto mb-2"
      />

      {/* Título */}
      <h1 className="text-2xl font-bold text-gray-900">Perfil</h1>
      <p className="text-gray-500">Gerencie suas preferências e configurações.</p>

      {/* Botão sair da conta */}
      <button
        onClick={handleLogout}
        className="flex items-center justify-center text-red-500 gap-2 mt-6"
      >
        <LogOutIcon className="w-5 h-5" />
        <span className="font-medium">Sair da conta</span>
      </button>
    </div>
  );
};

export default Profile;
