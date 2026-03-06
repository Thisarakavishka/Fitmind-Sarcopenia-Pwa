"use client";

import { useState } from "react";
import { createClient } from "../../../../lib/supabase/client";
import { Button } from "../../../../components/shared/Button";

export function CreateTemplateModal({ isOpen, onClose, onSuccess }: any) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [focus, setFocus] = useState("");
  const [intensity, setIntensity] = useState("Medium");
  const [aiTag, setAiTag] = useState("Hypertrophy_Builder");
  const [exercises, setExercises] = useState<any[]>([]);

  // Local Exercise State
  const [exName, setExName] = useState("");
  const [reps, setReps] = useState("");

  const addExercise = () => {
    if (!exName || !reps) return;
    setExercises([...exercises, { id: crypto.randomUUID(), name: exName, reps }]);
    setExName("");
    setReps("");
  };

  const handleSubmit = async () => {
    if (!name || exercises.length === 0) return;
    setLoading(true);

    const { error } = await supabase.from("workout_templates").insert({
      name,
      focus,
      intensity,
      exercises, // Saves as JSONB
      ai_tag: aiTag,
    });

    if (!error) {
      onSuccess();
      onClose();
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4">
      <div className="w-full max-w-xl bg-[#0a0a0a] border border-white/10 rounded-[2rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <h2 className="text-xl font-bold text-white uppercase italic">Blueprint Configuration</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Template Name</label>
              <input value={name} onChange={e => setName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-primary outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">AI Match Tag</label>
              <select value={aiTag} onChange={e => setAiTag(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-primary outline-none cursor-pointer">
                <option value="Silver_Mobility">Silver (Seniors)</option>
                <option value="Hypertrophy_Builder">Hypertrophy (Standard)</option>
              </select>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-white/5">
            <p className="text-[10px] font-black text-primary uppercase tracking-widest ml-1">Assemble Protocol</p>
            <div className="flex gap-2">
              <input value={exName} onChange={e => setExName(e.target.value)} placeholder="Exercise" className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white outline-none" />
              <input value={reps} onChange={e => setReps(e.target.value)} placeholder="Reps" className="w-20 bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white outline-none" />
              <Button onClick={addExercise} className="bg-white/10 text-white font-bold h-12 rounded-xl">+</Button>
            </div>

            <div className="space-y-2">
              {exercises.map((ex) => (
                <div key={ex.id} className="flex justify-between items-center p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                  <span className="text-xs text-white font-bold uppercase italic">{ex.name}</span>
                  <span className="text-[10px] text-primary font-black uppercase tracking-widest">{ex.reps} Reps</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-white/5 flex justify-end gap-3 bg-white/[0.02]">
          <Button onClick={onClose} variant="ghost">Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading} className="bg-primary text-black font-black px-10 rounded-xl">
            {loading ? "SYNCING..." : "DEPLOY TEMPLATE"}
          </Button>
        </div>
      </div>
    </div>
  );
}