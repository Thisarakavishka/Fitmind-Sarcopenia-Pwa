"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icons } from "../ui/Icon";

const navItems = [
  { name: "Home", href: "/home", icon: Icons.Home },
  { name: "Schedule", href: "/schedule", icon: Icons.Schedule },
  { name: "Nutrition", href: "/nutrition", icon: Icons.Nutrition },
  { name: "Profile", href: "/profile", icon: Icons.Profile },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full bg-[#050505]/95 backdrop-blur-3xl border-t border-white/5 z-50 safe-area-bottom pb-6 pt-4">
      <div className="flex justify-around items-center px-4 relative">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className="relative flex flex-col items-center justify-center w-16 h-12 tap-highlight-transparent group"
              aria-label={item.name} // Keeps it accessible for screen readers even without text!
            >
              {/* Animated Icon Wrapper */}
              <div
                className={`transition-transform duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                  isActive ? "-translate-y-2 scale-110" : "translate-y-0 scale-100 group-hover:-translate-y-1"
                }`}
              >
                <Icon
                  size={26} // Made slightly larger since text is gone
                  strokeWidth={isActive ? 2.5 : 2}
                  className={`transition-colors duration-300 ${
                    isActive 
                      ? "text-primary drop-shadow-[0_0_12px_rgba(208,255,0,0.5)]" 
                      : "text-white/40 group-hover:text-white/70"
                  }`}
                />
              </div>

              {/* Bouncing Neon Dot Indicator */}
              <div
                className={`absolute bottom-1 w-1.5 h-1.5 rounded-full bg-primary transition-all duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                  isActive 
                    ? "opacity-100 scale-100 shadow-[0_0_8px_rgba(208,255,0,1)]" 
                    : "opacity-0 scale-0"
                }`}
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}