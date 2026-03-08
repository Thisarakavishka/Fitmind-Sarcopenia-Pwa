"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../../lib/supabase/client";
import { useRouter } from "next/navigation";
import { Card } from "../../../components/shared/Card";
import { Button } from "../../../components/shared/Button";

export default function ProgramsPage() {
  const supabase = createClient();
  const router = useRouter();

  const [plans, setPlans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [switchingId, setSwitchingId] = useState<string | null>(null);
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);
  const [planDetails, setPlanDetails] = useState<any>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  async function fetchPlans() {
    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch all plans for this user, ordered by newest first
    const { data } = await supabase
      .from("workout_plans")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (data) setPlans(data);
    setIsLoading(false);
  }

  // 🌟 LOGIC: Fetch the specific sessions and exercises when a user expands a plan to look at it
  async function handleExpandPlan(planId: string) {
    if (expandedPlanId === planId) {
      setExpandedPlanId(null);
      setPlanDetails(null);
      return;
    }

    setExpandedPlanId(planId);
    const { data } = await supabase
      .from("workout_sessions")
      .select(`*, session_exercises(target_sets, target_reps, exercise_library(name))`)
      .eq("plan_id", planId)
      .order("day_of_week", { ascending: true });

    if (data) setPlanDetails(data);
  }

  // 🌟 LOGIC: Switch the active plan. Turns off all others, turns on the selected one.
  async function handleReactivatePlan(planId: string) {
    setSwitchingId(planId);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 1. Deactivate all plans
    await supabase.from("workout_plans").update({ is_active: false }).eq("user_id", user.id);
    
    // 2. Activate the selected plan
    await supabase.from("workout_plans").update({ is_active: true }).eq("id", planId);

    // 3. Refresh the UI
    await fetchPlans();
    setSwitchingId(null);
  }

  if (isLoading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="w-full min-h-screen bg-transparent pb-32 pt-10 px-6 max-w-3xl mx-auto space-y-6 font-sans antialiased text-white">
      <header className="flex items-center gap-4 border-b border-white/5 pb-4">
        <button onClick={() => router.back()} className="text-white/40 hover:text-white transition-colors">←</button>
        <div>
          <h1 className="text-xl font-black tracking-tight">My <span className="text-primary">Programs</span></h1>
          <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1">Workout Plan Archive</p>
        </div>
      </header>

      <div className="space-y-4 pt-2">
        {plans.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-white/10 rounded-2xl text-white/20 font-bold uppercase text-[10px]">No plans found in your history.</div>
        ) : (
          plans.map((plan) => {
            const isActive = plan.is_active;
            const isAI = plan.ai_tag !== "custom";
            const isExpanded = expandedPlanId === plan.id;
            const createdDate = new Date(plan.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

            return (
              <div key={plan.id} className="space-y-2">
                <Card className={`p-5 transition-all cursor-pointer ${isActive ? 'bg-primary/5 border-primary/30' : 'bg-[#0a0a0a] border-white/5 hover:border-white/20'}`}>
                  
                  <div className="flex justify-between items-start" onClick={() => handleExpandPlan(plan.id)}>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {isActive && <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
                        <p className={`text-[9px] font-black uppercase tracking-widest ${isActive ? 'text-primary' : 'text-white/40'}`}>
                          {isActive ? "Active Schedule" : "Archived"}
                        </p>
                      </div>
                      <h3 className="text-lg font-bold text-white uppercase tracking-tight">{plan.name}</h3>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${isAI ? 'bg-blue-500/10 text-blue-400' : 'bg-white/10 text-white/60'}`}>
                          {isAI ? "AI Generated" : "Manual Plan"}
                        </span>
                        <span className="text-[9px] text-white/30 font-bold uppercase">{createdDate}</span>
                      </div>
                    </div>
                    
                    <button className="text-white/30 hover:text-white transition-colors mt-2">
                      <svg className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
                    </button>
                  </div>

                  {/* 🌟 ACTION BUTTON: Show Reactivate button if the plan is inactive */}
                  {!isActive && (
                    <div className="mt-4 pt-4 border-t border-white/5 flex justify-end">
                      <Button 
                        onClick={() => handleReactivatePlan(plan.id)}
                        disabled={switchingId === plan.id}
                        className="px-6 py-2 bg-white/10 text-white font-black uppercase tracking-widest text-[9px] rounded-lg hover:bg-primary hover:text-black transition-all"
                      >
                        {switchingId === plan.id ? "Activating..." : "Set as Active Plan"}
                      </Button>
                    </div>
                  )}
                </Card>

                {/* 🌟 PLAN DETAILS (Expanded View) */}
                {isExpanded && planDetails && (
                  <div className="mx-4 p-4 bg-white/[0.02] border-x border-b border-white/5 rounded-b-2xl space-y-4 animate-in fade-in slide-in-from-top-2">
                    {planDetails.length === 0 ? (
                      <p className="text-[10px] text-white/40 text-center uppercase tracking-widest">No sessions found in this plan.</p>
                    ) : (
                      planDetails.map((session: any) => (
                        <div key={session.id} className="space-y-2">
                          <h4 className="text-[10px] font-black text-primary uppercase tracking-widest border-b border-white/5 pb-1">
                            {session.day_of_week}: {session.focus_area}
                          </h4>
                          <div className="space-y-1 pl-2">
                            {session.session_exercises.map((ex: any, idx: number) => (
                              <div key={idx} className="flex justify-between items-center text-[10px] font-medium text-white/60">
                                <span>{ex.exercise_library?.name}</span>
                                <span>{ex.target_sets} × {ex.target_reps}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}