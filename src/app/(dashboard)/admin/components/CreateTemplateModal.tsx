"use client";

import { useState } from "react";
import { createClient } from "../../../../lib/supabase/client";
import { Button } from "../../../../components/ui/Button";
import { Card } from "../../../../components/ui/Card";
import { Icons } from "../../../../components/ui/Icon"; 
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

interface CreateTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void; // Trigger refresh after saving
}

export function CreateTemplateModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateTemplateModalProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  // --- TEMPLATE STATE ---
  const [name, setName] = useState("");
  const [focus, setFocus] = useState("");
  const [intensity, setIntensity] = useState("Medium");
  const [exercises, setExercises] = useState<Exercise[]>([]);

  // --- EXERCISE BUILDER STATE ---
  const [exName, setExName] = useState("");
  const [exIsSuperSet, setExIsSuperSet] = useState(false);
  const [currentSets, setCurrentSets] = useState<WorkoutSet[]>([]);

  const [setReps, setSetReps] = useState("");
  const [setType, setSetType] = useState<WorkoutSet["type"]>("normal");

  // --- HELPERS ---
  const addSetToDraft = () => {
    if (!setReps) return;
    setCurrentSets([...currentSets, { reps: setReps, type: setType }]);
    setSetReps("");
    setSetType("normal");
  };

  const saveExercise = () => {
    if (!exName || currentSets.length === 0) {
      alert("Please add a name and at least one set.");
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

  const removeExercise = (id: string) => {
    setExercises(exercises.filter((e) => e.id !== id));
  };

  const handleSubmit = async () => {
    if (!name || exercises.length === 0) {
      alert("Template needs a name and exercises.");
      return;
    }
    setLoading(true);

    const { error } = await supabase.from("workout_templates").insert({
      name,
      focus,
      intensity,
      exercises,
      is_premium: false,
    });

    if (error) {
      alert("Error: " + error.message);
    } else {
      onSuccess(); // Tell parent to refresh
      onClose(); // Close modal
      // Reset Form
      setName("");
      setFocus("");
      setExercises([]);
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    // OVERLAY
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      {/* CARD CONTAINER */}
      <div className="w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* HEADER */}
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-surface">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-primary text-xl">+</span> New Template
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full hover:bg-white/10"
          >
            ✕
          </Button>
        </div>

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {/* 1. Details Section */}
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-muted uppercase">
                Template Name
              </label>
              <input
                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white font-bold focus:border-primary focus:outline-none"
                placeholder="e.g. Chest Destruction"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-muted uppercase">
                  Focus
                </label>
                <input
                  className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-primary outline-none"
                  placeholder="Strength"
                  value={focus}
                  onChange={(e) => setFocus(e.target.value)}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted uppercase">
                  Intensity
                </label>
                <select
                  className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-primary outline-none"
                  value={intensity}
                  onChange={(e) => setIntensity(e.target.value)}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>
          </div>

          <hr className="border-white/10" />

          {/* 2. Exercise Preview (Pills) */}
          {exercises.length > 0 && (
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted uppercase">
                Preview
              </label>
              {exercises.map((ex, i) => (
                <Card
                  key={ex.id}
                  className={`p-3 border-white/10 bg-surface flex flex-col gap-2 relative ${
                    ex.isSuperSet ? "border-l-4 border-l-primary" : ""
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold text-white">
                        {i + 1}
                      </span>
                      <span className="font-bold text-white text-sm">
                        {ex.name}
                      </span>
                      {ex.isSuperSet && (
                        <span className="text-[10px] bg-primary/20 text-primary px-1.5 rounded uppercase font-bold">
                          SuperSet
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => removeExercise(ex.id)}
                      className="text-muted hover:text-red-500"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 pl-9">
                    {ex.sets.map((s, idx) => (
                      <span
                        key={idx}
                        className={`text-[10px] px-2 py-0.5 rounded border ${
                          s.type === "drop"
                            ? "border-red-500/30 text-red-500"
                            : "border-white/10 text-muted"
                        }`}
                      >
                        {s.reps} {s.type === "drop" ? "🔥" : "reps"}
                      </span>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* 3. Add Exercise Form */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-4">
            <div className="flex justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Add Exercise
              </h3>
              <button
                onClick={() => setExIsSuperSet(!exIsSuperSet)}
                className={`text-[10px] px-2 py-1 rounded border transition-colors ${
                  exIsSuperSet
                    ? "bg-primary text-black border-primary font-bold"
                    : "text-muted border-white/10"
                }`}
              >
                SuperSet {exIsSuperSet ? "ON" : "OFF"}
              </button>
            </div>

            <input
              className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-primary outline-none"
              placeholder="Exercise Name..."
              value={exName}
              onChange={(e) => setExName(e.target.value)}
            />

            {/* Sets Row */}
            <div className="flex gap-2">
              <input
                type="number"
                className="w-20 bg-black/40 border border-white/10 rounded-lg p-2 text-center text-sm text-white focus:border-primary outline-none"
                placeholder="Reps"
                value={setReps}
                onChange={(e) => setSetReps(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addSetToDraft()}
              />
              <select
                className="flex-1 bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-white focus:border-primary outline-none"
                value={setType}
                onChange={(e) => setSetType(e.target.value as any)}
              >
                <option value="normal">Normal</option>
                <option value="warmup">Warmup</option>
                <option value="drop">Drop Set</option>
                <option value="failure">Failure</option>
              </select>
              <Button size="sm" onClick={addSetToDraft}>
                +
              </Button>
            </div>

            {/* Draft Sets List */}
            {currentSets.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {currentSets.map((s, i) => (
                  <span
                    key={i}
                    className="text-[10px] bg-black/40 px-2 py-1 rounded text-white border border-white/10"
                  >
                    #{i + 1}: {s.reps} ({s.type})
                  </span>
                ))}
                <span
                  onClick={() => setCurrentSets([])}
                  className="text-[10px] text-red-500 cursor-pointer underline self-center"
                >
                  Clear
                </span>
              </div>
            )}

            <Button
              onClick={saveExercise}
              className="w-full bg-white text-black font-bold hover:bg-gray-200"
            >
              Add to List ↓
            </Button>
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="p-4 border-t border-white/10 bg-surface flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full md:w-auto px-8 font-bold"
          >
            {loading ? "Saving..." : "Save Template"}
          </Button>
        </div>
      </div>
    </div>
  );
}
