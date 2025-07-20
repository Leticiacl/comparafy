import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  List,
  ScanBarcode,
  BadgePercent,
  User,
  LogOut,
} from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';

const BottomNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const currentPath = location.pathname;

  const handleLogout = async () => {
    await signOut(auth);
    sessionStorage.removeItem('userLogged');
    navigate('/login');
  };

  const tabs = [
    { path: '/', icon: Home, label: 'Início' },
    { path: '/lists', icon: List, label: 'Listas' },
    { path: '/scanner', icon: ScanBarcode, label: 'Scanner' },
    { path: '/compare', icon: BadgePercent, label: 'Comparar' },
    { path: '/profile', icon: User, label: 'Perfil' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around items-center h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentPath === tab.path;

          return (
            <div key={tab.path} className="flex flex-col items-center text-xs relative">
              <button
                onClick={() => navigate(tab.path)}
                className="flex flex-col items-center"
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-yellow-500' : 'text-gray-400'}`} />
                <span className={`${isActive ? 'text-yellow-500' : 'text-gray-400'}`}>{tab.label}</span>
              </button>

              {/* Mostra o botão de sair apenas na aba de perfil */}
              {tab.path === '/profile' && isActive && (
                <button
                  onClick={handleLogout}
                  className="mt-1 text-xs text-red-500 flex items-center gap-1"
                >
                  <LogOut className="w-4 h-4" />
                  Sair
                </button>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
