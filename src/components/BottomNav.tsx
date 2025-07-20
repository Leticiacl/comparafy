// src/components/BottomNav.tsx
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  List,
  ScanBarcode,
  BadgePercent,
  User,
} from 'lucide-react';

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around items-center h-16">
        <button
          onClick={() => navigate('/')}
          className="flex flex-col items-center text-xs"
        >
          <Home className={`h-5 w-5 ${isActive('/') ? 'text-yellow-500' : 'text-gray-400'}`} />
          <span className={`${isActive('/') ? 'text-yellow-500' : 'text-gray-400'}`}>Início</span>
        </button>

        <button
          onClick={() => navigate('/lists')}
          className="flex flex-col items-center text-xs"
        >
          <List className={`h-5 w-5 ${isActive('/lists') ? 'text-yellow-500' : 'text-gray-400'}`} />
          <span className={`${isActive('/lists') ? 'text-yellow-500' : 'text-gray-400'}`}>Listas</span>
        </button>

        <button
          onClick={() => navigate('/scanner')}
          className="flex flex-col items-center text-xs"
        >
          <ScanBarcode className={`h-5 w-5 ${isActive('/scanner') ? 'text-yellow-500' : 'text-gray-400'}`} />
          <span className={`${isActive('/scanner') ? 'text-yellow-500' : 'text-gray-400'}`}>Scanner</span>
        </button>

        <button
          onClick={() => navigate('/compare')}
          className="flex flex-col items-center text-xs"
        >
          <BadgePercent className={`h-5 w-5 ${isActive('/compare') ? 'text-yellow-500' : 'text-gray-400'}`} />
          <span className={`${isActive('/compare') ? 'text-yellow-500' : 'text-gray-400'}`}>Comparar</span>
        </button>

        <button
          onClick={() => navigate('/profile')}
          className="flex flex-col items-center text-xs"
        >
          <User className={`h-5 w-5 ${isActive('/profile') ? 'text-yellow-500' : 'text-gray-400'}`} />
          <span className={`${isActive('/profile') ? 'text-yellow-500' : 'text-gray-400'}`}>Perfil</span>
        </button>
      </div>
    </nav>
  );
};

export default BottomNav;
