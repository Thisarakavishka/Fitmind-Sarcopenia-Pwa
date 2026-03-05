"use client";

import { useEffect, useState } from "react";
import { useUserStore } from "../../../lib/store/userStore";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { createClient } from "../../../lib/supabase/client";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const { name, age, level } = useUserStore();
  const supabase = createClient();
  const router = useRouter();

  const [activePlan, setActivePlan] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // MOCK HEATMAP DATA: This generates random true/false values.
  // In the future, we will fetch completed dates from the database!
  const [heatmapData] = useState(() => 
    Array.from({ length: 84 }).map(() => Math.random() > 0.75) 
  );

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: planData, error: planError } = await supabase
          .from("workout_plans")
          .select("*")
          .eq("user_id", user.id)
          .eq("is_active", true)
          .single();

        if (planError || !planData) {
          setIsLoading(false); return;
        }
        setActivePlan(planData);

        // REAL DATA: Fetching the exact schedule the AI built for you
        const { data: sessionData, error: sessionError } = await supabase
          .from("workout_sessions")
          .select(`*, session_exercises (target_sets, target_reps, exercise_library (name))`)
          .eq("plan_id", planData.id)
          .order("day_of_week", { ascending: true });

        if (!sessionError && sessionData) setSessions(sessionData);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchDashboardData();
  }, [supabase]);

  return (
    // 🌟 FIX: Removed max-width limits and adjusted padding for both mobile and desktop
    <div className="w-full min-h-screen bg-transparent pb-24 pt-2 px-2 sm:px-6 md:pt-8 md:px-8 font-sans">
      
      {/* 🌟 FIX: Increased max-w to 5xl so it stretches nicely on Desktop */}
      <div className="max-w-5xl mx-auto space-y-6 md:space-y-8">
        
        {/* --- HEADER --- */}
        <header className="flex items-center justify-between animate-in fade-in slide-in-from-top-4 px-2">
          <div>
            <p className="text-muted text-[10px] md:text-xs font-bold tracking-widest uppercase mb-1">
              {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
            </p>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Hello, <span className="capitalize text-primary">{name?.split(" ")[0] || "Athlete"}</span>
            </h1>
          </div>
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-sm md:text-base font-bold text-white shadow-lg">
            {name ? name.charAt(0).toUpperCase() : "A"}
          </div>
        </header>

        {/* --- ACTIVITY HEATMAP --- */}
        <Card className="p-4 md:p-6 rounded-3xl border-white/5 bg-[#121212]/60 backdrop-blur-md w-full overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest">Activity</h3>
            <span className="text-[10px] text-muted font-bold">Last 12 Weeks</span>
          </div>
          
          <div className="overflow-x-auto pb-2 scrollbar-hide">
            <div className="flex gap-1.5 md:gap-2 min-w-max">
              {/* Day Labels */}
              <div className="grid grid-rows-7 gap-1.5 md:gap-2 text-[9px] font-bold text-muted/50 text-right pr-2 pt-0.5">
                <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
              </div>
              
              {/* Heatmap Grid (Matches your yellow reference image) */}
              <div className="grid grid-rows-7 grid-flow-col gap-1.5 md:gap-2">
                {heatmapData.map((isActive, i) => (
                  <div 
                    key={i} 
                    className={`w-3.5 h-3.5 md:w-4 md:h-4 rounded-[3px] md:rounded-sm transition-colors ${
                      isActive ? "bg-primary shadow-[0_0_8px_rgba(208,255,0,0.3)]" : "bg-white/5"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* --- MAIN DASHBOARD CONTENT --- */}
        <main>
          {isLoading ? (
            <div className="flex justify-center py-10"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>
          ) : activePlan ? (
            <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4">
              
              {/* Hero Plan Card */}
              <Card className="relative overflow-hidden rounded-3xl border-white/10 bg-gradient-to-br from-white/5 to-transparent p-6 md:p-10 w-full">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 blur-[60px] rounded-full pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                  <div>
                    <span className="inline-block px-2 py-1 mb-3 rounded-md bg-primary/20 text-primary text-[10px] md:text-xs font-bold uppercase tracking-widest">
                      AI GENERATED
                    </span>
                    <h2 className="text-2xl md:text-4xl font-black text-white leading-tight">
                      {activePlan.name}
                    </h2>
                  </div>

                  <Button
                    onClick={() => {
                      const nextSessionId = sessions[0]?.id;
                      if (nextSessionId) router.push(`/workout?sessionId=${nextSessionId}`);
                    }}
                    className="w-full md:w-auto px-8 bg-primary text-black font-black h-14 text-sm rounded-xl hover:scale-[1.02] transition-transform active:scale-95 shadow-[0_0_20px_rgba(208,255,0,0.2)]"
                  >
                    START TODAY'S SESSION
                  </Button>
                </div>
              </Card>

              {/* Sessions List */}
              <div className="space-y-3 md:space-y-4 px-1">
                <h3 className="text-sm md:text-base font-bold text-white tracking-tight">Weekly Split</h3>
                
                {/* 🌟 FIX: Uses a CSS Grid on desktop so cards sit side-by-side! */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                  {sessions.map((session, index) => (
                    <div key={session.id} className="flex items-center gap-4 p-4 rounded-2xl bg-[#121212]/60 border border-white/5 hover:bg-white/5 transition-colors group">
                      <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-black/50 border border-white/5 group-hover:border-primary/30 transition-colors">
                        <span className="text-[9px] uppercase font-bold text-muted">Day</span>
                        <span className="text-base font-black text-white group-hover:text-primary transition-colors">{session.day_of_week.replace("Day ", "")}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                           <h4 className="text-sm md:text-base font-bold text-white">{session.focus_area}</h4>
                           <span className="text-[10px] font-bold text-primary">{index === 0 ? "NEXT" : ""}</span>
                        </div>
                        <p className="text-xs text-muted truncate mt-1">
                          {session.session_exercises?.length || 0} exercises programmed
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          ) : (
            <div className="p-8 text-center"><p className="text-muted">No plan found.</p></div>
          )}
        </main>
      </div>
    </div>
  );
}