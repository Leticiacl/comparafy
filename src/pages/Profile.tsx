// src/pages/Profile.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import BottomNav from '../components/BottomNav';
import { LogOut } from 'lucide-react';

const Profile: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    sessionStorage.clear();
    navigate('/');
  };

  return (
    <div className="p-4 pb-28 bg-white min-h-screen">
      <div className="flex justify-end mb-4">
        <img src="/LOGO_REDUZIDA.png" alt="Comparafy" className="h-8" />
      </div>

      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Perfil</h1>

      <div className="space-y-4">
        {/* Exemplo de seção: editar nome ou configurações futuras */}
        <div className="bg-gray-50 p-4 rounded-xl shadow-sm">
          <p className="text-gray-700">Nome do usuário</p>
          <p className="text-sm text-gray-400">Opções de edição em breve</p>
        </div>

        {/* Botão de sair - visível apenas aqui */}
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 w-full bg-red-100 text-red-600 font-medium py-3 rounded-xl shadow-sm"
        >
          <LogOut size={18} />
          Sair da conta
        </button>
      </div>

      <BottomNav activeTab="profile" />
    </div>
  );
};

export default Profile;
