import React from "react";
import { Link } from "react-router-dom";
import {
  HomeIcon,
  ListBulletIcon,
  ArrowsRightLeftIcon,
  ShoppingCartIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

type Tab = "home" | "lists" | "compare" | "purchases" | "profile";

const icons: Record<Tab, React.FC<React.SVGProps<SVGSVGElement>>> = {
  home: HomeIcon,
  lists: ListBulletIcon,
  compare: ArrowsRightLeftIcon,
  purchases: ShoppingCartIcon,
  profile: UserIcon,
};

const labels: Record<Tab, string> = {
  home: "Início",
  lists: "Listas",
  compare: "Comparar",
  purchases: "Compras",
  profile: "Perfil",
};

const routes: Record<Tab, string> = {
  home: "/",
  lists: "/lists",
  compare: "/compare",
  purchases: "/purchases",
  profile: "/profile",
};

export default function BottomNav({ activeTab }: { activeTab: Tab }) {
  const tabs: Tab[] = ["home", "lists", "compare", "purchases", "profile"];

  return (
    <div
      data-bottom-nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70"
    >
      {/* paddingBottom mais enxuto + safe area explícita */}
      <nav
        className="mx-auto w-full max-w-3xl px-2 sm:px-4 pt-1"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 6px)" }}
      >
        <ul className="grid grid-cols-5 gap-1 sm:gap-2">
          {tabs.map((t) => {
            const Icon = icons[t];
            const to = routes[t];
            const active = activeTab === t;

            return (
              <li key={t} className="min-w-0">
                <Link
                  to={to}
                  className={`flex h-[58px] sm:h-[60px] w-full flex-col items-center justify-center rounded-xl transition
                    ${active ? "text-yellow-600" : "text-gray-500 hover:text-gray-700"}`}
                >
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                  <span className="mt-1 truncate text-[11px] sm:text-xs">{labels[t]}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
