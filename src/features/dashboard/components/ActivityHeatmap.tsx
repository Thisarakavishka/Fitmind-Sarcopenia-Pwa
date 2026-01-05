"use client";

import { Card } from "../../../components/ui/Card";

export function ActivityHeatmap() {
  // 1. Generate Dummy Data (14 Weeks x 7 Days) to match screenshot
  // 0 = No activity (Grey), 1-4 = Activity levels (Teal intensity)
  const weeks = Array.from({ length: 18 }).map(() =>
    Array.from({ length: 7 }).map(() => {
      const rand = Math.random();
      if (rand > 0.7) return Math.floor(Math.random() * 4) + 1; // Active
      return 0; // Inactive
    })
  );

  // Helper to get color based on intensity
  const getColor = (level: number) => {
    switch (level) {
      case 1:
        return "bg-primary/30";
      case 2:
        return "bg-primary/50";
      case 3:
        return "bg-primary/80";
      case 4:
        return "bg-primary shadow-[0_0_8px_rgba(45,212,191,0.6)]";
      default:
        return "bg-white/5"; // Dark grey for empty
    }
  };

  return (
    <Card className="p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white">Workout Activity</h3>

        {/* Legend */}
        <div className="flex items-center gap-2 text-xs text-muted">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-full bg-white/5"></div>
            <div className="w-3 h-3 rounded-full bg-primary/30"></div>
            <div className="w-3 h-3 rounded-full bg-primary/50"></div>
            <div className="w-3 h-3 rounded-full bg-primary/80"></div>
            <div className="w-3 h-3 rounded-full bg-primary"></div>
          </div>
          <span>More</span>
        </div>
      </div>

      {/* The Grid Graph */}
      <div className="flex-1 flex gap-1.5 overflow-x-auto pb-2 scrollbar-hide">
        {/* Row Labels (Mon, Wed, Fri, Sun) */}
        <div className="flex flex-col justify-between py-1 text-[10px] text-muted font-medium pr-2">
          <span>Mon</span>
          <span>Wed</span>
          <span>Fri</span>
          <span>Sun</span>
        </div>

        {/* The Dots Grid */}
        <div className="flex gap-1.5">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1.5">
              {week.map((level, dayIndex) => (
                <div
                  key={dayIndex}
                  className={`w-3 h-3 rounded-full transition-all hover:scale-125 cursor-pointer ${getColor(
                    level
                  )}`}
                  title={`Activity Level: ${level}`}
                ></div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
