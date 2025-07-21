// src/pages/Profile.tsx
import React from 'react';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import { auth } from '../services/firebase';
import { useNavigate } from 'react-router-dom';

const Profile: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await auth.signOut();
    sessionStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      <Header title="Perfil" />

      <div className="p-6">
        <div className="text-center">
          <p className="text-lg font-semibold mb-1">{auth.currentUser?.email || 'Usuário visitante'}</p>
        </div>

        <div className="mt-10">
          <button
            onClick={handleLogout}
            className="w-full text-red-500 border border-red-300 py-3 rounded-xl font-medium hover:bg-red-50 transition"
          >
            Sair da conta
          </button>
        </div>
      </div>

      <BottomNav activeTab="profile" />
    </div>
  );
};

export default Profile;
