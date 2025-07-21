// src/components/BottomNav.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HomeIcon,
  ListBulletIcon,
  ScanBarcodeIcon,
  CompareIcon,
  UserCircleIcon
} from 'lucide-react';

interface BottomNavProps {
  activeTab: 'home' | 'lists' | 'scanner' | 'compare' | 'profile';
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab }) => {
  const navigate = useNavigate();

  const iconClass = (tab: string) =>
    tab === activeTab ? 'text-yellow-500' : 'text-gray-400';

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-16 z-50">
      <button onClick={() => navigate('/inicio')} className="flex flex-col items-center">
        <HomeIcon className={`w-6 h-6 ${iconClass('home')}`} />
        <span className="text-xs">Início</span>
      </button>
      <button onClick={() => navigate('/listas')} className="flex flex-col items-center">
        <ListBulletIcon className={`w-6 h-6 ${iconClass('lists')}`} />
        <span className="text-xs">Listas</span>
      </button>
      <button onClick={() => navigate('/compare')} className="flex flex-col items-center">
        <CompareIcon className={`w-6 h-6 ${iconClass('compare')}`} />
        <span className="text-xs">Comparar</span>
      </button>
      <button onClick={() => navigate('/scanner')} className="flex flex-col items-center">
        <ScanBarcodeIcon className={`w-6 h-6 ${iconClass('scanner')}`} />
        <span className="text-xs">Scanner</span>
      </button>
      <button onClick={() => navigate('/profile')} className="flex flex-col items-center">
        <UserCircleIcon className={`w-6 h-6 ${iconClass('profile')}`} />
        <span className="text-xs">Perfil</span>
      </button>
    </nav>
  );
};

export default BottomNav;
