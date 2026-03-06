"use client";

import { useEffect, useState } from "react";
import { useUserStore } from "../../../lib/store/userStore";
import { Button } from "../../../components/shared/Button";
import { Card } from "../../../components/shared/Card";
import { createClient } from "../../../lib/supabase/client";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const { name } = useUserStore();
  const supabase = createClient();
  const router = useRouter();

  const [activePlan, setActivePlan] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Activity Matrix: Fixed 12-week grid
  const [heatmapData] = useState(() =>
    Array.from({ length: 84 }).map(() => Math.random() > 0.8),
  );

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data: planData } = await supabase
          .from("workout_plans")
          .select("*")
          .eq("user_id", user.id)
          .eq("is_active", true)
          .single();

        if (!planData) {
          setIsLoading(false);
          return;
        }
        setActivePlan(planData);

        const { data: sessionData } = await supabase
          .from("workout_sessions")
          .select(
            `
            *, 
            session_exercises (
              target_sets, 
              target_reps, 
              exercise_library (name, has_ai_model)
            )
          `,
          )
          .eq("plan_id", planData.id)
          .order("day_of_week", { ascending: true });

        if (sessionData) setSessions(sessionData);
      } catch (error) {
        console.error("Dashboard Error:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchDashboardData();
  }, [supabase]);

  return (
    <div className="w-full min-h-screen bg-transparent pb-28 pt-4 px-4 md:px-10 font-sans antialiased">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* HEADER */}
        <header className="flex justify-between items-center py-2">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Welcome,{" "}
              <span className="text-primary">
                {name?.split(" ")[0] || "User"}
              </span>
            </h1>
            <p className="text-[10px] text-white/40 font-medium uppercase tracking-widest mt-1">
              System Status:{" "}
              {activePlan ? "Active Plan" : "No Plan Initialized"}
            </p>
          </div>
          {/* PROFILE ICON: Routes to /profile */}
          <button
            onClick={() => router.push("/profile")}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-white hover:bg-white/10 transition-colors"
          >
            {name ? name.charAt(0).toUpperCase() : "U"}
          </button>
        </header>

        {/* SECTION: ACTIVITY ARCHIVE */}
        <Card className="p-6 rounded-[2rem] border-white/5 bg-[#0a0a0a]/40 backdrop-blur-xl">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Activity
              </h3>
              <p className="text-[10px] text-white/30 font-medium">
                Your consistency over the last 90 days
              </p>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-lg font-black text-primary leading-none">
                {heatmapData.filter((x) => x).length}
              </span>
              <span className="text-[9px] font-bold text-white/20 uppercase tracking-tighter">
                Sessions
              </span>
            </div>
          </div>

          <div className="relative group">
            {/* Month Labels for a 'Creative' Calendar Feel */}
            <div className="flex gap-[22px] md:gap-[34px] ml-6 mb-2 text-[8px] font-bold text-white/20 uppercase tracking-widest">
              <span>Jan</span>
              <span>Feb</span>
              <span>Mar</span>
            </div>

            <div className="overflow-x-auto no-scrollbar py-1">
              <div className="flex gap-3 min-w-max items-center">
                {/* Minimalist Day Indicators */}
                <div className="flex flex-col gap-2 text-[7px] font-black text-white/10 uppercase italic">
                  <span>M</span>
                  <span>W</span>
                  <span>F</span>
                  <span>S</span>
                </div>

                {/* Creative Grid: Soft Rounded Pills */}
                <div className="grid grid-rows-7 grid-flow-col gap-1.5 md:gap-2">
                  {heatmapData.map((active, i) => (
                    <div
                      key={i}
                      className={`w-3.5 h-3.5 md:w-4 md:h-4 rounded-[4px] transition-all duration-700 ${
                        active
                          ? "bg-gradient-to-br from-primary to-primary/60 shadow-[0_0_10px_rgba(208,255,0,0.2)]"
                          : "bg-white/[0.04] hover:bg-white/[0.08]"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer: Simple Stats Bar */}
          <div className="mt-6 flex items-center gap-4">
            <div className="flex -space-x-1">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-4 h-4 rounded-full border-2 border-[#0a0a0a] bg-white/10"
                />
              ))}
            </div>
            <p className="text-[10px] font-medium text-white/40">
              Joined by <span className="text-white/80">1.2k others</span> in
              this program
            </p>
          </div>
        </Card>

        {/* MAIN CONTENT */}
        <main className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : activePlan ? (
            <>
              {/* CURRENT PROGRAM CARD */}
              <Card className="p-6 rounded-2xl border-white/10 bg-gradient-to-tr from-white/5 to-transparent flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em] block mb-1">
                    Active Program
                  </span>
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    {activePlan.name}
                  </h2>
                </div>
                <Button
                  onClick={() =>
                    router.push(`/workout?sessionId=${sessions[0]?.id}`)
                  }
                  className="w-full md:w-auto px-10 h-12 bg-primary text-black font-bold text-xs uppercase rounded-xl hover:opacity-90 active:scale-95 transition-all"
                >
                  Launch Session
                </Button>
              </Card>

              {/* WEEKLY BREAKDOWN: Expandable List */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-1">
                  Weekly Breakdown
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {sessions.map((session) => {
                    const isExpanded = expandedId === session.id;
                    return (
                      <div key={session.id} className="flex flex-col">
                        <div
                          onClick={() =>
                            setExpandedId(isExpanded ? null : session.id)
                          }
                          className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all border ${
                            isExpanded
                              ? "bg-white/5 border-primary/20"
                              : "bg-[#0f0f0f] border-white/5 hover:border-white/10"
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[10px] border transition-colors ${
                              isExpanded
                                ? "bg-primary border-primary text-black"
                                : "bg-black/40 border-white/5 text-white/40"
                            }`}
                          >
                            {session.day_of_week.replace("Day ", "")}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-bold text-white">
                              {session.focus_area}
                            </h4>
                            <p className="text-[10px] text-white/30 font-medium uppercase tracking-wider">
                              {session.session_exercises?.length || 0} Movements
                            </p>
                          </div>
                          <svg
                            className={`w-4 h-4 text-white/20 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2.5"
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>

                        {/* EXPANDED CONTENT */}
                        {isExpanded && (
                          <div className="mx-2 p-4 bg-white/[0.02] border-x border-b border-white/5 rounded-b-xl space-y-3 animate-in fade-in slide-in-from-top-2">
                            {session.session_exercises.map(
                              (se: any, idx: number) => (
                                <div
                                  key={idx}
                                  className="flex justify-between items-center text-[11px] font-medium border-b border-white/5 pb-2 last:border-0 last:pb-0"
                                >
                                  <div className="flex items-center gap-2 text-white/70">
                                    {se.exercise_library?.has_ai_model && (
                                      <div className="w-1 h-1 rounded-full bg-primary" />
                                    )}
                                    <span>{se.exercise_library?.name}</span>
                                  </div>
                                  <span className="text-primary font-bold">
                                    {se.target_sets}×{se.target_reps}
                                  </span>
                                </div>
                              ),
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="py-20 text-center border border-dashed border-white/10 rounded-2xl">
              <p className="text-xs text-white/20 font-bold uppercase tracking-widest">
                No Active Program Initialized
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
