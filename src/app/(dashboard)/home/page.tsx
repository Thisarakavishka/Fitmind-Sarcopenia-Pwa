import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Icons } from "../../../components/ui/Icon";
import { ActivityHeatmap } from "../../../features/dashboard/components/ActivityHeatmap";

export default function HomePage() {
  return (
    <div className="space-y-8">
      
      {/* 1. Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted text-sm mb-1">Good morning</p>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            thisara <span className="text-2xl">💪</span>
          </h1>
        </div>
        <div className="relative">
          <div className="w-10 h-10 bg-surface rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-white/5 cursor-pointer transition-colors">
            🔔
          </div>
          <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-background"></span>
        </div>
      </div>

      {/* 2. Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN (Workouts & Stats) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Today's Workout Card */}
          <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-surface to-[#161b1d]">
            <div className="absolute top-0 right-0 p-4 flex gap-2">
               <span className="bg-[#1c2e2e] text-primary text-[10px] font-bold px-2 py-1 rounded border border-primary/20">Chest</span>
               <span className="bg-[#1c2e2e] text-primary text-[10px] font-bold px-2 py-1 rounded border border-primary/20">Back</span>
            </div>

            <div className="mb-6 mt-2">
              <span className="text-muted text-xs uppercase tracking-wider font-semibold">Today's Workout</span>
              <h2 className="text-2xl font-bold text-white mt-1">Upper Body Strength</h2>
              <div className="flex gap-4 text-sm text-muted mt-3">
                <div className="flex items-center gap-1.5"><Icons.Schedule size={14}/> 45 min</div>
                <div className="flex items-center gap-1.5"><Icons.Nutrition size={14}/> 320 cal</div>
                <div className="flex items-center gap-1.5"><Icons.Workout size={14}/> 8 exercises</div>
              </div>
            </div>

            <Button className="w-full bg-primary text-black font-bold h-12 text-base shadow-[0_0_20px_rgba(45,212,191,0.2)] hover:shadow-[0_0_30px_rgba(45,212,191,0.4)]">
              <span className="mr-2">▶</span> START WORKOUT
            </Button>
          </Card>

          {/* Progress Grid (4 Small Cards) */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">Your Progress</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <Card className="p-4 flex items-center gap-4 hover:bg-white/5 transition-colors">
                <div className="w-10 h-10 rounded-full bg-cyan-900/20 text-primary flex items-center justify-center">⚡️</div>
                <div>
                  <div className="text-xs text-muted">This Week</div>
                  <div className="text-xl font-bold text-white">4 workouts <span className="text-xs text-primary ml-1">+2</span></div>
                </div>
              </Card>

              <Card className="p-4 flex items-center gap-4 hover:bg-white/5 transition-colors">
                <div className="w-10 h-10 rounded-full bg-green-900/20 text-green-500 flex items-center justify-center">🎯</div>
                <div>
                  <div className="text-xs text-muted">Current Streak</div>
                  <div className="text-xl font-bold text-white">12 days</div>
                </div>
              </Card>

              <Card className="p-4 flex items-center gap-4 hover:bg-white/5 transition-colors">
                <div className="w-10 h-10 rounded-full bg-orange-900/20 text-orange-500 flex items-center justify-center">📈</div>
                <div>
                  <div className="text-xs text-muted">Progress</div>
                  <div className="text-xl font-bold text-white">78% <span className="text-xs text-green-500 ml-1">↑ 5%</span></div>
                </div>
              </Card>

              <Card className="p-4 flex items-center gap-4 hover:bg-white/5 transition-colors">
                <div className="w-10 h-10 rounded-full bg-yellow-900/20 text-yellow-500 flex items-center justify-center">🏆</div>
                <div>
                  <div className="text-xs text-muted">Best Streak</div>
                  <div className="text-xl font-bold text-white">21 days</div>
                </div>
              </Card>

            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (Heatmap) */}
        <div className="lg:col-span-1 h-full">
           <ActivityHeatmap />
        </div>

      </div>
    </div>
  );
}