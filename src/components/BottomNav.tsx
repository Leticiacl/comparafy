import React from "react";
import { NavLink } from "react-router-dom";
import { GoHome } from "react-icons/go";
import { IoListOutline } from "react-icons/io5";
import { MdCompareArrows } from "react-icons/md";
import { FiShoppingCart, FiUser } from "react-icons/fi";

type TabKey = "home" | "lists" | "compare" | "purchases" | "profile";

interface BottomNavProps {
  activeTab: TabKey;
}

const tabs: { key: TabKey; to: string; icon: React.ReactNode; label: string }[] = [
  { key: "home", to: "/dashboard", icon: <GoHome size={22} />, label: "Início" },
  { key: "lists", to: "/lists", icon: <IoListOutline size={22} />, label: "Listas" },
  { key: "compare", to: "/compare", icon: <MdCompareArrows size={22} />, label: "Comparar" },
  { key: "purchases", to: "/purchases", icon: <FiShoppingCart size={22} />, label: "Compras" },
  { key: "profile", to: "/profile", icon: <FiUser size={22} />, label: "Perfil" },
];

const BottomNav: React.FC<BottomNavProps> = ({ activeTab }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t px-6 py-2 flex justify-between z-50 max-w-xl mx-auto">
      {tabs.map((tab) => (
        <NavLink
          key={tab.key}
          to={tab.to}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-1 ${
              isActive || activeTab === tab.key ? "text-yellow-500" : "text-gray-400"
            }`
          }
        >
          {tab.icon}
          <span className="text-xs">{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNav;
