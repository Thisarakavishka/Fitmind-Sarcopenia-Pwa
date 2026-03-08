"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../../lib/supabase/client";
import { Card } from "../../../components/shared/Card";
import { Button } from "../../../components/shared/Button";
import { calculateNutritionExpert } from "../../../lib/ai/nutritionExpert";
import { Search } from "lucide-react";

const PAGE_SIZE = 5; // Loads 5 items at a time for fast rendering

export default function NutritionPage() {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<"monitor" | "explore">("monitor");
  const [data, setData] = useState<any>(null);

  // 🌟 REFACTORED: Lazy Loading & Search States
  const [foodLibrary, setFoodLibrary] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingFoods, setIsLoadingFoods] = useState(false);

  // Logging States
  const [selectedFood, setSelectedFood] = useState<any>(null);
  const [gramsConsumed, setGramsConsumed] = useState<number>(100);
  const [isLogging, setIsLogging] = useState(false);

  // 1. Fetch User Data (Only runs once)
  const fetchUserData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    const { data: logs } = await supabase
      .from("meal_logs")
      .select("*")
      .eq("user_id", user.id);
    if (profile) setData(calculateNutritionExpert(profile, logs || []));
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  // 2. 🌟 SYSTEM OPTIMIZATION: Paginated Food Fetching
  const fetchFoods = async (reset = false) => {
    setIsLoadingFoods(true);
    const currentPage = reset ? 0 : page;
    const from = currentPage * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = supabase
      .from("food_library")
      .select("*", { count: "exact" })
      .order("name");

    // Apply search filter if exists
    if (searchQuery) query = query.ilike("name", `%${searchQuery}%`);

    const { data: library, count } = await query.range(from, to);

    if (library) {
      if (reset) {
        setFoodLibrary(library);
      } else {
        setFoodLibrary((prev) => [...prev, ...library]);
      }
      setHasMore(count !== null ? from + library.length < count : false);
      setPage(reset ? 1 : currentPage + 1);
    }
    setIsLoadingFoods(false);
  };

  // 3. 🌟 SYSTEM OPTIMIZATION: Debounced Search (waits 300ms after user stops typing)
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchFoods(true); // Reset to page 0 on new search
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // 4. Log Meal to Database
  const handleLogMeal = async () => {
    if (!selectedFood) return;
    setIsLogging(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const multiplier = gramsConsumed / 100;
      await supabase.from("meal_logs").insert({
        user_id: user.id,
        food_id: selectedFood.id,
        food_name: selectedFood.name,
        grams_consumed: gramsConsumed,
        protein_earned: selectedFood.protein_per_100g * multiplier,
        calories_earned: selectedFood.calories_per_100g * multiplier,
      });
      setSelectedFood(null);
      setGramsConsumed(100);
      await fetchUserData(); // Refresh progress bars
      setActiveTab("monitor");
    }
    setIsLogging(false);
  };

  if (!data)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="w-full min-h-screen bg-transparent pb-32 pt-10 px-6 md:px-10 font-sans antialiased text-white relative">
      {/* 🌟 REFACTORED: Compact Mobile-Friendly Popup */}
      {selectedFood && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-[300px] p-5 bg-[#0a0a0a] border-primary/30 shadow-[0_0_40px_rgba(208,255,0,0.1)]">
            <div className="flex justify-between items-start mb-4">
              <div className="pr-4">
                <h3 className="text-sm font-black uppercase tracking-tight text-white leading-tight">
                  {selectedFood.name}
                </h3>
                <p className="text-[9px] text-primary font-bold uppercase tracking-widest mt-1">
                  Log Intake
                </p>
              </div>
              <button
                onClick={() => setSelectedFood(null)}
                className="text-white/40 hover:text-white text-lg w-6 h-6 flex items-center justify-center bg-white/5 rounded-full"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[8px] font-black text-white/40 uppercase tracking-widest ml-1">
                  Portion (Grams)
                </label>
                <input
                  type="number"
                  value={gramsConsumed}
                  onChange={(e) => setGramsConsumed(Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-lg font-black text-white outline-none focus:border-primary/50 text-center transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 p-3 bg-white/5 rounded-xl border border-white/5">
                <div className="text-center border-r border-white/5">
                  <p className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-0.5">
                    Protein
                  </p>
                  <p className="text-lg font-black text-primary">
                    {(
                      (selectedFood.protein_per_100g / 100) *
                      gramsConsumed
                    ).toFixed(1)}
                    g
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-0.5">
                    Calories
                  </p>
                  <p className="text-lg font-black text-white">
                    {Math.round(
                      (selectedFood.calories_per_100g / 100) * gramsConsumed,
                    )}
                  </p>
                </div>
              </div>

              <Button
                onClick={handleLogMeal}
                disabled={isLogging}
                className="w-full h-12 bg-primary text-black font-black uppercase tracking-widest text-[10px] rounded-xl hover:scale-[1.02] transition-transform"
              >
                {isLogging ? "Saving..." : "Log Data"}
              </Button>
            </div>
          </Card>
        </div>
      )}

      <div className="max-w-3xl mx-auto space-y-8">
        {/* HEADER */}
        <header className="flex justify-between items-center border-b border-white/5 pb-6 gap-4">
          {/* Added min-w-0 to allow proper sizing, and whitespace-nowrap to prevent line breaks */}
          <div className="min-w-0">
            <h1 className="text-xl md:text-2xl font-black tracking-tight whitespace-nowrap">
              Nutrition <span className="text-primary">Library</span>
            </h1>
            {/* Truncate the subtitle so it fades out with "..." if the screen is super small instead of breaking */}
            <p className="text-[10px] md:text-[10px] text-white/40 font-bold uppercase tracking-[0.2em] mt-1 truncate">
              Nutrion & Foods
            </p>
          </div>

          {/* Added shrink-0 so the buttons never get crushed by the text */}
          <div className="bg-white/5 p-1 rounded-xl flex gap-1 shrink-0">
            <button
              onClick={() => setActiveTab("monitor")}
              className={`px-3 py-2 md:px-4 text-[9px] font-black uppercase rounded-lg transition-all ${activeTab === "monitor" ? "bg-primary text-black" : "text-white/40"}`}
            >
              Monitor
            </button>
            <button
              onClick={() => setActiveTab("explore")}
              className={`px-3 py-2 md:px-4 text-[9px] font-black uppercase rounded-lg transition-all ${activeTab === "explore" ? "bg-primary text-black" : "text-white/40"}`}
            >
              Explore
            </button>
          </div>
        </header>

        {activeTab === "monitor" ? (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* PROGRESS TRACKERS (Same as before) */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-6 bg-[#0a0a0a] border-white/5 relative overflow-hidden">
                <p className="text-[9px] font-black text-white/20 uppercase mb-2">
                  Protein Intake
                </p>
                <h3 className="text-3xl font-black text-primary italic">
                  {Math.round(data.currentProtein)}g{" "}
                  <span className="text-xs text-white/20 not-italic">
                    / {data.proteinTarget}g
                  </span>
                </h3>
                <div
                  className="absolute bottom-0 left-0 h-1 bg-primary transition-all duration-1000 shadow-[0_0_15px_rgba(208,255,0,0.5)]"
                  style={{
                    width: `${Math.min((data.currentProtein / data.proteinTarget) * 100, 100)}%`,
                  }}
                />
              </Card>
              <Card className="p-6 bg-[#0a0a0a] border-white/5 relative overflow-hidden">
                <p className="text-[9px] font-black text-white/20 uppercase mb-2">
                  Calories
                </p>
                <h3 className="text-3xl font-black text-white italic">
                  {Math.round(data.currentCalories)}{" "}
                  <span className="text-xs text-white/20 not-italic">
                    / {data.calorieTarget}
                  </span>
                </h3>
                <div
                  className="absolute bottom-0 left-0 h-1 bg-white/20 transition-all duration-1000"
                  style={{
                    width: `${Math.min((data.currentCalories / data.calorieTarget) * 100, 100)}%`,
                  }}
                />
              </Card>
            </div>

            {/* EXPERT RECOMMENDATIONS */}
            <div className="space-y-3">
              <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em]">
                Expert Logic Insights
              </p>
              {data.recommendations.map((rec: any, i: number) => (
                <Card
                  key={i}
                  className="p-5 bg-[#0a0a0a] border-white/5 flex gap-5 items-start"
                >
                  <span className="text-2xl mt-1">{rec.icon}</span>
                  <div>
                    <h4 className="text-[10px] font-black text-primary uppercase tracking-widest">
                      {rec.title}
                    </h4>
                    <p className="text-[12px] text-white/60 font-medium italic mt-1 leading-relaxed">
                      "{rec.text}"
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in duration-500">
            <p className="text-[9px] font-black text-primary uppercase tracking-[0.4em]">
              Sarcopenia-Safe Food Library
            </p>

            {/* 🌟 REFACTORED: Search Bar */}
            <div className="relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-white/30">
                <Search size={16} />
              </div>
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-white outline-none focus:border-primary/50 transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 gap-3">
              {foodLibrary.map((food) => (
                <Card
                  key={food.id}
                  className="p-4 bg-white/5 border-white/5 flex justify-between items-center hover:bg-white/10 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#0a0a0a] border border-white/5 flex items-center justify-center text-xl shadow-inner shrink-0">
                      {food.is_omega3_rich
                        ? "🐟"
                        : food.is_leucine_rich
                          ? "🥩"
                          : "🥣"}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold uppercase text-white">
                        {food.name}
                      </h4>
                      <div className="flex gap-1.5 mt-1">
                        {food.is_leucine_rich && (
                          <span className="text-[7px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-black uppercase tracking-widest">
                            Leucine
                          </span>
                        )}
                        {food.is_omega3_rich && (
                          <span className="text-[7px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full font-black uppercase tracking-widest">
                            Omega-3
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedFood(food)}
                    className="w-10 h-10 shrink-0 rounded-xl bg-white/5 text-white/50 font-black flex items-center justify-center hover:bg-primary hover:text-black transition-colors"
                  >
                    +
                  </button>
                </Card>
              ))}
            </div>

            {/* 🌟 REFACTORED: Lazy Loading "Load More" Button */}
            {hasMore && (
              <Button
                onClick={() => fetchFoods()}
                disabled={isLoadingFoods}
                className="w-full h-12 bg-transparent border border-white/10 text-white/50 font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-white/5 hover:text-white transition-all"
              >
                {isLoadingFoods ? "Loading..." : "Load More"}
              </Button>
            )}
            {!hasMore && foodLibrary.length > 0 && (
              <p className="text-center text-[9px] font-black text-white/20 uppercase tracking-widest pt-4">
                Refresh
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
