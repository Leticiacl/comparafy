import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  HomeIcon,
  ListBulletIcon,
  ArrowsRightLeftIcon,
  QrCodeIcon,
  UserIcon,
} from '@heroicons/react/24/outline'

interface BottomNavProps {
  activeTab: 'home' | 'lists' | 'compare' | 'scanner' | 'profile'
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab }) => {
  const navigate = useNavigate()
  const location = useLocation()

  const iconColor = (tab: string) => (activeTab === tab ? 'text-yellow-500' : 'text-gray-400')

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-md border-t border-gray-200 z-50">
      <div className="flex justify-around items-center h-16">
        <button onClick={() => navigate('/dashboard')} className="flex flex-col items-center">
          <HomeIcon className={`h-6 w-6 ${iconColor('home')}`} />
          <span className="text-xs">Início</span>
        </button>
        <button onClick={() => navigate('/lists')} className="flex flex-col items-center">
          <ListBulletIcon className={`h-6 w-6 ${iconColor('lists')}`} />
          <span className="text-xs">Listas</span>
        </button>
        <button onClick={() => navigate('/compare')} className="flex flex-col items-center">
          <ArrowsRightLeftIcon className={`h-6 w-6 ${iconColor('compare')}`} />
          <span className="text-xs">Comparar</span>
        </button>
        <button onClick={() => navigate('/scanner')} className="flex flex-col items-center">
          <QrCodeIcon className={`h-6 w-6 ${iconColor('scanner')}`} />
          <span className="text-xs">Scanner</span>
        </button>
        <button onClick={() => navigate('/profile')} className="flex flex-col items-center">
          <UserIcon className={`h-6 w-6 ${iconColor('profile')}`} />
          <span className="text-xs">Perfil</span>
        </button>
      </div>
    </nav>
  )
}

export default BottomNav
