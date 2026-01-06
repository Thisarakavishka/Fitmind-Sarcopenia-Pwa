"use client"; // Needs to be client to read store

import { useUserStore } from "../../../lib/store/userStore";
import { WORKOUT_TEMPLATES } from "../../../features/schedule/data/workoutTemplates";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Icons } from "../../../components/ui/Icon";
import { ActivityHeatmap } from "../../../features/dashboard/components/ActivityHeatmap";

export default function HomePage() {
  // 1. Get User Data from Store
  const { name, goal, age } = useUserStore();

  // 2. Simple "AI" Logic (We will replace this with real AI later)
  // For now, this mimics what the AI does:
  let planId = 2; // Default to Muscle
  if (age && age > 60) planId = 0; // Sarcopenia
  else if (goal === "weight_loss") planId = 1;
  else if (goal === "sarcopenia_prevention") planId = 0;

  // 3. Get the Correct Schedule
  const myPlan = WORKOUT_TEMPLATES[planId as keyof typeof WORKOUT_TEMPLATES];
  const todayWorkout = myPlan.schedule[0]; // Assuming today is Monday for demo

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted text-sm mb-1">Welcome back,</p>
          <h1 className="text-3xl font-bold text-white capitalize">
            {name || "Athlete"} 💪
          </h1>
          <p className="text-xs text-primary mt-1">Goal: {myPlan.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Workout Card */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-surface to-[#161b1d]">
            <div className="absolute top-0 right-0 p-4">
              <span className="bg-[#1c2e2e] text-primary text-[10px] font-bold px-2 py-1 rounded border border-primary/20">
                {myPlan.intensity} Intensity
              </span>
            </div>

            <div className="mb-6 mt-2">
              <span className="text-muted text-xs uppercase tracking-wider font-semibold">
                Today's Session
              </span>
              <h2 className="text-2xl font-bold text-white mt-1">
                {todayWorkout.title}
              </h2>
              <div className="flex gap-4 text-sm text-muted mt-3">
                <div className="flex items-center gap-1.5">
                  <Icons.Schedule size={14} /> {todayWorkout.duration}
                </div>
                <div className="flex items-center gap-1.5">
                  <Icons.Workout size={14} /> {todayWorkout.exercises.length}{" "}
                  Exercises
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-6">
              {todayWorkout.exercises.map((ex, i) => (
                <div
                  key={i}
                  className="text-sm text-white/80 flex items-center gap-2"
                >
                  <span className="w-1 h-1 rounded-full bg-primary"></span> {ex}
                </div>
              ))}
            </div>

            <Button className="w-full bg-primary text-black font-bold h-12">
              START WORKOUT
            </Button>
          </Card>
        </div>

        {/* Heatmap */}
        <div className="lg:col-span-1 h-full">
          <ActivityHeatmap />
        </div>
      </div>
    </div>
  );
}
