"use client";

import { useState } from "react";
import { createClient } from "../../../../lib/supabase/client";
import { Button } from "../../../../components/ui/Button";
import { Card } from "../../../../components/ui/Card";

// --- TYPES ---
type WorkoutSet = {
  reps: string;
  type: "normal" | "warmup" | "drop" | "failure";
};

type Exercise = {
  id: string;
  name: string;
  sets: WorkoutSet[];
  isSuperSet: boolean;
};

// Must match your scheduler.ts logic!
const AI_TAGS = [
  { id: "Silver_Mobility", label: "👴 Silver (Seniors)" },
  { id: "Low_Impact_Burn", label: "🔥 Low Impact (Obese)" },
  { id: "Hypertrophy_Builder", label: "💪 Hypertrophy (Standard)" },
  { id: "Athlete_Performance", label: "⚡ Athlete (Pro)" },
];

interface CreateTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateTemplateModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateTemplateModalProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  // --- FORM STATE ---
  const [name, setName] = useState("");
  const [focus, setFocus] = useState("");
  const [intensity, setIntensity] = useState("Medium");
  const [aiTag, setAiTag] = useState("Hypertrophy_Builder");
  const [exercises, setExercises] = useState<Exercise[]>([]);

  // --- EXERCISE BUILDER ---
  const [exName, setExName] = useState("");
  const [exIsSuperSet, setExIsSuperSet] = useState(false);
  const [currentSets, setCurrentSets] = useState<WorkoutSet[]>([]);
  const [setReps, setSetReps] = useState("");
  const [setType, setSetType] = useState<WorkoutSet["type"]>("normal");

  // --- ACTIONS ---
  const addSetToDraft = () => {
    if (!setReps) return;
    setCurrentSets([...currentSets, { reps: setReps, type: setType }]);
    setSetReps("");
    setSetType("normal");
  };

  const saveExercise = () => {
    if (!exName || currentSets.length === 0) {
      alert("Add at least one set.");
      return;
    }
    const newEx: Exercise = {
      id: crypto.randomUUID(),
      name: exName,
      sets: currentSets,
      isSuperSet: exIsSuperSet,
    };
    setExercises([...exercises, newEx]);
    setExName("");
    setExIsSuperSet(false);
    setCurrentSets([]);
  };

  const handleSubmit = async () => {
    if (!name || exercises.length === 0) return;
    setLoading(true);

    const { error } = await supabase.from("workout_templates").insert({
      name,
      focus,
      intensity,
      exercises,
      ai_tag: aiTag, // IMPORTANT: Saves to the new column
      is_premium: false,
    });

    if (error) {
      alert(error.message);
    } else {
      onSuccess();
      onClose();
      // Reset
      setName("");
      setFocus("");
      setExercises([]);
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-2xl bg-[#0f0f0f] border border-white/10 rounded-3xl shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-surface/50">
          <div>
            <h2 className="text-xl font-bold text-white">New Template</h2>
            <p className="text-xs text-muted">Add to the AI Library</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-muted transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Form */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Section 1: Metadata */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-muted uppercase tracking-wider mb-2 block">
                Template Name
              </label>
              <input
                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white font-bold focus:border-primary focus:outline-none transition-colors"
                placeholder="e.g. Full Body Destruction"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-muted uppercase tracking-wider mb-2 block">
                  Focus
                </label>
                <input
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-primary outline-none"
                  placeholder="Hypertrophy"
                  value={focus}
                  onChange={(e) => setFocus(e.target.value)}
                />
              </div>

              {/* AI Tag Selector */}
              <div className="col-span-2">
                <label className="text-xs font-bold text-primary uppercase tracking-wider mb-2 block">
                  Target Audience (AI Tag)
                </label>
                <select
                  className="w-full bg-primary/5 border border-primary/20 rounded-xl p-3 text-sm text-primary font-bold focus:border-primary outline-none cursor-pointer"
                  value={aiTag}
                  onChange={(e) => setAiTag(e.target.value)}
                >
                  {AI_TAGS.map((tag) => (
                    <option key={tag.id} value={tag.id}>
                      {tag.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="h-px bg-white/5" />

          {/* Section 2: Exercise List */}
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <label className="text-xs font-bold text-muted uppercase tracking-wider">
                Exercise Queue
              </label>
              <span className="text-xs text-muted">
                {exercises.length} added
              </span>
            </div>

            <div className="space-y-2">
              {exercises.map((ex, i) => (
                <div
                  key={ex.id}
                  className="p-4 bg-white/5 rounded-xl border border-white/5 flex justify-between items-center group"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-bold text-white/30">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h4 className="font-bold text-white text-sm">
                        {ex.name}
                      </h4>
                      <p className="text-xs text-muted mt-0.5">
                        {ex.sets.length} sets •{" "}
                        {ex.sets.map((s) => s.reps).join("-")} reps
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      setExercises(exercises.filter((e) => e.id !== ex.id))
                    }
                    className="text-white/20 hover:text-red-500 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              ))}

              {exercises.length === 0 && (
                <div className="p-8 border border-dashed border-white/10 rounded-xl text-center">
                  <p className="text-muted text-sm">No exercises yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Add Exercise Form */}
          <div className="p-5 bg-white/5 rounded-2xl border border-white/5 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-white">Add New Exercise</h3>
            </div>

            <div className="flex gap-3">
              <input
                className="flex-1 bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-primary outline-none"
                placeholder="Exercise Name"
                value={exName}
                onChange={(e) => setExName(e.target.value)}
              />
              <input
                className="w-20 bg-black/40 border border-white/10 rounded-xl p-3 text-center text-sm text-white focus:border-primary outline-none"
                placeholder="Reps"
                value={setReps}
                onChange={(e) => setSetReps(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addSetToDraft()}
              />
              <Button
                size="sm"
                onClick={addSetToDraft}
                className="h-full font-bold text-lg"
              >
                +
              </Button>
            </div>

            {currentSets.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {currentSets.map((s, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 bg-black/40 rounded text-[10px] text-white border border-white/10"
                  >
                    Set {i + 1}: {s.reps}
                  </span>
                ))}
              </div>
            )}

            <Button
              onClick={saveExercise}
              variant="secondary"
              className="w-full font-bold"
            >
              Add to Queue
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 bg-surface/50 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="px-8 font-bold"
          >
            {loading ? "Saving..." : "Save Template"}
          </Button>
        </div>
      </div>
    </div>
  );
}
