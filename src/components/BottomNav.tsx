// src/components/BottomNav.tsx
import React from "react";
import { Link } from "react-router-dom";
import {
  HomeIcon,
  Bars3Icon,
  ArrowsRightLeftIcon,
  ShoppingCartIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

type Props = {
  activeTab?: "home" | "lists" | "compare" | "purchases" | "profile";
};

const Item: React.FC<{
  to: string;
  label: string;
  active?: boolean;
  icon: React.ReactNode;
}> = ({ to, label, active, icon }) => (
  <Link
    to={to}
    className={`flex flex-1 flex-col items-center justify-center gap-1 rounded-xl px-3 py-3
      ${active ? "text-yellow-600" : "text-gray-500 hover:text-gray-700"}`}
    aria-current={active ? "page" : undefined}
  >
    <div className="h-6 w-6">{icon}</div>
    <span className="text-xs">{label}</span>
  </Link>
);

const BottomNav: React.FC<Props> = ({ activeTab }) => {
  return (
    <nav
      data-bottom-nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80"
      style={{
        // Safe area iOS + folga mínima de 10px
        paddingBottom: "max(env(safe-area-inset-bottom, 0px), 10px)",
      }}
    >
      <div className="mx-auto flex max-w-xl items-stretch gap-1 px-3 pt-2">
        <Item to="/" label="Início" active={activeTab === "home"} icon={<HomeIcon className="h-6 w-6" />} />
        <Item to="/lists" label="Listas" active={activeTab === "lists"} icon={<Bars3Icon className="h-6 w-6" />} />
        <Item
          to="/compare"
          label="Comparar"
          active={activeTab === "compare"}
          icon={<ArrowsRightLeftIcon className="h-6 w-6" />}
        />
        <Item
          to="/purchases"
          label="Compras"
          active={activeTab === "purchases"}
          icon={<ShoppingCartIcon className="h-6 w-6" />}
        />
        <Item
          to="/profile"
          label="Perfil"
          active={activeTab === "profile"}
          icon={<UserIcon className="h-6 w-6" />}
        />
      </div>
    </nav>
  );
};

export default BottomNav;
