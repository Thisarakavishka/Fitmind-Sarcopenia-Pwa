"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../../lib/supabase/client";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { ExerciseManagerModal } from "../template/components/ExerciseManagerModal"; 

export default function ExercisesPage() {
  const supabase = createClient();
  const [exercises, setExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch Exercises
  const fetchLibrary = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("exercise_library")
      .select("*")
      .order("name", { ascending: true });

    if (data) setExercises(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchLibrary();
  }, []);

  // Filter Logic
  const filtered =
    filter === "ALL"
      ? exercises
      : exercises.filter((e) => e.target_muscle === filter);

  // Unique Muscles for Filter Tabs
  const muscleGroups = [
    "ALL",
    ...Array.from(new Set(exercises.map((e) => e.target_muscle))),
  ];

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto px-5 pb-24 md:px-8">
      
      {/* 1. HEADER */}
      <div className="mt-2">
        <h1 className="text-2xl font-bold text-white truncate">
          Manage Exercises
        </h1>
        <p className="text-xs text-muted truncate">
          Library of standard movements
        </p>
      </div>

      <div className="h-px w-full bg-white/10" />

      {/* 2. DESKTOP ACTION (Hidden on Mobile) */}
      <div className="hidden md:flex w-full justify-end">
        <Button
          onClick={() => setIsModalOpen(true)}
          className="h-10 text-xs px-6 font-bold bg-primary text-black hover:bg-primary/80"
        >
          + Add New Exercise
        </Button>
      </div>

      {/* 3. FILTERS */}
      <div className="-mx-5 w-[90vw] overflow-x-auto no-scrollbar md:mx-0 md:w-full">
        <div className="flex gap-2 px-5 w-max md:w-full md:px-0 md:flex-wrap">
          {muscleGroups.map((m) => (
            <button
              key={m}
              onClick={() => setFilter(m)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                filter === m
                  ? "bg-primary text-black border-primary"
                  : "bg-white/5 text-muted border-white/5 hover:bg-white/10"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* 4. GRID LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {loading ? (
          [1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />
          ))
        ) : filtered.length === 0 ? (
          <p className="text-muted text-sm col-span-full text-center py-10">
            No exercises found.
          </p>
        ) : (
          filtered.map((ex) => (
            <Card
              key={ex.id}
              className="p-4 flex items-center justify-between border-white/5 hover:border-primary/20 bg-surface group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-lg border border-white/5">
                  {ex.target_muscle === "Chest"
                    ? "💪"
                    : ex.target_muscle === "Legs"
                    ? "🦵"
                    : "⚡"}
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">{ex.name}</h3>
                  <p className="text-[10px] text-primary uppercase tracking-wider">
                    {ex.target_muscle}
                  </p>
                </div>
              </div>
              <button className="text-muted/50 hover:text-white px-2 transition-colors">⋮</button>
            </Card>
          ))
        )}
      </div>

      {/* 5. MOBILE FLOATING ACTION BUTTON (FAB) */}
      {/* md:hidden = Only show on mobile
          fixed bottom-24 right-5 = Positioned bottom right (above bottom nav)
          rounded-full = Makes it a circle
      */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="md:hidden fixed bottom-24 right-4 w-10 h-10 bg-primary text-black rounded-full shadow-[0_4px_20px_rgba(45,212,191,0.5)] flex items-center justify-center text-l font-light z-50 active:scale-90 transition-transform"
      >
        +
      </button>

      {/* MODAL */}
      <ExerciseManagerModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          fetchLibrary(); // Refresh the list when modal closes
        }}
      />
    </div>
  );
}