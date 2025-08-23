// src/components/BottomNav.tsx
import React from "react";
import { Link } from "react-router-dom";
import {
  HomeIcon, ListBulletIcon, ArrowsRightLeftIcon,
  ShoppingCartIcon, UserIcon
} from "@heroicons/react/24/outline";

const Item: React.FC<{ to: string; label: string; icon: React.ReactNode; active?: boolean }> = ({ to, label, icon, active }) => (
  <Link to={to} className={`flex flex-1 flex-col items-center justify-center gap-1 py-2 ${active ? "text-yellow-600" : "text-gray-500"}`}>
    {icon}
    <span className="text-sm">{label}</span>
  </Link>
);

const BottomNav: React.FC<{ activeTab?: "home"|"lists"|"compare"|"purchases"|"profile" }> = ({ activeTab }) => {
  return (
    <nav data-bottom-nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-white">
      <div className="mx-auto flex max-w-xl">
        <Item to="/"        label="Início"     icon={<HomeIcon className="h-6 w-6" />}          active={activeTab==="home"} />
        <Item to="/lists"   label="Listas"     icon={<ListBulletIcon className="h-6 w-6" />}     active={activeTab==="lists"} />
        <Item to="/compare" label="Comparar"   icon={<ArrowsRightLeftIcon className="h-6 w-6" />} active={activeTab==="compare"} />
        <Item to="/purchases" label="Compras"  icon={<ShoppingCartIcon className="h-6 w-6" />}   active={activeTab==="purchases"} />
        <Item to="/profile" label="Perfil"     icon={<UserIcon className="h-6 w-6" />}           active={activeTab==="profile"} />
      </div>
    </nav>
  );
};

export default BottomNav;
