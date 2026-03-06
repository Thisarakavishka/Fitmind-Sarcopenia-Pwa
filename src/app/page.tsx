"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "../components/ui/Button";
import { createClient } from "../lib/supabase/client";

export default function LandingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (user && !error) {
        router.push("/home");
      } else {
        if (error) await supabase.auth.signOut();
        setIsCheckingAuth(false);
      }
    };
    checkSession();
  }, [router, supabase]);

  if (isCheckingAuth) return <div className="min-h-screen bg-[#050505]" />;

  return (
    <div className="relative min-h-screen bg-[#050505] text-white overflow-x-hidden font-sans selection:bg-primary/30">
      
      {/* 1. BACKGROUND: Improved Visibility */}
      <div className="fixed inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1594882645126-14020914d58d?q=80&w=2070" 
          alt="Strength Training"
          className="w-full h-full object-cover opacity-50 md:opacity-60 brightness-75 transition-all duration-700"
        />
        {/* Softer Gradients to show more of the image center */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
      </div>

      {/* 2. NAVIGATION: Minimalist */}
      <nav className="relative z-50 flex justify-between items-center px-6 py-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-2.5 group cursor-default">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(208,255,0,0.4)]">
            <span className="text-black font-black text-[10px]">FM</span>
          </div>
          <span className="text-lg font-bold tracking-tight uppercase">
            FitMind<span className="text-primary/70">.AI</span>
          </span>
        </div>
        
        <Link href="/login">
          <button className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/60 hover:text-white transition-colors">
            Login
          </button>
        </Link>
      </nav>

      {/* 3. HERO CONTENT: Balanced Split Layout */}
      <main className="relative z-10 flex flex-col justify-center min-h-[75vh] px-8 md:px-16 max-w-7xl mx-auto">
        
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Column: Sarcopenia Focus */}
          <div className="space-y-6 text-center lg:text-left animate-in fade-in slide-in-from-left-6 duration-1000">
            
            <div className="inline-flex items-center gap-2.5 px-3 py-1 bg-white/10 border border-white/10 rounded-full backdrop-blur-md">
               <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
               <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/70">Neural Engine v3.1</p>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-[1.05] tracking-tighter uppercase">
              DEFEAT <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/20 italic font-medium tracking-tight">SARCOPENIA.</span>
            </h1>

            <p className="text-base md:text-lg text-white/50 max-w-md mx-auto lg:mx-0 font-medium leading-relaxed drop-shadow-md">
              AI-driven muscle retention and posture correction specifically for healthy aging.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center lg:justify-start">
              <Link href="/register">
                <Button className="h-14 px-8 bg-primary text-black font-bold text-xs tracking-widest rounded-xl shadow-2xl hover:scale-[1.05] transition-all uppercase">
                  Start Training
                </Button>
              </Link>
              
              <Link href="/login">
                <Button variant="outline" className="h-14 px-8 rounded-xl border-white/20 text-white font-bold text-xs tracking-widest uppercase hover:bg-white/10 backdrop-blur-sm transition-all">
                  View Protocol
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Column: CI & Neural Network Stats */}
          <div className="hidden lg:grid grid-cols-2 gap-4 animate-in fade-in zoom-in-95 duration-1000 delay-300">
             {[
               { label: "CI Prediction", val: "99.2%", desc: "Neural Logic" },
               { label: "Sync Speed", val: "12ms", desc: "Edge Computing" },
               { label: "Joint Nodes", val: "32-Point", desc: "Skeletal Map" },
               { label: "Clinical Mode", val: "Active", desc: "Sarcopenia Defense" }
             ].map((s, i) => (
               <div key={i} className="bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem] hover:border-primary/40 transition-all group">
                  <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest mb-1 group-hover:text-primary transition-colors">{s.label}</p>
                  <p className="text-2xl font-black text-white mb-0.5">{s.val}</p>
                  <p className="text-[9px] text-white/30 font-medium tracking-tight">{s.desc}</p>
               </div>
             ))}
          </div>

        </div>
      </main>

      {/* 4. FOOTER: Minimalist */}
      <footer className="relative z-10 p-12 flex flex-col md:flex-row justify-between items-center gap-4 opacity-40 mt-10">
        <p className="text-[9px] font-bold tracking-[0.5em] uppercase">
          FitMind AI // Clinical Intelligence // Moratuwa, Sri Lanka
        </p>
      </footer>
    </div>
  );
}