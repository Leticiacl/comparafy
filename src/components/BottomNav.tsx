// src/components/BottomNav.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Home,
  List,
  BarChart,
  Camera,
  User,
} from 'lucide-react';

interface BottomNavProps {
  activeTab: 'home' | 'lists' | 'compare' | 'scanner' | 'profile' | '';
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab }) => {
  const navigate = useNavigate();

  const tabs = [
    { name: 'Início', icon: <Home size={22} />, route: '/inicio', key: 'home' },
    { name: 'Listas', icon: <List size={22} />, route: '/listas', key: 'lists' },
    { name: 'Comparar', icon: <BarChart size={22} />, route: '/comparar', key: 'compare' },
    { name: 'Scanner', icon: <Camera size={22} />, route: '/scanner', key: 'scanner' },
    { name: 'Perfil', icon: <User size={22} />, route: '/perfil', key: 'profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-sm flex justify-around items-center h-16 z-50">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => navigate(tab.route)}
          className="flex flex-col items-center justify-center text-xs font-medium"
        >
          <div className={activeTab === tab.key ? 'text-yellow-500' : 'text-gray-500'}>
            {tab.icon}
          </div>
          <span className={activeTab === tab.key ? 'text-yellow-500 text-[11px]' : 'text-gray-500 text-[11px]'}>
            {tab.name}
          </span>
        </button>
      ))}
    </nav>
  );
};

export default BottomNav;
