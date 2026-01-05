import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";

export default function NutritionPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Nutrition</h1>
        <Button variant="secondary" className="h-8 text-xs px-3">
          Log Meal
        </Button>
      </div>

      {/* Water Tracker */}
      <Card className="bg-gradient-to-br from-blue-900/20 to-surface border-blue-500/20">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-white font-bold">Water Intake</h3>
            <p className="text-blue-400 text-xs">5 of 8 glasses</p>
          </div>
          <Button className="h-8 bg-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white text-xs">
            + Add
          </Button>
        </div>
        <div className="flex justify-between gap-1">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className={`h-12 flex-1 rounded-full ${
                i < 5
                  ? "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                  : "bg-white/5"
              }`}
            ></div>
          ))}
        </div>
      </Card>

      {/* Macro Progress */}
      <Card className="space-y-5 p-5">
        <h3 className="font-bold text-white">Daily Macros</h3>

        {/* Calories */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted">
            <span>Calories</span>
            <span>1450 / 2200 kcal</span>
          </div>
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
            <div className="h-full w-[65%] bg-orange-500 rounded-full"></div>
          </div>
        </div>

        {/* Protein */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted">
            <span>Protein</span>
            <span>85 / 140 g</span>
          </div>
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
            <div className="h-full w-[60%] bg-red-500 rounded-full"></div>
          </div>
        </div>

        {/* Carbs */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted">
            <span>Carbs</span>
            <span>120 / 250 g</span>
          </div>
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
            <div className="h-full w-[45%] bg-blue-500 rounded-full"></div>
          </div>
        </div>
      </Card>
    </div>
  );
}
