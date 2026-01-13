"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "../../lib/supabase/client";
import { Sidebar } from "../../components/layout/Sidebar";
import { MobileNav } from "../../components/layout/MobileNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const [isChecking, setIsChecking] = useState(true);

  // --- THE LOGIC FIX (Bouncer) ---
  useEffect(() => {
    async function checkUser() {
      // 1. Get Session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/login");
        return;
      }

      // 2. Check Profile Data
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("is_onboarded")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error("Profile check error:", error);
        setIsChecking(false); // Fail safe: let them in if DB errors
        return;
      }

      // 3. Logic Gates (Prevent Loops)
      if (!profile?.is_onboarded) {
        // User needs onboarding
        if (pathname !== "/onboarding") {
          router.replace("/onboarding");
        } else {
          setIsChecking(false); // Allow rendering Onboarding page
        }
      } else {
        // User is finished with onboarding
        if (pathname === "/onboarding") {
          router.replace("/home");
        } else {
          setIsChecking(false); // Allow rendering Dashboard
        }
      }
    }

    checkUser();
  }, [router, supabase, pathname]);

  // --- LOADING STATE ---
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-white">
        <div className="flex flex-col items-center gap-2">
          {/* Simple Spinner */}
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-muted">Checking profile...</p>
        </div>
      </div>
    );
  }

  // --- YOUR STANDARD UI ---
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* 1. Desktop Sidebar */}
      <Sidebar />

      {/* 2. Main Content Area */}
      <main className="flex-1 md:ml-72 pb-24 md:pb-8 transition-all duration-300">
        <div className="max-w-5xl mx-auto p-4 md:p-8 animate-in fade-in zoom-in duration-500">
          {children}
        </div>
      </main>

      {/* 3. Mobile Bottom Nav */}
      <MobileNav />
    </div>
  );
}
