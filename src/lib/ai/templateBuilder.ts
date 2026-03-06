// lib/ai/templateBuilder.ts
import { createClient } from "../supabase/client";

export async function generateScheduleInDB(userId: string, aiPlanTag: string) {
  const supabase = createClient();

  // 1. GET THE MASTER TEMPLATE based on the AI Tag
  const { data: template, error: tError } = await supabase
    .from("workout_templates")
    .select(
      `
      id, name, 
      template_exercises (
        exercise_id, day_number, target_sets, target_reps, order_index
      )
    `,
    )
    .eq("ai_tag", aiPlanTag)
    .single();

  if (tError || !template) {
    console.error("Template not found for tag:", aiPlanTag);
    return null;
  }

  // 2. CREATE THE USER'S PERSONAL PLAN
  const { data: plan, error: pError } = await supabase
    .from("workout_plans")
    .insert({
      user_id: userId,
      name: `Personal: ${template.name}`,
      ai_tag: aiPlanTag,
      is_active: true,
    })
    .select()
    .single();

  if (pError) return null;

  // 3. GENERATE SESSIONS (Groups of exercises by Day)
  // We group the template exercises by their day_number
  const days = Array.from(
    new Set(template.template_exercises.map((te) => te.day_number)),
  );

  for (const dayNum of days) {
    const { data: session, error: sError } = await supabase
      .from("workout_sessions")
      .insert({
        plan_id: plan.id,
        day_of_week: `Day ${dayNum}`,
        focus_area: template.name, // Or a more specific focus if you add it to templates
        is_completed: false,
      })
      .select()
      .single();

    if (session && !sError) {
      // 4. CLONE THE EXERCISES FOR THIS SPECIFIC SESSION
      const exercisesForThisDay = template.template_exercises
        .filter((te) => te.day_number === dayNum)
        .map((te) => ({
          session_id: session.id,
          exercise_id: te.exercise_id,
          target_sets: te.target_sets,
          target_reps: te.target_reps,
          order_index: te.order_index,
        }));

      await supabase.from("session_exercises").insert(exercisesForThisDay);
    }
  }

  return plan.id;
}
