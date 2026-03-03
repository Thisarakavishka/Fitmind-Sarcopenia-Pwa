"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "../../../lib/supabase/client";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Icons } from "../../../components/ui/Icon"; // Ensure you import Icons

export default function ProfilePage() {
  const supabase = createClient();
  const [isAdmin, setIsAdmin] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    async function getUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || "");
        const { data } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        if (data?.role === "admin") setIsAdmin(true);
      }
    }
    getUser();
  }, []);

  return (
    <div className="space-y-8 pb-24">
      {/* 1. Header */}
      <div className="flex items-center gap-4 pt-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-black font-bold text-2xl shadow-lg shadow-primary/20">
          {userEmail.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">My Profile</h1>
          <p className="text-sm text-muted">{userEmail}</p>
        </div>
      </div>

      {/* 2. ADMIN ZONE (Only Visible to Admins) */}
      {isAdmin && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-gradient-to-r from-primary/50 to-transparent"></div>
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
              Admin Access
            </span>
            <div className="h-px flex-1 bg-gradient-to-l from-primary/50 to-transparent"></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Link href="/template" className="contents">
              <Card className="p-5 border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all active:scale-95 flex flex-col items-center gap-3 text-center group cursor-pointer">
                <div className="p-3 rounded-full bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                  {/* If you don't have Icons.List, use a fallback svg */}
                  <Icons.Workout size={24} />
                </div>
                <span className="text-xs font-bold text-white uppercase tracking-wide">
                  Templates
                </span>
              </Card>
            </Link>

            <Link href="/exercises" className="contents">
              <Card className="p-5 border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all active:scale-95 flex flex-col items-center gap-3 text-center group cursor-pointer">
                <div className="p-3 rounded-full bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                  {/* If you don't have Icons.List, use a fallback svg */}
                  <Icons.Workout size={24} />
                </div>
                <span className="text-xs font-bold text-white uppercase tracking-wide">
                  Exercises
                </span>
              </Card>
            </Link>
          </div>
        </div>
      )}

      {/* 3. Standard Settings */}
      <div className="space-y-3">
        <p className="text-[10px] font-bold text-muted uppercase tracking-widest">
          General
        </p>
        <Button
          variant="secondary"
          className="w-full justify-between h-12 bg-surface hover:bg-white/10 border border-white/5"
        >
          <span>⚙️ Settings</span>
          <span className="text-muted">→</span>
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start h-12 text-red-500 hover:bg-red-500/10"
          onClick={async () => {
            await supabase.auth.signOut();
            window.location.href = "/login";
          }}
        >
          Log Out
        </Button>
      </div>
    </div>
  );
}
