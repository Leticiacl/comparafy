import React from "react";
import { NavLink } from "react-router-dom";
import { GoHome } from "react-icons/go";
import { IoListOutline } from "react-icons/io5";
import { MdCompareArrows } from "react-icons/md";
import { FiShoppingCart, FiUser } from "react-icons/fi";

type TabKey = "home" | "lists" | "compare" | "purchases" | "profile";

const tabs: { key: TabKey; to: string; icon: React.ReactNode; label: string }[] = [
  { key: "home",      to: "/",                         icon: <GoHome size={22} />,           label: "Início" },
  { key: "lists",     to: "/lists",                    icon: <IoListOutline size={22} />,     label: "Listas" },
  // 👇 força abrir a aba Produtos (param em pt-BR para bater com a página)
  { key: "compare",   to: "/compare?tab=produtos",     icon: <MdCompareArrows size={22} />,   label: "Comparar" },
  { key: "purchases", to: "/purchases",                icon: <FiShoppingCart size={22} />,    label: "Compras" },
  { key: "profile",   to: "/profile",                  icon: <FiUser size={22} />,            label: "Perfil" },
];

export default function BottomNav({ activeTab }: { activeTab: TabKey }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 mx-auto flex max-w-xl justify-between border-t bg-white px-6 py-2">
      {tabs.map((t) => (
        <NavLink
          key={t.key}
          to={t.to}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-1 ${
              isActive || activeTab === t.key ? "text-yellow-500" : "text-gray-400"
            }`
          }
        >
          {t.icon}
          <span className="text-xs">{t.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
