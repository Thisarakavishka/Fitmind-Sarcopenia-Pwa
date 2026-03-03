"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../../lib/supabase/client";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { CreateTemplateModal } from "./components/CreateTemplateModal";
import { ExerciseManagerModal } from "./components/ExerciseManagerModal"; // Import the DB Modal

export default function TemplatePage() {
  const supabase = createClient();
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);

  // Fetch Data
  const fetchTemplates = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("workout_templates")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setTemplates(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  // Filter Logic
  const filteredTemplates =
    filter === "ALL" ? templates : templates.filter((t) => t.ai_tag === filter);

  return (
    // 1. ROOT CONTAINER
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto px-5 pb-24 md:px-8">
      {/* SECTION 1: HEADER (Title Only) */}
      <div className="mt-2">
        <h1 className="text-2xl font-bold text-white truncate">Library</h1>
        <p className="text-xs text-muted truncate">
          Manage AI Workouts & Exercises
        </p>
      </div>

      {/* SECTION 2: DIVIDER LINE */}
      <div className="h-px w-full bg-white/10" />

      {/* SECTION 3: ACTION BUTTONS (Flex Row) */}
      <div className="flex gap-3 w-full">
        {/* Database Button (Flex-1 makes it stretch on mobile if needed) */}
        <Button
          onClick={() => setIsExerciseModalOpen(true)}
          variant="ghost"
          className="flex-1 md:flex-none h-10 text-xs px-4 font-bold text-muted hover:text-white border border-white/10 bg-white/5"
        >
          Exercises
        </Button>

        {/* New Template Button */}
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          variant="secondary"
          className="flex-1 md:flex-none h-10 text-xs px-4 font-bold bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
        >
          + Template
        </Button>
      </div>

      {/* SECTION 4: SCROLLABLE FILTERS (Preserved Mobile Fix) */}
      <div className="-mx-5 w-[90vw] overflow-x-auto no-scrollbar md:mx-0 md:w-full">
        <div className="flex gap-2 px-5 w-max md:w-full md:px-0 md:flex-wrap">
          {[
            { id: "ALL", label: "All" },
            { id: "Silver_Mobility", label: "👴 Silver" },
            { id: "Low_Impact_Burn", label: "🔥 Burn" },
            { id: "Hypertrophy_Builder", label: "💪 Muscle" },
            { id: "Athlete_Performance", label: "⚡ Athlete" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                filter === tab.id
                  ? "bg-primary text-black border-primary shadow-[0_0_10px_rgba(45,212,191,0.3)]"
                  : "bg-white/5 text-muted border-white/5 hover:bg-white/10"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* SECTION 5: CONTENT GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 bg-white/5 rounded-2xl animate-pulse"
            />
          ))
        ) : filteredTemplates.length === 0 ? (
          <div className="col-span-full py-12 text-center border border-dashed border-white/10 rounded-2xl bg-white/5">
            <p className="text-muted text-sm mb-3">No templates found.</p>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs"
              onClick={() => setIsCreateModalOpen(true)}
            >
              Create First
            </Button>
          </div>
        ) : (
          filteredTemplates.map((t) => (
            <Card
              key={t.id}
              className="w-full relative overflow-hidden cursor-pointer group hover:border-primary/50 transition-all active:scale-[0.98] bg-gradient-to-br from-surface to-[#161b1d] border-white/5 p-4 rounded-2xl shadow-sm"
            >
              <div className="flex flex-col h-full justify-between gap-3">
                <div className="flex justify-between items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] uppercase tracking-wider text-muted font-bold block mb-1 truncate">
                      {t.ai_tag ? t.ai_tag.split("_")[0] : "General"}
                    </span>
                    <h3 className="text-lg font-bold text-white truncate leading-tight">
                      {t.name}
                    </h3>
                  </div>
                  <span
                    className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
                      t.intensity === "High"
                        ? "bg-red-500/10 text-red-400 border-red-500/20"
                        : t.intensity === "Low"
                        ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                        : "bg-white/10 text-muted border-white/10"
                    }`}
                  >
                    {t.intensity}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-muted/80 pt-3 border-t border-white/5">
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span>🏋️</span> {t.exercises?.length || 0} Ex
                  </div>
                  <div className="flex items-center gap-1.5 ml-auto text-primary/80 shrink-0">
                    <span>
                      {t.ai_tag?.includes("Silver")
                        ? "👴"
                        : t.ai_tag?.includes("Athlete")
                        ? "⚡"
                        : "💪"}
                    </span>
                    <span className="text-[10px] font-bold">AI Plan</span>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* MODALS */}
      <CreateTemplateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchTemplates}
      />

      <ExerciseManagerModal
        isOpen={isExerciseModalOpen}
        onClose={() => setIsExerciseModalOpen(false)}
      />
    </div>
  );
}
