"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";
import { Button } from "../../../components/ui/Button";

function WorkoutContent() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");

  const [session, setSession] = useState<any>(null);
  const [exercises, setExercises] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Track which exercises are expanded (for reading details) and checked (completed)
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function fetchSession() {
      if (!sessionId) return;
      
      try {
        // Fetch the Session
        const { data: sessionData } = await supabase
          .from("workout_sessions")
          .select("*")
          .eq("id", sessionId)
          .single();
        
        if (sessionData) setSession(sessionData);

        // Fetch the nested exercises with their library details
        const { data: exData } = await supabase
          .from("session_exercises")
          .select(`
            id, target_sets, target_reps, order_index,
            exercise_library (id, name, description, muscle_group, equipment, has_ai_model)
          `)
          .eq("session_id", sessionId)
          .order("order_index", { ascending: true });

        if (exData) setExercises(exData);
      } catch (error) {
        console.error("Error fetching workout:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSession();
  }, [sessionId, supabase]);

  const toggleCheck = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevents expanding the card when clicking the checkbox
    const newSet = new Set(completedExercises);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setCompletedExercises(newSet);
  };

  if (isLoading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"/></div>;
  if (!session) return <div className="p-8 text-white text-center">Session not found.</div>;

  const progress = exercises.length > 0 ? (completedExercises.size / exercises.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-[#050505] pb-24 pt-4 px-4 md:pt-10 md:px-8 font-sans">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Header */}
        <header className="flex items-center justify-between">
          <button onClick={() => router.push("/home")} className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-white font-bold hover:bg-white/10 transition-colors">
            ←
          </button>
          <div className="text-center">
            <p className="text-[10px] text-primary font-bold uppercase tracking-widest">{session.day_of_week}</p>
            <h1 className="text-lg font-black text-white tracking-tight">{session.focus_area}</h1>
          </div>
          <div className="w-10 h-10" /> {/* Spacer for centering */}
        </header>

        {/* Progress Bar */}
        <div className="bg-white/5 rounded-full h-2 w-full overflow-hidden">
          <div className="bg-primary h-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>

        {/* Exercises List */}
        <div className="space-y-3">
          {exercises.map((ex) => {
            const lib = ex.exercise_library;
            const isCompleted = completedExercises.has(ex.id);
            const isExpanded = expandedId === ex.id;

            return (
              <div 
                key={ex.id} 
                onClick={() => setExpandedId(isExpanded ? null : ex.id)}
                className={`rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden ${
                  isExpanded ? "bg-white/10 border-white/20" : "bg-white/5 border-white/5"
                }`}
              >
                {/* Compact View */}
                <div className="p-4 flex items-center gap-4">
                  {/* Custom Checkbox */}
                  <div 
                    onClick={(e) => toggleCheck(ex.id, e)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      isCompleted ? "bg-primary border-primary" : "border-white/30"
                    }`}
                  >
                    {isCompleted && <span className="text-black text-[10px] font-black">✓</span>}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <h3 className={`text-sm font-bold transition-colors ${isCompleted ? "text-white/50 line-through" : "text-white"}`}>
                      {lib.name}
                    </h3>
                    <p className="text-[11px] text-muted font-medium mt-0.5">
                      {ex.target_sets} Sets × {ex.target_reps} Reps
                    </p>
                  </div>

                  {/* Badges & Expand Icon */}
                  <div className="flex items-center gap-2">
                    {lib.has_ai_model && (
                      <span className="bg-primary/20 text-primary text-[9px] px-1.5 py-0.5 rounded font-black tracking-widest border border-primary/30">
                        AI
                      </span>
                    )}
                    <span className="text-white/40 text-xs">{isExpanded ? "▲" : "▼"}</span>
                  </div>
                </div>

                {/* Expanded Details View */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-2 border-t border-white/10 bg-black/20">
                    
                    {/* Placeholder for Exercise Image/Gif */}
                    <div className="w-full h-32 bg-gradient-to-tr from-white/5 to-white/10 rounded-xl mb-4 flex flex-col items-center justify-center border border-white/5">
                      <span className="text-3xl opacity-50">🏋️</span>
                      <span className="text-[10px] text-white/50 uppercase tracking-widest mt-2">{lib.muscle_group} Focus</span>
                    </div>

                    <p className="text-xs text-white/80 leading-relaxed mb-4">
                      {lib.description || "Maintain a tight core and controlled breathing throughout the movement."}
                    </p>

                    <div className="flex justify-between items-center bg-black/30 p-3 rounded-xl mb-4 border border-white/5">
                      <div className="text-center">
                        <span className="block text-[10px] text-muted uppercase">Equipment</span>
                        <span className="text-xs font-bold text-white">{lib.equipment || "Bodyweight"}</span>
                      </div>
                      <div className="w-px h-6 bg-white/10" />
                      <div className="text-center">
                        <span className="block text-[10px] text-muted uppercase">Target</span>
                        <span className="text-xs font-bold text-white">{lib.muscle_group}</span>
                      </div>
                    </div>

                    {/* AI Camera Launch Button */}
                    {lib.has_ai_model && (
                      <Button 
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push("/camera"); // Routes to the perfect camera page we just made!
                        }}
                        className="w-full h-12 bg-primary text-black font-black text-xs rounded-xl shadow-[0_0_15px_rgba(208,255,0,0.2)] hover:scale-[1.02]"
                      >
                        LAUNCH AI TRACKER
                      </Button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Finish Session Button */}
        {completedExercises.size === exercises.length && exercises.length > 0 && (
          <Button 
            onClick={() => router.push("/home")}
            className="w-full h-14 bg-white text-black font-black mt-8 rounded-2xl"
          >
            FINISH WORKOUT 🏆
          </Button>
        )}
      </div>
    </div>
  );
}

// Next.js requires SearchParams to be wrapped in a Suspense boundary
export default function WorkoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050505]" />}>
      <WorkoutContent />
    </Suspense>
  );
}