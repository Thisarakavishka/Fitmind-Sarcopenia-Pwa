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
    async function fetchSchedule() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: planData } = await supabase.from("workout_plans").select("*")
          .eq("user_id", user.id).eq("is_active", true).single();

        if (planData) {
          setActivePlan(planData);
          const { data: baseSessions } = await supabase.from("workout_sessions")
            .select(`*, session_exercises (exercise_library (name, muscle_group))`)
            .eq("plan_id", planData.id).order("day_of_week", { ascending: true });

          if (baseSessions) {
            const today = new Date();
            const monthlyCalendar = Array.from({ length: 28 }).map((_, i) => {
              const calendarDate = new Date();
              calendarDate.setDate(today.getDate() + i);
              const isRestDay = i % 3 === 2;
              
              if (isRestDay) return { id: `rest-${i}`, focus_area: "System Recovery", is_rest: true, calendarDate };
              const sessionTemplate = baseSessions[i % baseSessions.length];
              return { ...sessionTemplate, id: `${sessionTemplate.id}-${i}`, calendarDate, is_rest: false };
            });
            setSessions(monthlyCalendar);
          }
        }
      } catch (e) { console.error(e); } finally { setIsLoading(false); }
    }
    fetchSchedule();
  }, [supabase]);

  if (isLoading) return (
    <div className="min-h-screen bg-black flex items-center justify-center text-primary text-xs font-black">
      LOADING_PROTOCOL...
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-transparent pb-28 pt-4 px-4 md:px-10 font-sans antialiased">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* HEADER: Matches Home Page exactly */}
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

        {/* TIMELINE LIST */}
        <div className="space-y-10 pt-4">
          {[0, 1, 2, 3].map((weekIndex) => (
            <div key={weekIndex} className="space-y-4">
              {/* WEEK TITLE & HR: Same as Exercise/Template pages */}
              <div className="flex items-center gap-4">
                <h2 className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em] flex-shrink-0">Week 0{weekIndex + 1}</h2>
                <div className="h-px w-full bg-white/5" />
              </div>
              
              <div className="space-y-3">
                {sessions.slice(weekIndex * 7, (weekIndex + 1) * 7).map((session) => {
                  const isDone = session.is_completed;
                  const isRest = session.is_rest;
                  const isToday = session.calendarDate.toDateString() === new Date().toDateString();

                  return (
                    <div 
                      key={session.id}
                      className={`group relative flex items-center transition-all duration-500 ${isDone ? 'opacity-40' : 'opacity-100'}`}
                    >
                      {/* DATE INDICATOR */}
                      <div className="w-14 flex-shrink-0 text-left">
                        <p className={`text-[9px] font-black uppercase tracking-tighter ${isToday ? 'text-primary' : 'text-white/20'}`}>
                          {session.calendarDate.toLocaleDateString('en-US', { weekday: 'short' })}
                        </p>
                        <p className={`text-lg font-black leading-none tracking-tighter ${isToday ? 'text-white' : 'text-white/40'}`}>
                          {session.calendarDate.getDate()}
                        </p>
                      </div>

                      {/* SESSION STRIP: Using Card component for similarity */}
                      <Card 
                        className={`flex-1 flex items-center justify-between p-4 rounded-2xl border-l-4 transition-all ${
                          isRest 
                            ? "bg-white/[0.02] border-white/10" 
                            : isDone 
                            ? "bg-primary/5 border-primary/40" 
                            : isToday 
                            ? "bg-white/5 border-primary shadow-[0_0_30px_rgba(208,255,0,0.05)]" 
                            : "bg-[#0a0a0a] border-white/5 hover:border-white/20"
                        }`}
                      >
                        <div className="space-y-1">
                          <h3 className={`text-sm font-bold uppercase tracking-tight ${isRest ? 'text-white/20' : 'text-white'}`}>
                            {session.focus_area}
                          </h3>
                          {!isRest && (
                             <div className="flex gap-2">
                               {session.session_exercises?.slice(0, 3).map((se: any, i: number) => (
                                 <span key={i} className="text-[8px] font-bold text-white/20 uppercase tracking-widest">
                                   {se.exercise_library.name} {i < 2 ? '•' : ''}
                                 </span>
                               ))}
                             </div>
                          )}
                        </div>

                        <div className="flex items-center gap-4">
                          {isDone && <span className="text-[9px] font-black text-primary uppercase tracking-widest italic">Logged</span>}
                          {isToday && !isRest && !isDone && (
                            <button 
                              onClick={() => router.push(`/workout?sessionId=${session.id.split('-')[0]}`)}
                              className="px-4 py-2 bg-primary text-black text-[9px] font-black rounded-lg uppercase tracking-widest hover:scale-105 transition-transform"
                            >
                              Launch
                            </button>
                          )}
                          {isRest && <span className="text-lg opacity-20 grayscale">🍃</span>}
                        </div>
                      </Card>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* FOOTER: Matching Home Activity Card Footer */}
        <div className="mt-12 p-8 rounded-[2rem] border border-white/5 bg-[#0a0a0a]/40 backdrop-blur-xl text-center">
            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em] mb-3">Recovery Architecture</p>
            <p className="text-[11px] text-white/30 max-w-sm mx-auto leading-relaxed italic">
              System locks detected. Resting periods are non-negotiable to ensure muscle fiber recovery in adults 40+.
            </p>
        </div>
      </div>
    </div>
  );
}

export default function SchedulePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <ScheduleContent />
    </Suspense>
  );
}