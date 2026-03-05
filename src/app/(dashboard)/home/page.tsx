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

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data: planData, error: planError } = await supabase
          .from("workout_plans")
          .select("*")
          .eq("user_id", user.id)
          .eq("is_active", true)
          .single();

        if (planError || !planData) {
          setIsLoading(false);
          return;
        }

        setActivePlan(planData);

        const { data: sessionData, error: sessionError } = await supabase
          .from("workout_sessions")
          .select("*")
          .eq("plan_id", planData.id)
          .order("day_of_week", { ascending: true });

        if (!sessionError && sessionData) {
          setSessions(sessionData);
        }
      } catch (error) {
        console.error("Error fetching dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardData();
  }, [supabase]);

  return (
    <div className="min-h-screen bg-background pb-24 pt-6 px-4 md:pt-12 md:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* --- HEADER --- */}
        <header className="flex flex-col gap-1 animate-in fade-in slide-in-from-top-4 duration-500">
          <p className="text-muted text-sm font-medium tracking-wide uppercase">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              Hello,{" "}
              <span className="capitalize text-primary">
                {name?.split(" ")[0] || "Athlete"}
              </span>{" "}
              👋
            </h1>
            {/* User Avatar Placeholder */}
            <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-sm font-bold text-white shadow-lg backdrop-blur-md">
              {name ? name.charAt(0).toUpperCase() : "A"}
            </div>
          </div>
          <p className="text-sm text-white/60 font-medium">
            {age ? `${age} yrs | ${level}` : "Loading Profile..."}
          </p>
        </header>

        {/* --- MAIN DASHBOARD CONTENT --- */}
        <main>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-muted font-medium animate-pulse">
                Syncing AI Schedule...
              </p>
            </div>
          ) : activePlan ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
              {/* Hero Plan Card */}
              <Card className="relative overflow-hidden rounded-3xl border-white/10 bg-gradient-to-b from-white/[0.08] to-transparent p-6 md:p-8 backdrop-blur-xl shadow-2xl">
                {/* Decorative Background Glow */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 blur-[80px] rounded-full pointer-events-none"></div>

                <div className="relative z-10">
                  <div className="inline-block px-3 py-1 mb-4 rounded-full bg-primary/20 border border-primary/30 text-primary text-xs font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(208,255,0,0.2)]">
                    {activePlan.source_type.replace("_", " ")}
                  </div>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-white leading-tight mb-2">
                    {activePlan.name}
                  </h2>
                  <p className="text-sm text-white/60 mb-6 font-medium">
                    Your personalized clinical pathway to prevent muscle
                    degradation.
                  </p>

                  <Button
                    onClick={() => {
                      // Pass the ID of the first (upcoming) session to the camera
                      const nextSessionId = sessions[0]?.id;
                      router.push(`/camera?sessionId=${nextSessionId}`);
                    }}
                    className="w-full bg-primary text-black font-extrabold h-14 text-base rounded-2xl shadow-[0_0_20px_rgba(208,255,0,0.2)] hover:shadow-[0_0_30px_rgba(208,255,0,0.4)] hover:scale-[1.02] transition-all duration-300 active:scale-95"
                  >
                    START SESSION
                  </Button>
                </div>
              </Card>

              {/* Sessions List (Mobile Friendly Touch Targets) */}
              <div className="space-y-3 pt-2">
                <h3 className="text-lg font-bold text-white px-1 tracking-tight">
                  This Week's Split
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {sessions.length > 0 ? (
                    sessions.map((session, index) => (
                      <div
                        key={session.id}
                        className="group flex items-center gap-4 p-4 rounded-2xl bg-black/40 border border-white/5 hover:bg-white/5 active:scale-[0.98] transition-all duration-200 cursor-pointer backdrop-blur-md"
                      >
                        {/* Day Indicator */}
                        <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-white/5 border border-white/10 group-hover:border-primary/50 group-hover:text-primary transition-colors">
                          <span className="text-[10px] uppercase font-bold text-muted">
                            Day
                          </span>
                          <span className="text-lg font-black text-white group-hover:text-primary leading-none">
                            {session.day_of_week.replace("Day ", "")}
                          </span>
                        </div>

                        {/* Focus Area */}
                        <div className="flex-1">
                          <h4 className="text-sm md:text-base font-bold text-white group-hover:text-white transition-colors">
                            {session.focus_area}
                          </h4>
                          <p className="text-[11px] text-muted font-medium mt-0.5">
                            {index === 0 ? "Up Next" : "Upcoming"}
                          </p>
                        </div>

                        {/* Status Icon */}
                        <div className="w-6 h-6 rounded-full border-2 border-white/10 flex items-center justify-center group-hover:border-primary/50 transition-colors">
                          <div className="w-2 h-2 rounded-full bg-transparent group-hover:bg-primary/50"></div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center col-span-full">
                      <p className="text-sm text-muted font-medium">
                        No sessions scheduled yet.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <Card className="p-8 text-center rounded-3xl border-white/10 bg-black/40 backdrop-blur-md">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                ⚠️
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                No Active Plan Found
              </h2>
              <p className="text-muted text-sm mb-6 max-w-xs mx-auto">
                You haven't generated your AI medical schedule yet. Let's get
                started.
              </p>
              <Button className="bg-white text-black font-bold h-12 px-8 rounded-xl hover:bg-gray-200">
                Go to Onboarding
              </Button>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
