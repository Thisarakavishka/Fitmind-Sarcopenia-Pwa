import { Card } from "../../../components/ui/Card";
import { Icons } from "../../../components/ui/Icon";

export default function ProfilePage() {
  const menuItems = [
    { name: "Edit Profile", icon: Icons.Profile },
    { name: "Fitness Goals", icon: Icons.Workout }, // Using workout icon as placeholder
    { name: "Settings", icon: Icons.Profile },
  ];

  return (
    <div className="space-y-8">
      {/* Header Profile */}
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-surface border-2 border-primary flex items-center justify-center">
          <Icons.Profile size={40} className="text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Thisara</h1>
          <p className="text-muted text-sm">
            Intermediate • <span className="text-primary">Strength</span>
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="flex flex-col items-center justify-center p-3 py-4">
          <span className="text-2xl font-bold text-white">48</span>
          <span className="text-[10px] text-muted uppercase tracking-wider mt-1">
            Workouts
          </span>
        </Card>
        <Card className="flex flex-col items-center justify-center p-3 py-4 bg-primary/10 border-primary/20">
          <span className="text-2xl font-bold text-primary">12</span>
          <span className="text-[10px] text-muted uppercase tracking-wider mt-1">
            Streak
          </span>
        </Card>
        <Card className="flex flex-col items-center justify-center p-3 py-4">
          <span className="text-2xl font-bold text-white">70kg</span>
          <span className="text-[10px] text-muted uppercase tracking-wider mt-1">
            Weight
          </span>
        </Card>
      </div>

      {/* Menu List */}
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-muted ml-1">General</h3>
        <Card className="p-0 overflow-hidden">
          {menuItems.map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 border-b border-white/5 last:border-0 hover:bg-white/5 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <item.icon size={18} className="text-muted" />
                <span className="text-sm text-white">{item.name}</span>
              </div>
              <span className="text-muted">›</span>
            </div>
          ))}
        </Card>

        <button className="w-full py-4 text-red-500 text-sm font-bold mt-6 border border-red-500/20 rounded-xl hover:bg-red-500/10 transition-colors">
          Log Out
        </button>
      </div>
    </div>
  );
}
