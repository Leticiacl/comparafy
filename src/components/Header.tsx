// src/components/Header.tsx
import React from 'react';
import LogoutButton from './LogoutButton';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      <div className="flex flex-col items-end gap-1">
        <img src="/LOGO_REDUZIDA.png" alt="Logo Comparify" className="w-10 h-10" />
        <LogoutButton />
      </div>
    </div>
  );
};

export default Header;
