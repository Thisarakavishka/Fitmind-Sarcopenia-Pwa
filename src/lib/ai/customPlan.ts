import { createClient } from "../supabase/client";

export async function createCustomPlan(userId: string, planName: string, days: any[]) {
  const supabase = createClient();

  // 1. Deactivate all existing plans to prevent conflicts
  await supabase.from("workout_plans").update({ is_active: false }).eq("user_id", userId);

  // 2. Create the New Custom Plan (ai_tag is set to 'custom')
  const { data: plan, error: planError } = await supabase
    .from("workout_plans")
    .insert({ user_id: userId, name: planName, ai_tag: "custom", is_active: true })
    .select()
    .single();

  if (planError || !plan) throw new Error("Failed to create plan");

  // 3. Create Sessions (Days) and Exercises
  const today = new Date();
  
  for (let i = 0; i < days.length; i++) {
    const day = days[i];
    
    // Schedule it starting from tomorrow, spaced out by the user's defined order
    const scheduledDate = new Date(today);
    scheduledDate.setDate(today.getDate() + (i + 1));

    const { data: session, error: sessionError } = await supabase
      .from("workout_sessions")
      .insert({
        plan_id: plan.id,
        day_of_week: `Day ${i + 1}`,
        focus_area: day.focus_area,
        scheduled_date: scheduledDate.toISOString().split('T')[0],
        is_completed: false
      })
      .select()
      .single();

    if (session && day.exercises.length > 0) {
      const exerciseInserts = day.exercises.map((ex: any, index: number) => ({
        session_id: session.id,
        exercise_id: ex.exercise_id,
        order_index: index + 1,
        target_sets: ex.sets,
        target_reps: ex.reps
      }));

      await supabase.from("session_exercises").insert(exerciseInserts);
    }
  }

  return plan;
}