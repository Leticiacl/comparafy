// src/components/BottomNav.tsx

import { GoHome } from 'react-icons/go'
import { IoListOutline } from 'react-icons/io5'
import { MdCompareArrows } from 'react-icons/md'
import { LuScanLine } from 'react-icons/lu'
import { FiUser } from 'react-icons/fi'

import { useLocation, useNavigate } from 'react-router-dom'
import React from 'react'

interface BottomNavProps {
  activeTab: 'home' | 'lists' | 'compare' | 'scanner' | 'profile'
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab }) => {
  const navigate = useNavigate()
  const location = useLocation()

  const navItems = [
    { icon: <GoHome />, label: 'Início', path: '/dashboard', key: 'home' },
    { icon: <IoListOutline />, label: 'Listas', path: '/lists', key: 'lists' },
    { icon: <MdCompareArrows />, label: 'Comparar', path: '/compare', key: 'compare' },
    { icon: <LuScanLine />, label: 'Scanner', path: '/scanner', key: 'scanner' },
    { icon: <FiUser />, label: 'Perfil', path: '/profile', key: 'profile' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <ul className="flex justify-around py-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.key
          return (
            <li key={item.key}>
              <button
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center text-xs ${
                  isActive ? 'text-yellow-500' : 'text-gray-500'
                }`}
              >
                <div className="text-2xl">{item.icon}</div>
                <span>{item.label}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export default BottomNav
