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

  const [heatmapData, setHeatmapData] = useState<boolean[]>(
    new Array(84).fill(false),
  );
  const [isCurrentSessionFinished, setIsCurrentSessionFinished] =
    useState(false);
  const [hasWorkedOutToday, setHasWorkedOutToday] = useState(false);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        // 1. Fetch Plan (AI or Custom)
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

        // 2. Fetch Sessions for Active Plan
        const { data: sessionData } = await supabase
          .from("workout_sessions")
          .select(
            `*, session_exercises (target_sets, target_reps, exercise_library (name, has_ai_model))`,
          )
          .eq("plan_id", planData.id)
          .order("day_of_week", { ascending: true });

        if (sessionData) {
          setSessions(sessionData);
          const allDone = sessionData.every((s) => s.is_completed);
          setIsCurrentSessionFinished(allDone);
        }

        // 3. Fetch History for Heatmap & Daily Lockout
        const { data: logs } = await supabase
          .from("workout_history_logs")
          .select("date_completed")
          .eq("user_id", user.id);

        if (logs) {
          const newHeatmap = new Array(84).fill(false);
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          let trainedToday = false;

          logs.forEach((log) => {
            const logDate = new Date(log.date_completed);

            // Check if this log happened today (to enforce rest)
            if (logDate.toDateString() === new Date().toDateString()) {
              trainedToday = true;
            }

            // Populate Heatmap
            const diffDays = Math.floor(
              (new Date().getTime() - logDate.getTime()) / (1000 * 3600 * 24),
            );
            if (diffDays >= 0 && diffDays < 84) {
              newHeatmap[83 - diffDays] = true;
            }
          });

          setHeatmapData(newHeatmap);
          setHasWorkedOutToday(trainedToday);
        }
      } catch (error) {
        console.error("Dashboard Sync Error:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchDashboardData();
  }, [supabase]);

  // Find the first incomplete session
  const nextSession = sessions.find((s) => !s.is_completed) || sessions[0];

  // 🌟 The button locks if the program is completely finished OR if they already trained today
  const isButtonLocked = isCurrentSessionFinished || hasWorkedOutToday;

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
              {isButtonLocked
                ? "Status: Recovery Phase Active"
                : "Status: System Ready"}
            </p>
          </div>
          <button
            onClick={() => router.push("/profile")}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-white hover:bg-white/10 transition-colors"
          >
            {name ? name.charAt(0).toUpperCase() : "U"}
          </button>
        </header>

        {/* ACTIVITY MATRIX */}
        <Card className="p-6 rounded-[2rem] border-white/5 bg-[#0a0a0a]/40 backdrop-blur-xl">
          <div className="flex justify-between items-center mb-6 text-white">
            <div>
              <h3 className="text-sm font-bold tracking-tight">
                Activity Archive
              </h3>
              <p className="text-[10px] text-white/30 font-medium">
                Daily compliance tracking
              </p>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-lg font-black text-primary leading-none">
                {heatmapData.filter((x) => x).length}
              </span>
              <span className="text-[9px] font-bold text-white/20 uppercase tracking-tighter">
                Logs
              </span>
            </div>
          </div>

          <div className="overflow-x-auto no-scrollbar py-1">
            <div className="flex gap-3 min-w-max items-center">
              <div className="flex flex-col gap-2 text-[7px] font-black text-white/10 uppercase italic">
                <span>M</span>
                <span>W</span>
                <span>F</span>
                <span>S</span>
              </div>
              <div className="grid grid-rows-7 grid-flow-col gap-1.5 md:gap-2">
                {heatmapData.map((active, i) => (
                  <div
                    key={i}
                    className={`w-3.5 h-3.5 md:w-4 md:h-4 rounded-[4px] transition-all duration-700 ${active ? "bg-gradient-to-br from-primary to-primary/60 shadow-[0_0_10px_rgba(208,255,0,0.2)]" : "bg-white/[0.04]"}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </Card>

        <main className="space-y-4">
          {isLoading ? (
            <div className="min-h-screen flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : activePlan ? (
            <>
              {/* CURRENT PROGRAM CARD */}
              <Card className="p-6 rounded-2xl border-white/10 bg-gradient-to-tr from-white/5 to-transparent flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em] block">
                    Active Workout
                  </span>
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    {activePlan.name}
                  </h2>
                </div>

                <Button
                  disabled={isButtonLocked}
                  onClick={() =>
                    router.push(`/workout?sessionId=${nextSession?.id}`)
                  }
                  className={`w-full md:w-auto px-10 h-12 font-bold text-xs uppercase rounded-xl transition-all ${
                    isButtonLocked
                      ? "bg-white/5 text-white/20 cursor-not-allowed border border-white/5"
                      : "bg-primary text-black hover:opacity-90 shadow-[0_0_20px_rgba(208,255,0,0.1)]"
                  }`}
                >
                  {isCurrentSessionFinished
                    ? "Workout Complete"
                    : hasWorkedOutToday
                      ? "Rest for next Workout"
                      : "Start Workout"}
                </Button>
              </Card>

              {/* WEEKLY BREAKDOWN */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-1">
                  Full Workout Structure
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {sessions.map((session) => {
                    const isExpanded = expandedId === session.id;
                    const isDone = session.is_completed;
                    return (
                      <div key={session.id} className="flex flex-col">
                        <div
                          onClick={() =>
                            setExpandedId(isExpanded ? null : session.id)
                          }
                          className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all border ${
                            isExpanded
                              ? "bg-white/5 border-primary/20"
                              : "bg-[#0f0f0f] border-white/5"
                          } ${isDone ? "opacity-40" : ""}`}
                        >
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[10px] border ${
                              isDone
                                ? "bg-primary/20 border-primary/40 text-primary"
                                : "bg-black/40 border-white/5 text-white/40"
                            }`}
                          >
                            {isDone
                              ? "✓"
                              : session.day_of_week.replace("Day ", "")}
                          </div>
                          <div className="flex-1">
                            <h4
                              className={`text-sm font-bold ${isDone ? "text-white/40 line-through" : "text-white"}`}
                            >
                              {session.focus_area}
                            </h4>
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

                        {isExpanded && (
                          <div className="mx-2 p-4 bg-white/[0.01] border-x border-b border-white/5 rounded-b-xl space-y-3 animate-in fade-in slide-in-from-top-2">
                            {session.session_exercises.map(
                              (se: any, idx: number) => (
                                <div
                                  key={idx}
                                  className="flex justify-between items-center text-[10px] font-medium border-b border-white/5 pb-2 last:border-0 last:pb-0"
                                >
                                  <span className="text-white/60">
                                    {se.exercise_library?.name}
                                  </span>
                                  <span className="text-primary/60">
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
            <div className="py-20 text-center border border-dashed border-white/10 rounded-2xl text-white/20 font-bold uppercase text-[10px]">
              No Program Initialized
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
