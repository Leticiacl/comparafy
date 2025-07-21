import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  HomeIcon,
  ListIcon,
  ScanBarcodeIcon,
  CompareIcon,
  UserIcon,
} from 'lucide-react'

interface BottomNavProps {
  activeTab: 'home' | 'lists' | 'scanner' | 'compare' | 'profile'
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab }) => {
  const navigate = useNavigate()

  const getIconColor = (tab: string) =>
    activeTab === tab ? '#FACC15' : '#9CA3AF' // Amarelo ou cinza

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-md z-50">
      <div className="flex justify-between items-center px-6 py-2">
        <button onClick={() => navigate('/dashboard')} className="flex flex-col items-center text-xs">
          <HomeIcon size={24} color={getIconColor('home')} />
          Início
        </button>
        <button onClick={() => navigate('/lists')} className="flex flex-col items-center text-xs">
          <ListIcon size={24} color={getIconColor('lists')} />
          Listas
        </button>
        <button onClick={() => navigate('/compare')} className="flex flex-col items-center text-xs">
          <CompareIcon size={24} color={getIconColor('compare')} />
          Comparar
        </button>
        <button onClick={() => navigate('/scanner')} className="flex flex-col items-center text-xs">
          <ScanBarcodeIcon size={24} color={getIconColor('scanner')} />
          Scanner
        </button>
        <button onClick={() => navigate('/profile')} className="flex flex-col items-center text-xs">
          <UserIcon size={24} color={getIconColor('profile')} />
          Perfil
        </button>
      </div>
    </nav>
  )
}

export default BottomNav
