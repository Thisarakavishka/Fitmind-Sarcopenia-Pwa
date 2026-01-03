"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icons } from "../ui/Icon";

const navItems = [
  { name: "Home", href: "/home", icon: Icons.Home },
  { name: "Schedule", href: "/schedule", icon: Icons.Schedule },
  { name: "Workout", href: "/workout", icon: Icons.Workout },
  { name: "Nutrition", href: "/nutrition", icon: Icons.Nutrition },
  { name: "Profile", href: "/profile", icon: Icons.Profile },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-72 h-screen bg-background border-r border-white/5 fixed left-0 top-0 z-50 p-6">
      {/* Logo Area */}
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-black font-bold text-xl">
          FM
        </div>
        <span className="text-2xl font-bold tracking-tight text-white">
          FitMind
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="flex flex-col gap-2 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-200 group ${
                isActive
                  ? "bg-primary text-black font-bold shadow-[0_0_15px_rgba(45,212,191,0.3)]"
                  : "text-muted hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon
                size={24}
                className={isActive ? "stroke-[2.5px]" : "stroke-[2px]"}
              />
              <span className="text-base">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom User Section */}
      <div className="mt-auto pt-6 border-t border-white/5">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-full bg-surface border border-white/10 overflow-hidden">
            {/* Placeholder Avatar */}
            <div className="w-full h-full bg-gradient-to-tr from-primary to-purple-500 opacity-50"></div>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white">Thisara</span>
            <span className="text-xs text-muted">Free Plan</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
