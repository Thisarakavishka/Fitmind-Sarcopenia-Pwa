"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "../../../lib/supabase/client";
import { Button } from "../../../components/shared/Button";
import { Card } from "../../../components/shared/Card";
import { ExerciseManagerModal } from "./components/ExerciseManagerModal";

const PAGE_SIZE = 12;

export default function ExercisesPage() {
  const supabase = createClient();
  const [exercises, setExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL"); // ALL, NEURAL, NEW
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<any>(null);

  // Fetch Exercises with Pagination
  const fetchLibrary = useCallback(
    async (isInitial = false) => {
      if (isInitial) {
        setLoading(true);
        setPage(0);
      } else {
        setLoadingMore(true);
      }

      const currentPage = isInitial ? 0 : page;
      const from = currentPage * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      let query = supabase
        .from("exercise_library")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false }) // Recently added first
        .range(from, to);

      // Apply specific filters if not "ALL"
      if (filter === "NEURAL") query = query.eq("has_ai_model", true);

      const { data, count, error } = await query;

      if (!error && data) {
        setExercises((prev) => (isInitial ? data : [...prev, ...data]));
        setHasMore(count ? from + data.length < count : false);
      }

      setLoading(false);
      setLoadingMore(false);
    },
    [supabase, page, filter],
  );

  useEffect(() => {
    fetchLibrary(true);
  }, [filter]); // Re-fetch when filter category changes

  const loadMore = () => {
    setPage((prev) => prev + 1);
  };

  useEffect(() => {
    if (page > 0) fetchLibrary();
  }, [page]);

  // Client-side search (refined)
  const filtered = exercises.filter(
    (ex) =>
      ex.name.toLowerCase().includes(search.toLowerCase()) ||
      ex.target_muscle?.toLowerCase().includes(search.toLowerCase()),
  );

  // Helper to check if "Recently Added" (within 48 hours)
  const isRecent = (dateString: string) => {
    const created = new Date(dateString).getTime();
    const now = new Date().getTime();
    return now - created < 48 * 60 * 60 * 1000;
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto px-5 pb-24 md:px-8">
      {/* HEADER */}
      <div className="mt-2">
        <h1 className="text-2xl font-bold text-white">Exercises Management</h1>
        <p className="text-xs text-muted">
          Biomechanics & Skeleton Mapping Database
        </p>
      </div>

      <div className="h-px w-full bg-white/10" />

      {/* SEARCH BAR */}
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
          placeholder="Filter movements by name or anatomy..."
          className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 pl-12 text-sm text-white placeholder:text-white/20 focus:border-primary/20 outline-none transition-all"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* ACTION & FILTER ROW */}
      <div className="flex flex-wrap items-center gap-3">
        <Button
          onClick={() => {
            setSelectedExercise(null);
            setIsModalOpen(true);
          }}
          className="h-10 text-xs px-6 font-bold bg-primary text-black hover:bg-primary/90 rounded-xl"
        >
          + Exercise
        </Button>

        <div className="h-6 w-px bg-white/10 hidden sm:block" />

        <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
          {[
            { id: "ALL", label: "All" },
            { id: "NEURAL", label: "Neural Active" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setFilter(t.id)}
              className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${
                filter === t.id
                  ? "bg-white/10 text-white"
                  : "text-white/30 hover:text-white/60"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* GRID LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3">
        {loading
          ? // Initial Loading Skeletons
            Array(8)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="h-24 bg-white/5 rounded-2xl animate-pulse border border-white/5"
                />
              ))
          : filtered.map((ex) => (
              <Card
                key={ex.id}
                onClick={() => {
                  setSelectedExercise(ex);
                  setIsModalOpen(true);
                }}
                className="group relative bg-[#0c0c0c] border-white/5 hover:border-primary/40 p-4 rounded-2xl transition-all cursor-pointer overflow-hidden h-24 flex items-center gap-4"
              >
                {/* 1. COMPACT ICON AREA */}
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-primary/5 group-hover:border-primary/30 transition-all duration-300">
                  <svg
                    className={`w-5 h-5 transition-colors duration-300 ${ex.has_ai_model ? "text-primary" : "text-white/20"}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                    />
                  </svg>
                </div>

                {/* 2. TEXT CONTENT */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className="text-[13px] font-bold text-white group-hover:text-primary transition-colors truncate pr-2 uppercase tracking-tight">
                      {ex.name}
                    </h3>

                    {/* Compact Status Badges */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {isRecent(ex.created_at) && (
                        <span className="text-[7px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          New
                        </span>
                      )}
                      {ex.has_ai_model && (
                        <div className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-40"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary shadow-[0_0_8px_rgba(208,255,0,0.8)]"></span>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-[10px] text-white/30 font-bold uppercase tracking-[0.2em] mt-1 truncate">
                    {ex.target_muscle || "General Anatomy"}
                  </p>
                </div>

                {/* 3. INTERACTIVE OVERLAY (Edit Hint) */}
                <div className="absolute top-1 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg
                    className="w-3 h-3 text-white/10"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                </div>
              </Card>
            ))}
      </div>

      {/* 4. LOAD MORE BUTTON (Triggers database fetch for next PAGE_SIZE) */}
      {hasMore && (
        <div className="flex justify-center pt-10 pb-12">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="group relative flex items-center gap-3 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/[0.08] hover:border-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingMore ? (
              <>
                <div className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                  Fetching...
                </span>
              </>
            ) : (
              <>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 group-hover:text-white transition-colors">
                  Load More
                </span>
                <svg
                  className="w-3 h-3 text-white/20 group-hover:text-primary group-hover:translate-y-0.5 transition-all"
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
              </>
            )}
          </button>
        </div>
      )}

      <ExerciseManagerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => fetchLibrary(true)}
        exercise={selectedExercise}
      />
    </div>
  );
}
