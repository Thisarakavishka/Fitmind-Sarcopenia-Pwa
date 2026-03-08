"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../../lib/supabase/client";
import { useRouter } from "next/navigation";
import { Card } from "../../../components/shared/Card";
import { Button } from "../../../components/shared/Button";
import { createCustomPlan } from "../../../lib/ai/customPlan";
import { Icons } from "@/src/components/shared/Icon";

export default function CreateCustomPlanPage() {
  const supabase = createClient();
  const router = useRouter();

  const [exerciseLibrary, setExerciseLibrary] = useState<any[]>([]);
  const [planName, setPlanName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // State for building the custom routine
  const [days, setDays] = useState([
    { focus_area: "Upper Body", exercises: [] as any[] },
  ]);

  useEffect(() => {
    async function fetchExercises() {
      const { data } = await supabase
        .from("exercise_library")
        .select("*")
        .order("name");
      if (data) setExerciseLibrary(data);
    }
    fetchExercises();
  }, []);

  const handleAddDay = () => {
    setDays([...days, { focus_area: "New Workout Day", exercises: [] }]);
  };

  const handleRemoveDay = (indexToRemove: number) => {
    setDays(days.filter((_, index) => index !== indexToRemove));
  };

  const handleAddExercise = (dayIndex: number) => {
    if (exerciseLibrary.length === 0) return;
    const newDays = [...days];
    newDays[dayIndex].exercises.push({
      exercise_id: exerciseLibrary[0].id, // Default to first exercise
      name: exerciseLibrary[0].name,
      sets: 3,
      reps: 12,
    });
    setDays(newDays);
  };

  const handleRemoveExercise = (dayIndex: number, exIndexToRemove: number) => {
    const newDays = [...days];
    newDays[dayIndex].exercises = newDays[dayIndex].exercises.filter(
      (_, idx) => idx !== exIndexToRemove,
    );
    setDays(newDays);
  };

  const handleExerciseChange = (
    dayIndex: number,
    exIndex: number,
    field: string,
    value: any,
  ) => {
    const newDays = [...days];
    if (field === "exercise_id") {
      const selected = exerciseLibrary.find((e) => e.id === value);
      newDays[dayIndex].exercises[exIndex].exercise_id = value;
      newDays[dayIndex].exercises[exIndex].name = selected?.name;
    } else {
      newDays[dayIndex].exercises[exIndex][field] = value;
    }
    setDays(newDays);
  };

  const handleSavePlan = async () => {
    // 1. Check if name exists
    if (!planName.trim()) {
      return alert("Please give your plan a name.");
    }

    // 2. Check if at least one day exists
    if (days.length === 0) {
      return alert("Your plan must have at least one training day.");
    }

    // 3. Check if any day has ZERO exercises
    const emptyDayIndex = days.findIndex((day) => day.exercises.length === 0);
    if (emptyDayIndex !== -1) {
      return alert(
        `Day 0${emptyDayIndex + 1} (${days[emptyDayIndex].focus_area}) has no exercises. Please add exercises or remove the day.`,
      );
    }

    setIsSaving(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      await createCustomPlan(user.id, planName, days);
      router.push("/home"); // Send them back to dashboard to see their new active plan
    } catch (e) {
      alert("Failed to save custom plan.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-transparent pb-32 pt-10 px-6 max-w-2xl mx-auto space-y-6 font-sans antialiased text-white">
      <header className="flex items-center gap-4 border-b border-white/5 pb-4">
        <button
          onClick={() => router.back()}
          className="text-white/40 hover:text-white"
        >
          ←
        </button>
        <div>
          <h1 className="text-xl font-black tracking-tight">
            Custom <span className="text-primary">Workout Builder</span>
          </h1>
          <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1">
            Manual Creation Mode
          </p>
        </div>
      </header>

      {/* PLAN DETAILS */}
      <div className="space-y-2">
        <label className="text-[9px] font-black text-white/40 uppercase tracking-widest ml-1">
          Program Name
        </label>
        <input
          type="text"
          placeholder="e.g. My Summer Shred"
          value={planName}
          onChange={(e) => setPlanName(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm font-bold text-white outline-none focus:border-primary/50"
        />
      </div>

      {/* DAYS BUILDER */}
      <div className="space-y-6 pt-4">
        {days.map((day, dayIndex) => (
          <Card
            key={dayIndex}
            className="p-5 bg-[#0a0a0a] border-white/5 space-y-4 relative group"
          >
            <button
              onClick={() => handleRemoveDay(dayIndex)}
              className="absolute -top-3 -right-3 w-8 h-8 bg-[#1a1a1a] text-white/30 rounded-full flex items-center justify-center border border-white/5 shadow-xl hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/20 transition-all z-10"
              title="Remove Day"
            >
              <Icons.Trash size={12} />
            </button>
            <div className="flex justify-between items-center">
              <input
                type="text"
                value={day.focus_area}
                onChange={(e) => {
                  const newDays = [...days];
                  newDays[dayIndex].focus_area = e.target.value;
                  setDays(newDays);
                }}
                className="bg-transparent text-sm font-black uppercase text-primary outline-none border-b border-white/10 focus:border-primary w-2/3 pb-1"
              />
              <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">
                Day 0{dayIndex + 1}
              </span>
            </div>

            {/* EXERCISES LIST */}
            <div className="space-y-3">
              {day.exercises.map((ex, exIndex) => (
                <div
                  key={exIndex}
                  className="flex gap-2 items-center bg-white/5 p-3 rounded-lg border border-white/5"
                >
                  <select
                    value={ex.exercise_id}
                    onChange={(e) =>
                      handleExerciseChange(
                        dayIndex,
                        exIndex,
                        "exercise_id",
                        e.target.value,
                      )
                    }
                    className="flex-1 bg-transparent text-xs font-bold text-white outline-none w-1/2"
                  >
                    {exerciseLibrary.map((libEx) => (
                      <option
                        key={libEx.id}
                        value={libEx.id}
                        className="bg-black text-white"
                      >
                        {libEx.name}
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center gap-1 shrink-0">
                    <input
                      type="number"
                      value={ex.sets}
                      onChange={(e) =>
                        handleExerciseChange(
                          dayIndex,
                          exIndex,
                          "sets",
                          Number(e.target.value),
                        )
                      }
                      className="w-10 bg-black/40 border border-white/10 rounded p-1 text-center text-xs font-bold"
                    />
                    <span className="text-[8px] text-white/40">×</span>
                    <input
                      type="number"
                      value={ex.reps}
                      onChange={(e) =>
                        handleExerciseChange(
                          dayIndex,
                          exIndex,
                          "reps",
                          Number(e.target.value),
                        )
                      }
                      className="w-10 bg-black/40 border border-white/10 rounded p-1 text-center text-xs font-bold"
                    />
                  </div>
                  <button
                    onClick={() => handleRemoveExercise(dayIndex, exIndex)}
                    className="ml-2 text-white/20 hover:text-red-500 transition-colors"
                  >
                    <Icons.Trash size={14} />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => handleAddExercise(dayIndex)}
              className="w-full py-3 border border-dashed border-white/10 rounded-lg text-[9px] font-black text-white/40 uppercase hover:text-white hover:border-white/20 transition-all"
            >
              + Add Exercise
            </button>
          </Card>
        ))}
      </div>

      <div className="flex gap-3 pt-6">
        <button
          onClick={handleAddDay}
          className="flex-1 py-4 bg-white/5 text-white/60 font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-white/10"
        >
          + Add Training Day
        </button>
        <Button
          onClick={handleSavePlan}
          disabled={isSaving}
          className="flex-1 py-4 bg-primary text-black font-black uppercase text-[10px] tracking-widest rounded-xl shadow-[0_0_20px_rgba(208,255,0,0.15)]"
        >
          {isSaving ? "Saving..." : "Activate Plan"}
        </Button>
      </div>
    </div>
  );
}
