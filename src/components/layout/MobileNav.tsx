"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icons } from "../ui/Icon";

const navItems = [
  { name: "Home", href: "/home", icon: Icons.Home },
  { name: "Schedule", href: "/schedule", icon: Icons.Schedule },
  { name: "Scan", href: "/workout", icon: Icons.Workout }, // Highlighted center item
  { name: "Nutrition", href: "/nutrition", icon: Icons.Nutrition },
  { name: "Profile", href: "/profile", icon: Icons.Profile },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full bg-[#121216]/90 backdrop-blur-lg border-t border-white/5 pb-6 pt-2 px-6 z-50 flex justify-between items-center safe-area-bottom">
      {navItems.map((item) => {
        const isActive = pathname.startsWith(item.href);
        const Icon = item.icon;
        
        // Special styling for the middle "Workout/Scan" button
        if (item.name === "Scan") {
           return (
             <Link key={item.name} href={item.href} className="relative -top-6">
                <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-[0_0_20px_rgba(45,212,191,0.4)] border-4 border-[#0f1014]">
                  <Icon size={24} className="text-black fill-black" />
                </div>
             </Link>
           )
        }

        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex flex-col items-center gap-1 transition-colors ${
              isActive ? "text-primary" : "text-muted"
            }`}
          >
            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[10px] font-medium">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}