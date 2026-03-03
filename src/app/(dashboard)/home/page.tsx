"use client";

import { useUserStore } from "../../../lib/store/userStore";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";

export default function HomePage() {
  // Reading the data we just saved during Onboarding!
  const { name, goal, age, level } = useUserStore();

  return (
    <div className="space-y-8 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted text-sm mb-1">Welcome back,</p>
          <h1 className="text-3xl font-bold text-white capitalize">
            {name || "Athlete"} 💪
          </h1>
          <p className="text-sm text-primary mt-1">
            Status: {age ? `${age} yrs | ${level}` : "Loading Profile..."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Workout Card */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-surface to-[#161b1d] p-6">
            
            <div className="mb-6">
              <span className="text-muted text-xs uppercase tracking-wider font-semibold">
                AI Generated Schedule
              </span>
              <h2 className="text-2xl font-bold text-white mt-2">
                {goal === "sarcopenia_prevention" ? "Sarcopenia Defense Protocol" : "Full Body Hypertrophy"}
              </h2>
            </div>

            <div className="space-y-3 mb-8">
              <div className="text-sm text-white/80 flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-primary"></span> 
                Bodyweight Squats (AI Camera Active)
              </div>
              <div className="text-sm text-white/80 flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-primary"></span> 
                Overhead Press
              </div>
            </div>

            <Button className="w-full bg-primary text-black font-bold h-12">
              START WORKOUT & OPEN CAMERA
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}