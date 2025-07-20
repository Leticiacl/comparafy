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

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    await signOut(auth);
    sessionStorage.removeItem('userLogged');
    navigate('/login');
  };

  const isProfilePage = location.pathname === '/profile';

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

        <div className="relative flex flex-col items-center text-xs">
          <button
            onClick={() => navigate('/profile')}
            className="flex flex-col items-center"
          >
            <User className={`h-5 w-5 ${isProfilePage ? 'text-yellow-500' : 'text-gray-400'}`} />
            <span className={`${isProfilePage ? 'text-yellow-500' : 'text-gray-400'}`}>Perfil</span>
          </button>

          {isProfilePage && (
            <button
              onClick={handleLogout}
              className="mt-1 text-xs text-red-500 flex items-center gap-1"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
