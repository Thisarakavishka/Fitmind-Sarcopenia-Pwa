"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";
import { Button } from "../../../components/shared/Button";
import toast from "react-hot-toast";

function WorkoutContent() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");

  const [session, setSession] = useState<any>(null);
  const [exercises, setExercises] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFinishing, setIsFinishing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [setHistory, setSetHistory] = useState<Record<string, number[]>>({});

  useEffect(() => {
    async function fetchSession() {
      if (!sessionId) return;
      try {
        const { data: sessionData } = await supabase
          .from("workout_sessions")
          .select("*")
          .eq("id", sessionId)
          .single();
        if (sessionData) setSession(sessionData);

        const { data: exData } = await supabase
          .from("session_exercises")
          .select(
            `
            id, target_sets, target_reps, order_index,
            exercise_library (id, name, description, muscle_group, equipment, has_ai_model, video_url)
          `,
          )
          .eq("session_id", sessionId)
          .order("order_index", { ascending: true });

        if (exData) {
          setExercises(exData);
          const { data: logs } = await supabase
            .from("workout_history_logs")
            .select("session_exercise_id");
          const history: Record<string, number[]> = {};
          exData.forEach((ex) => {
            const count =
              logs?.filter((l) => l.session_exercise_id === ex.id).length || 0;
            history[ex.id] = Array.from({ length: count }, (_, i) => i);
          });
          setSetHistory(history);
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to load workout data.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchSession();
  }, [sessionId, supabase]);

  const handleFinishWorkout = async () => {
    setIsFinishing(true);
    try {
      const { error } = await supabase
        .from("workout_sessions")
        .update({ is_completed: true })
        .eq("id", sessionId);

      if (error) throw error;

      toast.success("Workout Complete! Awesome job. 🏆");
      router.push("/home");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save workout. Please try again.");
      setIsFinishing(false);
    }
  };

  const toggleManualSet = async (exId: string, setIndex: number) => {
    const current = [...(setHistory[exId] || [])];
    const isCurrentlyDone = current.includes(setIndex);

    try {
      if (!isCurrentlyDone) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        // Save to Database so Heatmap works
        const { error } = await supabase.from("workout_history_logs").insert({
          user_id: user.id,
          session_exercise_id: exId,
          actual_reps_completed:
            exercises.find((e) => e.id === exId)?.target_reps || 0,
          ai_form_accuracy_score: null,
          date_completed: new Date().toISOString(),
        });

        if (error) throw error;

        setSetHistory({ ...setHistory, [exId]: [...current, setIndex] });
        if (navigator.vibrate) navigator.vibrate(10);
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to log set.");
    }
  };

  const isExComplete = (ex: any) =>
    (setHistory[ex.id]?.length || 0) >= ex.target_sets;
  const progress =
    exercises.length > 0
      ? (exercises.filter(isExComplete).length / exercises.length) * 100
      : 0;

  if (isLoading)
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="min-h-screen bg-[#050505] pb-24 pt-12 px-6 md:pt-16 md:px-8 font-sans antialiased">
      <div className="max-w-2xl mx-auto space-y-6">
        <header className="flex items-center justify-between mb-2">
          <button
            onClick={() => router.push("/home")}
            className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-white font-bold hover:bg-white/10 transition-colors"
          >
            ←
          </button>
          <div className="text-center">
            <p className="text-[10px] text-primary font-bold uppercase tracking-[0.2em] mb-1">
              {session?.day_of_week}
            </p>
            <h1 className="text-xl font-black text-white tracking-tight">
              {session?.focus_area}
            </h1>
          </div>
          <div className="w-10 h-10" />
        </header>

        <div className="bg-white/5 rounded-full h-1.5 w-full overflow-hidden mb-8">
          <div
            className="bg-primary h-full transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="space-y-3">
          {exercises.map((ex) => {
            const lib = ex.exercise_library;
            const completed = isExComplete(ex);
            const expanded = expandedId === ex.id;
            const setsDone = setHistory[ex.id] || [];

            return (
              <div
                key={ex.id}
                className={`rounded-2xl border transition-all duration-300 ${expanded ? "bg-white/10 border-primary/20" : "bg-white/5 border-white/5"}`}
              >
                <div
                  onClick={() => setExpandedId(expanded ? null : ex.id)}
                  className="p-4 flex items-center gap-4 cursor-pointer"
                >
                  <div
                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${completed ? "bg-primary border-primary shadow-[0_0_10px_rgba(208,255,0,0.3)]" : "border-white/20"}`}
                  >
                    {completed && (
                      <span className="text-black text-[10px] font-black">
                        ✓
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3
                      className={`text-sm font-bold ${completed ? "text-white/30" : "text-white"}`}
                    >
                      {lib.name}
                    </h3>
                    <p className="text-[10px] text-white/20 font-bold uppercase mt-1">
                      {setsDone.length} / {ex.target_sets} Sets Complete
                    </p>
                  </div>
                </div>

                {expanded && (
                  <div className="px-4 pb-5 pt-2 border-t border-white/5 animate-in fade-in">
                    {/* 🌟 Reference Image from video_url (since no image column exists) */}
                    <div className="w-full h-44 bg-black rounded-xl mb-6 overflow-hidden border border-white/10">
                      <img
                        src={
                          lib.video_url ||
                          "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=640&auto=format&fit=crop"
                        }
                        alt={lib.name}
                        className="w-full h-full object-cover opacity-60"
                      />
                    </div>

                    <div className="space-y-2 mb-6">
                      {[...Array(ex.target_sets)].map((_, i) => {
                        const setDone = setsDone.includes(i);
                        const isUnlocked = i === 0 || setsDone.includes(i - 1);
                        return (
                          <div
                            key={i}
                            className={`flex items-center justify-between p-3 rounded-xl border transition-all ${setDone ? "bg-primary/5 border-primary/20" : isUnlocked ? "bg-white/5 border-white/10" : "opacity-30 border-transparent"}`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] font-black text-white/40">
                                0{i + 1}
                              </span>
                              <span className="text-xs font-bold text-white">
                                1 × {ex.target_reps} Reps
                              </span>
                            </div>

                            <div className="flex items-center gap-3">
                              {lib.has_ai_model && isUnlocked && !setDone && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(
                                      `/camera?execId=${ex.id}&target=${ex.target_reps}`,
                                    );
                                  }}
                                  className="px-3 py-1.5 bg-primary text-black text-[9px] font-black rounded-lg uppercase tracking-widest"
                                >
                                  Launch AI
                                </button>
                              )}
                              <div
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (isUnlocked) toggleManualSet(ex.id, i);
                                }}
                                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${setDone ? "bg-primary border-primary" : "border-white/20"}`}
                              >
                                {setDone && (
                                  <span className="text-black text-[9px] font-black">
                                    ✓
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {exercises.every(isExComplete) && exercises.length > 0 && (
          <Button
            onClick={handleFinishWorkout}
            disabled={isFinishing}
            className="w-full h-14 bg-white text-black font-black mt-10 rounded-2xl shadow-2xl"
          >
            {isFinishing ? "SAVING SESSION..." : "FINISH WORKOUT 🏆"}
          </Button>
        )}
      </div>
    </div>
  );
}

export default function WorkoutPage() {
  return (
    <Suspense fallback={null}>
      <WorkoutContent />
    </Suspense>
  );
}
