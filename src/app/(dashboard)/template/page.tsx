"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "../../../lib/supabase/client";
import { Button } from "../../../components/shared/Button";
import { Card } from "../../../components/shared/Card";
import { CreateTemplateModal } from "./components/CreateTemplateModal";

export default function TemplatePage() {
  const supabase = createClient();
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("workout_templates")
      .select(
        `
        *,
        template_exercises (
          id, day_number, target_sets, target_reps,
          exercise_library ( name, target_muscle, has_ai_model )
        )
      `,
      )
      .order("created_at", { ascending: false });

    if (data) setTemplates(data);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const filtered = templates.filter((t) => {
    const matchesFilter = filter === "ALL" || t.ai_tag === filter;
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto px-5 pb-24 md:px-8 overflow-x-hidden">
      {/* SECTION 1: CLEAN HEADER */}
      <div className="mt-2">
        <h1 className="text-2xl font-bold text-white">Template Library</h1>
        <p className="text-xs text-muted font-medium">
          Master Blueprints for AI Generation
        </p>
      </div>

      <div className="h-px w-full bg-white/10" />

      {/* SECTION 2: SEARCH BAR (Matching Exercises) */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <svg
            className="w-4 h-4 text-white/20"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Filter blueprints..."
          className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 pl-12 text-sm text-white placeholder:text-white/20 focus:border-primary/20 outline-none transition-all"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* SECTION 3: SCROLLABLE ACTION ROW (Button + Filters) */}
      <div className="-mx-5 overflow-x-auto no-scrollbar md:mx-0">
        <div className="flex items-center gap-3 px-5 md:px-0 min-w-max md:min-w-0">
          {/* Main Action Button */}
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="h-10 text-xs px-6 font-bold bg-primary text-black hover:bg-primary/90 rounded-xl shrink-0 shadow-[0_0_15px_rgba(208,255,0,0.1)]"
          >
            + Template
          </Button>

          <div className="h-6 w-px bg-white/10 shrink-0" />

          {/* Filter Group - Contained and Scrollable */}
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/5 overflow-x-auto no-scrollbar max-w-[200px] sm:max-w-xs md:max-w-none">
            <div className="flex flex-nowrap shrink-0">
              {[
                { id: "ALL", label: "All" },
                { id: "Silver_Mobility", label: "👴 Silver" },
                { id: "Low_Impact_Burn", label: "🔥 Burn" },
                { id: "Hypertrophy_Builder", label: "💪 Muscle" },
                { id: "Athlete_Performance", label: "⚡ Athlete" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setFilter(tab.id);
                    setExpandedId(null);
                  }}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all ${
                    filter === tab.id
                      ? "bg-white/10 text-white shadow-sm"
                      : "text-white/30 hover:text-white/60"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: GRID LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3">
        {loading
          ? Array(6)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="h-24 bg-white/5 rounded-2xl animate-pulse"
                />
              ))
          : filtered.map((t) => {
              const isExpanded = expandedId === t.id;
              return (
                <Card
                  key={t.id}
                  onClick={() =>
                    window.innerWidth < 768 &&
                    setExpandedId(isExpanded ? null : t.id)
                  }
                  className={`group relative bg-[#0c0c0c] border-white/5 hover:border-primary/40 p-4 rounded-2xl transition-all cursor-pointer overflow-hidden flex flex-col ${
                    isExpanded ? "min-h-[200px]" : "h-24"
                  } md:h-24`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-primary/5 group-hover:border-primary/30 transition-all duration-300">
                      <svg
                        className="w-5 h-5 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h3 className="text-[13px] font-bold text-white group-hover:text-primary transition-colors truncate pr-2 uppercase tracking-tight">
                          {t.name}
                        </h3>
                        <svg
                          className={`w-3 h-3 text-white/20 transition-transform md:hidden ${isExpanded ? "rotate-180" : ""}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="3"
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                      <p className="text-[10px] text-white/30 font-bold uppercase tracking-[0.2em] mt-1 truncate">
                        {t.ai_tag?.split("_")[0]} • {t.intensity}
                      </p>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-white/5 space-y-2 md:hidden animate-in fade-in slide-in-from-top-2">
                      {t.template_exercises?.map((te: any) => (
                        <div
                          key={te.id}
                          className="flex justify-between items-center text-[10px] uppercase font-bold"
                        >
                          <span className="truncate pr-4 text-white/60">
                            {te.exercise_library?.name}
                          </span>
                          <div className="flex items-center gap-2">
                            {te.exercise_library?.has_ai_model && (
                              <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                            )}
                            <span className="text-primary">
                              {te.target_sets}×{te.target_reps}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              );
            })}
      </div>

      <CreateTemplateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchTemplates}
      />
    </div>
  );
}
