"use client";

import { useEffect, useState, Suspense } from "react";
import { createClient } from "../../../lib/supabase/client";
import { useRouter } from "next/navigation";
import { Card } from "../../../components/shared/Card";

function ScheduleContent() {
  const supabase = createClient();
  const router = useRouter();

  const [sessions, setSessions] = useState<any[]>([]);
  const [activePlan, setActivePlan] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchRealSchedule() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch Plan
        const { data: planData } = await supabase
          .from("workout_plans")
          .select("*")
          .eq("user_id", user.id)
          .eq("is_active", true)
          .single();

        if (planData) {
          setActivePlan(planData);

          // Fetch Sessions based on REAL scheduled dates
          const { data: sessionData } = await supabase
            .from("workout_sessions")
            .select(`*, session_exercises (exercise_library (name))`)
            .eq("plan_id", planData.id)
            .order("scheduled_date", { ascending: true });

          if (sessionData) setSessions(sessionData);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchRealSchedule();
  }, [supabase]);

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="w-full min-h-screen bg-transparent pb-28 pt-4 px-4 md:px-10 font-sans antialiased">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex justify-between items-center py-2">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Monthly <span className="text-primary">Roadmap</span>
            </h1>
            <p className="text-[10px] text-white/40 font-medium uppercase tracking-widest mt-1">
              Active WorkoutPlan: {activePlan?.name || "Initializing..."}
            </p>
          </div>
        </header>

        <hr className="border-white/5" />

        {/* TIMELINE SECTION */}
        <div className="space-y-12 pt-4">
          {sessions.length > 0 ? (
            <div className="space-y-4">
              {sessions.map((session, idx) => {
                const isDone = session.is_completed;
                const date = new Date(session.scheduled_date);
                const isToday =
                  date.toDateString() === new Date().toDateString();

                return (
                  <div
                    key={session.id}
                    className={`flex items-start gap-4 ${isDone ? "opacity-40" : ""}`}
                  >
                    {/* Date Column */}
                    <div className="w-14 flex-shrink-0 pt-1">
                      <p
                        className={`text-[9px] font-black uppercase ${isToday ? "text-primary" : "text-white/20"}`}
                      >
                        {date.toLocaleDateString("en-US", { weekday: "short" })}
                      </p>
                      <p
                        className={`text-lg font-black leading-none ${isToday ? "text-white" : "text-white/40"}`}
                      >
                        {date.getDate()}
                      </p>
                    </div>

                    {/* Content Card: Matching Home Card Style */}
                    <Card
                      className={`flex-1 p-5 rounded-[2rem] border transition-all ${
                        isToday
                          ? "bg-white/5 border-primary shadow-[0_0_20px_rgba(208,255,0,0.05)]"
                          : "bg-[#0a0a0a]/40 border-white/5 backdrop-blur-xl"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="space-y-1">
                          <h3 className="text-sm font-bold text-white uppercase tracking-tight">
                            {session.focus_area}
                          </h3>
                          <div className="flex gap-2">
                            {session.session_exercises
                              ?.slice(0, 3)
                              .map((se: any, i: number) => (
                                <span
                                  key={i}
                                  className="text-[8px] font-bold text-white/20 uppercase"
                                >
                                  {se.exercise_library.name} {i < 2 ? "•" : ""}
                                </span>
                              ))}
                          </div>
                        </div>
                        {isToday && !isDone && (
                          <button
                            onClick={() =>
                              router.push(`/workout?sessionId=${session.id}`)
                            }
                            className="px-4 py-2 bg-primary text-black text-[9px] font-black rounded-xl uppercase tracking-widest"
                          >
                            Launch
                          </button>
                        )}
                        {isDone && (
                          <span className="text-[9px] font-black text-primary uppercase italic">
                            Logged ✓
                          </span>
                        )}
                      </div>
                    </Card>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-20 text-center border border-dashed border-white/10 rounded-2xl text-white/20 font-bold uppercase text-[10px]">
              No Calendar Data Found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SchedulePage() {
  return (
    <Suspense>
      <ScheduleContent />
    </Suspense>
  );
}
