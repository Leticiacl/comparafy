import React from 'react';
import { auth } from '../services/firebase';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { LogOut } from 'lucide-react';

const Profile: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      alert('Erro ao sair da conta');
    }
  };

  return (
    <div className="p-6 pb-28 min-h-screen bg-white text-gray-800 flex flex-col justify-between">
      <div>
        <h1 className="text-2xl font-bold mb-6">Perfil</h1>

        {/* Aqui você pode adicionar dados do usuário futuramente */}
        <div className="bg-gray-100 p-4 rounded-xl shadow mb-6">
          <p className="text-sm text-gray-600">Email autenticado:</p>
          <p className="text-base font-medium text-gray-800">
            {auth.currentUser?.email || 'Usuário visitante'}
          </p>
        </div>

        {/* Outras opções do perfil (modo escuro, notificações etc.) podem vir aqui */}
      </div>

      {/* Botão de sair da conta */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 text-red-600 border border-red-500 py-3 rounded-xl font-semibold text-sm"
      >
        <LogOut className="w-4 h-4" />
        Sair da conta
      </button>

      {/* Navegação inferior */}
      <BottomNav activeTab="profile" />
    </div>
  );
};

export default Profile;
