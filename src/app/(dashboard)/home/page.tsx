import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";

export default function HomePage() {
  return (
    <div className="space-y-6">
      {/* 1. Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Good morning, Thisara 💪
          </h1>
          <p className="text-muted">Let's crush your goals today.</p>
        </div>
        <div className="w-10 h-10 bg-surface rounded-full border border-white/10 flex items-center justify-center">
          🔔
        </div>
      </div>

      {/* 2. Primary Action Card (The big green one in your design) */}
      <Card className="bg-gradient-to-r from-surface to-[#1c2225] border-primary/20">
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded">
              Today's Workout
            </span>
            <h2 className="text-xl font-bold text-white mt-2">
              Upper Body Strength
            </h2>
          </div>
          <div className="flex gap-2">
            <span className="text-xs bg-surface border border-white/10 px-2 py-1 rounded text-muted">
              Chest
            </span>
            <span className="text-xs bg-surface border border-white/10 px-2 py-1 rounded text-muted">
              Back
            </span>
          </div>
        </div>

        <div className="flex gap-4 text-sm text-muted mb-6">
          <div className="flex items-center gap-1">⏱ 45 min</div>
          <div className="flex items-center gap-1">🔥 320 cal</div>
          <div className="flex items-center gap-1">🏋️ 8 exercises</div>
        </div>

        <Button className="w-full bg-primary text-black font-bold">
          START WORKOUT
        </Button>
      </Card>

      {/* 3. Stats Grid (Your Progress) */}
      <h3 className="text-lg font-bold text-white mt-6">Your Progress</h3>
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="w-8 h-8 rounded-full bg-cyan-900/30 text-primary flex items-center justify-center mb-2">
            ⚡️
          </div>
          <div className="text-2xl font-bold text-white">4</div>
          <div className="text-xs text-muted">Workouts this week</div>
        </Card>
        <Card className="p-4">
          <div className="w-8 h-8 rounded-full bg-green-900/30 text-green-500 flex items-center justify-center mb-2">
            🎯
          </div>
          <div className="text-2xl font-bold text-white">12</div>
          <div className="text-xs text-muted">Day Streak</div>
        </Card>
      </div>
    </div>
  );
}
