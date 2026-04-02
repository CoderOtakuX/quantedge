"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Filter,
  PieChart,
  Zap,
} from "lucide-react";
import { APP_NAME, APP_SLOGAN } from "@/lib/constants";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Screener", href: "/screener", icon: Filter },
  { label: "Sectors", href: "/sectors", icon: PieChart },
];

const Sidebar: React.FC = () => {
  const pathname = usePathname();

  return (
    <aside className="w-[220px] h-full fixed left-0 top-0 bg-surface-container-low flex flex-col p-6 space-y-8 z-50">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-primary-container rounded flex items-center justify-center text-white">
          <Zap size={16} fill="white" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-on-surface tracking-tight leading-none">
            {APP_NAME}
          </h1>
          <p className="text-[10px] text-outline font-bold tracking-widest uppercase mt-1">
            {APP_SLOGAN}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href) && item.href !== "#";
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group ${
                isActive
                  ? "bg-surface-container-lowest text-on-surface border-l-2 border-primary-container"
                  : "text-outline hover:text-on-surface hover:bg-surface-container-lowest/50"
              }`}
            >
              <item.icon
                size={20}
                className={isActive ? "text-primary-container" : "group-hover:text-on-surface"}
              />
              <span className="text-sm font-semibold">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
