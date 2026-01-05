import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Icons } from "../../../components/ui/Icon";

export default function SchedulePage() {
  const dates = [
    { day: "Mon", date: "29", active: false },
    { day: "Tue", date: "30", active: false },
    { day: "Wed", date: "31", active: false },
    { day: "Thu", date: "1", active: false },
    { day: "Fri", date: "2", active: false },
    { day: "Sat", date: "3", active: true }, // Current Day
    { day: "Sun", date: "4", active: false },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Schedule</h1>
        <Button variant="primary" className="h-9 px-4 text-xs">
          <Icons.Workout className="w-4 h-4" /> AI GENERATE
        </Button>
      </div>

      {/* Calendar Strip */}
      <Card className="p-4 bg-black/20 border-white/5">
        <div className="flex justify-between items-center text-white mb-4">
          <span className="text-muted text-sm">This Week</span>
          <span className="text-xs text-primary cursor-pointer">
            View Month
          </span>
        </div>
        <div className="flex justify-between">
          {dates.map((item, index) => (
            <div
              key={index}
              className={`flex flex-col items-center justify-center w-10 h-14 rounded-full text-sm transition-all cursor-pointer ${
                item.active
                  ? "bg-primary text-black font-bold scale-110 shadow-lg shadow-primary/20"
                  : "text-muted hover:bg-white/5"
              }`}
            >
              <span className="text-[10px] opacity-80">{item.day}</span>
              <span className="text-base">{item.date}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Workout List */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white">Workouts</h3>

        {/* Active Workout Item */}
        <Card className="flex items-center gap-4 p-4 hover:border-primary/50 transition-colors cursor-pointer group">
          <div className="w-12 h-12 rounded-full bg-cyan-900/30 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
            <Icons.Workout size={20} />
          </div>
          <div className="flex-1">
            <h4 className="text-white font-bold">Upper Body Strength</h4>
            <p className="text-xs text-muted">45 min • Chest, Back</p>
          </div>
          <div className="w-2 h-2 rounded-full bg-primary"></div>
        </Card>

        {/* Rest Day Item */}
        <Card className="flex items-center gap-4 p-4 opacity-50">
          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-muted">
            <span className="text-xs font-bold">Rest</span>
          </div>
          <div className="flex-1">
            <h4 className="text-white font-bold">Rest Day</h4>
            <p className="text-xs text-muted">Active Recovery</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
