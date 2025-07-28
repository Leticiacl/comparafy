import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GoHome } from 'react-icons/go';
import { IoListOutline } from 'react-icons/io5';
import { MdCompareArrows } from 'react-icons/md';
import { LuScanLine } from 'react-icons/lu';
import { FiUser } from 'react-icons/fi';

interface BottomNavProps {
  activeTab: 'home' | 'lists' | 'compare' | 'scanner' | 'profile';
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab }) => {
  const navigate = useNavigate();

  const linkClasses = (tab: string) =>
    `flex flex-col items-center justify-center gap-1 ${
      activeTab === tab ? 'text-yellow-500' : 'text-gray-400'
    }`;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t px-6 py-2 flex justify-between z-50 max-w-xl mx-auto">
      <button className={linkClasses('home')} onClick={() => navigate('/dashboard')}>
        <GoHome size={22} />
        <span className="text-xs">Início</span>
      </button>
      <button className={linkClasses('lists')} onClick={() => navigate('/lists')}>
        <IoListOutline size={22} />
        <span className="text-xs">Listas</span>
      </button>
      <button className={linkClasses('compare')} onClick={() => navigate('/compare')}>
        <MdCompareArrows size={22} />
        <span className="text-xs">Comparar</span>
      </button>
      <button className={linkClasses('scanner')} onClick={() => navigate('/scanner')}>
        <LuScanLine size={22} />
        <span className="text-xs">Scanner</span>
      </button>
      <button className={linkClasses('profile')} onClick={() => navigate('/profile')}>
        <FiUser size={22} />
        <span className="text-xs">Perfil</span>
      </button>
    </nav>
  );
};

export default BottomNav;
