import { createClient } from "../supabase/client";

export async function generateScheduleInDB(userId: string, aiPlanTag: string) {
  const supabase = createClient();

  // 1. GET THE MASTER BLUEPRINT
  const { data: template, error: tError } = await supabase
    .from("workout_templates")
    .select(`
      id, name, 
      template_exercises (
        exercise_id, day_number, target_sets, target_reps, order_index
      )
    `)
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

  // 🌟 3. GENERATE 28 DAYS OF REAL DATED SESSIONS
  const templateDays = Array.from(new Set(template.template_exercises.map((te) => te.day_number)));
  const totalDays = 28; // Full Month Roadmap
  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);

  for (let i = 0; i < totalDays; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);

    // Protocol Logic: 2 Days Training, 1 Day Rest
    const isRestDay = i % 3 === 2;
    if (isRestDay) continue; // We don't create a row for rest, or you can create one with focus_area: "Rest"

    // Map the loop index to the template sequence (e.g., 0->Day1, 1->Day2, 3->Day1)
    const dayNum = templateDays[i % templateDays.length];

    const { data: session, error: sError } = await supabase
      .from("workout_sessions")
      .insert({
        plan_id: plan.id,
        day_of_week: `Day ${dayNum}`,
        focus_area: template.name,
        scheduled_date: currentDate.toISOString().split('T')[0], // 🌟 THE FIX: Hard-coding the real date
        is_completed: false,
      })
      .select()
      .single();

    if (session && !sError) {
      // 4. CLONE EXERCISES FOR THIS SPECIFIC DATE
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