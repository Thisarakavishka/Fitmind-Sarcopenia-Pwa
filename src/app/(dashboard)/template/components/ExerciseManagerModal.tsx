"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../../../lib/supabase/client";
import { Button } from "../../../../components/ui/Button";
import { Card } from "../../../../components/ui/Card";
import { Icons } from "../../../../components/ui/Icon"; // Ensure you have a trash icon or standard X

export function ExerciseManagerModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const supabase = createClient();
  const [exercises, setExercises] = useState<any[]>([]);
  const [newExercise, setNewExercise] = useState("");
  const [muscle, setMuscle] = useState("General");
  const [loading, setLoading] = useState(false);

  // Fetch Library
  const fetchLibrary = async () => {
    const { data } = await supabase
      .from("exercise_library")
      .select("*")
      .order("name");
    if (data) setExercises(data);
  };

  useEffect(() => {
    if (isOpen) fetchLibrary();
  }, [isOpen]);

  // Add Exercise
  const handleAdd = async () => {
    if (!newExercise) return;
    setLoading(true);
    const { error } = await supabase.from("exercise_library").insert({
      name: newExercise,
      target_muscle: muscle,
    });

    if (error) {
      alert("Error: " + error.message);
    } else {
      setNewExercise("");
      fetchLibrary(); // Refresh list
    }
    setLoading(false);
  };

  // Delete Exercise
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this exercise?")) return;
    await supabase.from("exercise_library").delete().eq("id", id);
    fetchLibrary();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="w-full max-w-lg bg-[#0f0f0f] border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex justify-between items-center bg-surface">
          <h2 className="text-lg font-bold text-white">Exercise Database</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        </div>

        {/* List (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-5 space-y-2">
          {exercises.length === 0 ? (
            <p className="text-center text-muted text-sm py-10">
              No exercises yet.
            </p>
          ) : (
            exercises.map((ex) => (
              <div
                key={ex.id}
                className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/5"
              >
                <div>
                  <h4 className="font-bold text-sm text-white">{ex.name}</h4>
                  <span className="text-[10px] text-primary uppercase tracking-wider">
                    {ex.target_muscle}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(ex.id)}
                  className="text-muted hover:text-red-500 transition-colors p-2"
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>

        {/* Add New Footer */}
        <div className="p-5 border-t border-white/10 bg-surface space-y-3">
          <p className="text-[10px] font-bold text-muted uppercase">
            Add New Exercise
          </p>
          <div className="flex gap-2">
            <input
              className="flex-1 bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-white focus:border-primary outline-none"
              placeholder="Exercise Name (e.g. Bench Press)"
              value={newExercise}
              onChange={(e) => setNewExercise(e.target.value)}
            />
            <select
              className="bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-white focus:border-primary outline-none"
              value={muscle}
              onChange={(e) => setMuscle(e.target.value)}
            >
              <option>Chest</option>
              <option>Back</option>
              <option>Legs</option>
              <option>Arms</option>
              <option>Core</option>
              <option>Cardio</option>
            </select>
          </div>
          <Button
            onClick={handleAdd}
            disabled={loading}
            className="w-full bg-primary text-black font-bold"
          >
            {loading ? "Saving..." : "+ Add to Library"}
          </Button>
        </div>
      </div>
    </div>
  );
}
