"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../../../lib/supabase/client";
import { Button } from "../../../../components/shared/Button";

export function ExerciseManagerModal({ isOpen, onClose, onSuccess, exercise }: any) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", target_muscle: "", category: "Strength", 
    equipment: "", description: "", has_ai_model: false, ai_model_path: ""
  });

  useEffect(() => {
    if (exercise) setForm(exercise);
    else {
      setForm({ name: "", target_muscle: "", category: "Strength", equipment: "", description: "", has_ai_model: false, ai_model_path: "" });
    }
  }, [exercise, isOpen]);

  const handleSubmit = async () => {
    setLoading(true);
    const { error } = exercise 
      ? await supabase.from("exercise_library").update(form).eq("id", exercise.id)
      : await supabase.from("exercise_library").insert(form);
    
    if (error) console.error("Database Error:", error.message);
    else { onSuccess(); onClose(); }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!confirm("Confirm permanent removal?")) return;
    const { error } = await supabase.from("exercise_library").delete().eq("id", exercise.id);
    if (!error) { onSuccess(); onClose(); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-2xl bg-[#0f0f0f] border border-white/10 rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        
        {/* CLEAN MODAL HEADER */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-surface/50">
          <div>
            <h2 className="text-xl font-bold text-white">{exercise ? 'Edit Protocol' : 'New Protocol'}</h2>
            <p className="text-xs text-muted">Biomechanics Unit / Database Entry</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-muted transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* FORM BODY */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted uppercase tracking-wider block ml-1">Movement Name</label>
              <input 
                value={form.name} 
                onChange={e => setForm({...form, name: e.target.value})} 
                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-primary/50 outline-none transition-all" 
                placeholder="e.g. Lateral Raise" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted uppercase tracking-wider block ml-1">Target Anatomy</label>
              <input 
                value={form.target_muscle} 
                onChange={e => setForm({...form, target_muscle: e.target.value})} 
                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-white focus:border-primary/50 outline-none transition-all" 
                placeholder="e.g. Deltoids" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-muted uppercase tracking-wider block ml-1">Clinical Description</label>
            <textarea 
              value={form.description} 
              onChange={e => setForm({...form, description: e.target.value})} 
              className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-white h-28 focus:border-primary/50 outline-none transition-all resize-none" 
              placeholder="Describe biomechanics for Sarcopenia prevention..."
            />
          </div>

          <div className={`p-5 rounded-2xl border transition-all ${form.has_ai_model ? 'bg-primary/5 border-primary/20' : 'bg-white/5 border-white/10'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${form.has_ai_model ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-white/5 border-white/10 text-white/20'}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Neural Vision Sync</p>
                  <p className="text-[10px] text-muted uppercase tracking-widest mt-0.5">Skeleton Mapping Protocol</p>
                </div>
              </div>
              <input 
                type="checkbox" 
                checked={form.has_ai_model} 
                onChange={e => setForm({...form, has_ai_model: e.target.checked})} 
                className="w-5 h-5 accent-primary"
              />
            </div>

            {form.has_ai_model && (
              <div className="mt-4 space-y-2 animate-in slide-in-from-top-2">
                <label className="text-[9px] font-bold text-primary uppercase tracking-widest ml-1">Model Path</label>
                <input 
                  value={form.ai_model_path} 
                  onChange={e => setForm({...form, ai_model_path: e.target.value})} 
                  className="w-full bg-black/60 border border-primary/20 rounded-xl p-3 text-xs font-mono text-primary outline-none" 
                  placeholder="/models/vision/protocol_01.json" 
                />
              </div>
            )}
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="p-6 border-t border-white/10 bg-surface/50 flex justify-between items-center">
          <button 
            onClick={handleDelete} 
            className="text-[10px] font-bold text-red-500/50 hover:text-red-500 uppercase tracking-widest transition-colors"
          >
            {exercise ? 'Delete permanent' : ''}
          </button>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={onClose} className="text-xs font-bold">Cancel</Button>
            <Button 
              onClick={handleSubmit} 
              disabled={loading} 
              className="px-8 h-12 bg-primary text-black font-bold text-xs rounded-xl shadow-lg hover:scale-[1.02] transition-all"
            >
              {loading ? "Syncing..." : "Save Protocol"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}