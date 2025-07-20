// src/components/BottomNav.tsx
import React from 'react';
import { HomeIcon, ListIcon, CameraIcon, CircleEqualIcon, UserIcon } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const tabs = [
    { name: 'Início', icon: <HomeIcon size={22} />, path: '/dashboard' },
    { name: 'Listas', icon: <ListIcon size={22} />, path: '/lists' },
    { name: 'Scanner', icon: <CameraIcon size={22} />, path: '/scanner' },
    { name: 'Comparar', icon: <CircleEqualIcon size={22} />, path: '/compare' },
    { name: 'Perfil', icon: <UserIcon size={22} />, path: '/profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-inner">
      <div className="flex justify-around items-center h-16">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            onClick={() => navigate(tab.path)}
            className={`flex flex-col items-center justify-center text-sm ${
              location.pathname === tab.path ? 'text-yellow-500 font-semibold' : 'text-gray-500'
            }`}
          >
            {tab.icon}
            <span>{tab.name}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
