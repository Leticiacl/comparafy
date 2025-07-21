// src/components/BottomNav.tsx

import {
  HomeIcon,
  ListBulletIcon,
  Squares2X2Icon,
  QrCodeIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

interface Props {
  activeTab: "home" | "listas" | "comparar" | "scanner" | "profile";
}

const BottomNav = ({ activeTab }: Props) => {
  const navigate = useNavigate();

  const tabs = [
    { name: "Início", icon: HomeIcon, route: "/inicio", key: "home" },
    { name: "Listas", icon: ListBulletIcon, route: "/listas", key: "listas" },
    { name: "Comparar", icon: Squares2X2Icon, route: "/comparar", key: "comparar" },
    { name: "Scanner", icon: QrCodeIcon, route: "/scanner", key: "scanner" },
    { name: "Perfil", icon: UserIcon, route: "/perfil", key: "profile" },
  ];

  return (
    <nav className="bg-white border-t border-gray-200 px-4 py-2 flex justify-between items-center">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = tab.key === activeTab;

        return (
          <button
            key={tab.key}
            onClick={() => navigate(tab.route)}
            className="flex flex-col items-center justify-center text-xs"
          >
            <Icon
              className={`h-6 w-6 ${
                isActive ? "text-yellow-500" : "text-gray-400"
              }`}
            />
            <span
              className={`text-[11px] ${
                isActive ? "text-yellow-500 font-medium" : "text-gray-500"
              }`}
            >
              {tab.name}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;
