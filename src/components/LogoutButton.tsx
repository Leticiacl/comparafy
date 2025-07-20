// src/components/LogoutButton.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import { showToast } from './ui/Toaster';

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    sessionStorage.removeItem('userId');
    showToast.success('Logout realizado com sucesso!');
    navigate('/login');
  };

  return (
    <button
      onClick={handleLogout}
      className="text-sm text-red-600 underline mt-4"
    >
      Sair do Comparafy
    </button>
  );
};

export default LogoutButton;
