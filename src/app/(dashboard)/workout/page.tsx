import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Icons } from "../../../components/ui/Icon";

export default function WorkoutPage() {
  // Mock data matching your design
  const exercises = [
    { name: "Push-ups", sets: "3 sets x 12-15", ai: true },
    { name: "Dumbbell Rows", sets: "3 sets x 10-12", ai: false },
    { name: "Squats", sets: "4 sets x 12", ai: true },
    { name: "Plank", sets: "3 sets x 45 sec", ai: false },
  ];

  return (
    <div className="space-y-6 pb-24">
      {/* 1. Header Section */}
      <div className="mb-6">
        <span className="text-xs font-bold text-primary uppercase tracking-wider">
          Today's Session
        </span>
        <h1 className="text-3xl font-bold text-white mt-1">Upper Body Power</h1>
        <div className="flex gap-4 text-sm text-muted mt-2">
          <span className="flex items-center gap-1">⏱ 45 min</span>
          <span className="flex items-center gap-1">🔥 320 cal</span>
        </div>
      </div>

      {/* 2. Exercise List */}
      <div className="space-y-3">
        {exercises.map((ex, i) => (
          <Card
            key={i}
            className="flex items-center justify-between p-4 group hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-4">
              {/* Number Badge */}
              <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-xs text-muted font-mono">
                {i + 1}
              </div>

              {/* Text Info */}
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-white font-bold">{ex.name}</h3>
                  {/* AI Badge - Only shows if exercise supports AI */}
                  {ex.ai && (
                    <span className="bg-primary/10 text-primary text-[10px] px-1.5 py-0.5 rounded border border-primary/20 font-bold tracking-wider">
                      AI
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted">{ex.sets}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {/* Camera Button (Only for AI exercises) */}
              {ex.ai && (
                <button className="w-10 h-10 rounded-full bg-white/5 hover:bg-primary hover:text-black text-white flex items-center justify-center transition-all active:scale-95">
                  <Icons.Workout size={18} />{" "}
                  {/* Using Dumbbell icon as Camera placeholder for now */}
                </button>
              )}
              {/* Play/Details Button */}
              <button className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-all active:scale-95">
                <span className="text-xs">▶</span>
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* 3. Big Start Button */}
      <Button className="w-full py-4 text-lg bg-primary text-black font-bold shadow-[0_0_25px_rgba(45,212,191,0.3)] hover:shadow-[0_0_35px_rgba(45,212,191,0.5)]">
        START WORKOUT
      </Button>
    </div>
  );
}
