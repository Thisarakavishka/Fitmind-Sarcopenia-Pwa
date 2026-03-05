// lib/ai/templateBuilder.ts
import { createClient } from "../supabase/client";

export async function generateScheduleInDB(userId: string, aiPlanTag: string) {
  const supabase = createClient();

  // 1. Create the Main Plan
  const { data: planData, error: planError } = await supabase
    .from("workout_plans")
    .insert({
      user_id: userId,
      name: aiPlanTag.replace(/_/g, " "),
      source_type: "AI_Generated",
      start_date: new Date().toISOString().split('T')[0],
      is_active: true
    })
    .select()
    .single();

  if (planError) return null;
  const planId = planData.id;

  // 2. Define Professional Clinical & Fitness Routines
  let sessionsToBuild: { day: string; focus: string }[] = [];

  switch (aiPlanTag) {
    case "Hypertrophy_Muscle_Builder":
      sessionsToBuild = [
        { day: "Day 1", focus: "Chest & Triceps" },
        { day: "Day 2", focus: "Back & Biceps" },
        { day: "Day 4", focus: "Legs & Core (Squat AI Focus)" },
      ];
      break;
    case "Athlete_Performance":
      sessionsToBuild = [
        { day: "Day 1", focus: "Push (Chest, Shoulders, Tris)" },
        { day: "Day 3", focus: "Legs (Heavy Squats)" },
      ];
      break;
    case "Silver_Mobility_Rehab":
      sessionsToBuild = [
        { day: "Day 1", focus: "Joint Mobility & Stretching" },
        { day: "Day 3", focus: "Chair Stand Sarcopenia Focus" },
      ];
      break;
    default:
      sessionsToBuild = [
        { day: "Day 1", focus: "Full Body Foundation" },
        { day: "Day 3", focus: "Lower Body Burn" }
      ];
  }

  // 3. Fetch the Exercise IDs from the library we just created!
  const { data: exercises } = await supabase.from("exercise_library").select("id, name");
  const squatId = exercises?.find((e) => e.name === 'Bodyweight Squat')?.id;
  const chairStandId = exercises?.find((e) => e.name === 'Chair Stand')?.id;
  const pushupId = exercises?.find((e) => e.name === 'Push-up')?.id;

  // 4. Insert the Sessions AND the Exercises
  for (const session of sessionsToBuild) {
    const { data: sessionData, error: sessionError } = await supabase
      .from("workout_sessions")
      .insert({
        plan_id: planId,
        day_of_week: session.day,
        focus_area: session.focus,
        is_completed: false
      })
      .select()
      .single();

    if (!sessionError && sessionData) {
      // 5. ATTACH EXERCISES TO THE SESSION based on the focus!
      let exercisesToInsert = [];

      // If it's a Leg/Lower Body/Chair day, add the AI-tracked exercises
      if ((session.focus.includes("Legs") || session.focus.includes("Lower")) && squatId) {
        exercisesToInsert.push({ session_id: sessionData.id, exercise_id: squatId, target_sets: 3, target_reps: 10, order_index: 1 });
      } else if (session.focus.includes("Chair") && chairStandId) {
        exercisesToInsert.push({ session_id: sessionData.id, exercise_id: chairStandId, target_sets: 3, target_reps: 8, order_index: 1 });
      } else if ((session.focus.includes("Chest") || session.focus.includes("Push") || session.focus.includes("Full")) && pushupId) {
        exercisesToInsert.push({ session_id: sessionData.id, exercise_id: pushupId, target_sets: 3, target_reps: 12, order_index: 1 });
      }

      // Insert into the mapping table
      if (exercisesToInsert.length > 0) {
        await supabase.from("session_exercises").insert(exercisesToInsert);
      }
    }
  }

  return planId;
}