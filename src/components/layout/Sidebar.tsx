"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icons } from "../ui/Icon";
import { useEffect, useState } from "react";
import { createClient } from "../../lib/supabase/client";
import { Button } from "../ui/Button";

export function Sidebar() {
  const pathname = usePathname();
  const supabase = createClient();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkRole() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (data?.role === "admin") setIsAdmin(true);
        console.log(data);
      }
    }
    checkRole();
  }, []);

  return (
    <aside className="hidden md:flex w-72 flex-col border-r border-white/5 bg-[#0a0a0a] fixed h-full z-50">
      {/* 1. BRANDING */}
      <div className="p-8 pb-10">
        <h1 className="text-3xl font-bold text-white tracking-tighter">
          FITMIND<span className="text-primary">.AI</span>
        </h1>
      </div>

      {/* 2. MAIN NAVIGATION */}
      <div className="flex-1 px-4 space-y-8 overflow-y-auto">
        {/* User Menu */}
        <div className="space-y-1">
          <p className="px-4 text-[10px] font-bold text-primary/80 uppercase tracking-widest mb-2">
            Menu
          </p>
          <NavItem
            href="/home"
            active={pathname === "/home"}
            icon={<Icons.Home size={18} />}
            label="Dashboard"
          />
          <NavItem
            href="/schedule"
            active={pathname === "/schedule"}
            icon={<Icons.Schedule size={18} />}
            label="Schedule"
          />
          <NavItem
            href="/workout"
            active={pathname === "/workout"}
            icon={<Icons.Workout size={18} />}
            label="Workout"
          />
          <NavItem
            href="/nutrition"
            active={pathname === "/nutrition"}
            icon={<Icons.Nutrition size={18} />} // Make sure Icons.Nutrition exists or use Icons.List
            label="Nutrition"
          />
          <NavItem
            href="/history"
            active={pathname === "/history"}
            icon={<Icons.History size={18} />}
            label="History"
          />
          <NavItem
            href="/profile"
            active={pathname === "/profile"}
            icon={<Icons.Profile size={18} />}
            label="Profile"
          />
        </div>

        {/* ADMIN MENU (Integrated Seamlessly) */}
        {isAdmin && (
          <div className="space-y-1 animate-in fade-in slide-in-from-left-4 duration-500">
            <p className="px-4 text-[10px] font-bold text-primary/80 uppercase tracking-widest mb-2">
              Management
            </p>
            <NavItem
              href="/admin/users"
              active={pathname === "/admin/users"}
              icon={<Icons.Profile size={18} />}
              label="Users"
            />
            <NavItem
              href="/template"
              active={pathname === "/template"}
              icon={<Icons.Library size={18} />}
              label="Template Library"
            />
            <NavItem
              href="/exercises"
              active={pathname === "/exercises"}
              icon={<Icons.List size={18} />}
              label="Exercises"
            />
          </div>
        )}
      </div>

      {/* 3. FOOTER */}
      <div className="p-4 m-4 rounded-xl bg-white/5 border border-white/5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
            AI
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-white truncate">My Account</p>
          </div>
        </div>
        <Button
          onClick={async () => {
            await supabase.auth.signOut();
            window.location.href = "/login";
          }}
          variant="ghost"
          className="w-full h-8 text-xs justify-start text-muted hover:text-red-400 hover:bg-red-500/10"
        >
          Log Out
        </Button>
      </div>
    </aside>
  );
}

// Clean Nav Item Component
function NavItem({ href, active, icon, label }: any) {
  return (
    <Link
      href={href}
      className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 border border-transparent ${
        active
          ? "bg-primary/10 text-primary border-primary/20 shadow-[0_0_15px_rgba(45,212,191,0.1)]"
          : "text-muted hover:text-white hover:bg-white/5"
      }`}
    >
      <span
        className={`transition-colors ${
          active ? "text-primary" : "text-muted group-hover:text-white"
        }`}
      >
        {icon}
      </span>
      <span className="text-sm font-medium tracking-wide">{label}</span>
    </Link>
  );
}
