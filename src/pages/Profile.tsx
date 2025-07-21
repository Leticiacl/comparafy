// src/pages/Profile.tsx
import React from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';

const Profile: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      sessionStorage.clear();
      navigate('/');
    } catch (error) {
      console.error('Erro ao sair da conta:', error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header com logo */}
      <div className="flex justify-between items-center p-4">
        <h1 className="text-xl font-bold">Perfil</h1>
        <img src="/LOGO_REDUZIDA.png" alt="Logo" className="h-10" />
      </div>

      {/* Conteúdo do perfil */}
      <div className="flex-1 px-6 py-4 space-y-6">
        <div className="text-center">
          <div className="w-24 h-24 rounded-full bg-gray-200 mx-auto mb-2" />
          <h2 className="text-lg font-semibold">Nome do usuário</h2>
          <p className="text-sm text-gray-500">email@email.com</p>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span>Editar nome</span>
            <button className="text-blue-500 font-medium">Editar</button>
          </div>

          <div className="flex justify-between items-center">
            <span>Alterar foto</span>
            <button className="text-blue-500 font-medium">Editar</button>
          </div>

          <div className="flex justify-between items-center">
            <span>Notificações</span>
            <label className="inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-yellow-400"></div>
            </label>
          </div>

          <div className="flex justify-between items-center">
            <span>Modo escuro</span>
            <label className="inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-yellow-400"></div>
            </label>
          </div>

          <div className="flex justify-between items-center">
            <span>Termos e condições</span>
            <button className="text-blue-500 font-medium">Ver</button>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="mt-8 text-red-500 font-semibold py-2 rounded-xl w-full border border-red-300"
        >
          Sair da conta
        </button>
      </div>

      <BottomNav activeTab="profile" />
    </div>
  );
};

export default Profile;
