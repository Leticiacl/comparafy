// src/components/BottomNav.tsx
import React from 'react';
import { HomeIcon, ListIcon, CameraIcon, CompareIcon, UserIcon } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: 'Início', icon: <HomeIcon className="w-5 h-5" />, path: '/dashboard' },
    { label: 'Listas', icon: <ListIcon className="w-5 h-5" />, path: '/lists' },
    { label: 'Scanner', icon: <CameraIcon className="w-5 h-5" />, path: '/scanner' },
    { label: 'Comparar', icon: <CompareIcon className="w-5 h-5" />, path: '/compare' },
    { label: 'Perfil', icon: <UserIcon className="w-5 h-5" />, path: '/profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-md z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center justify-center text-xs font-medium ${
              location.pathname === item.path ? 'text-yellow-500' : 'text-gray-500'
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
