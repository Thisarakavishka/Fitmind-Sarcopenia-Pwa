"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../../lib/supabase/client";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { CreateTemplateModal } from "./components/CreateTemplateModal"; // Import the modal

export default function AdminDashboard() {
  const supabase = createClient();
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // State for the modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Function to load data
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

  return (
    <div className="space-y-8 pb-20">
      {/* 1. Header with Create Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Workout Library</h1>
          <p className="text-muted">Manage AI templates and logic</p>
        </div>

        {/* Opens the Modal */}
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="w-full md:w-auto bg-primary text-black font-bold shadow-[0_0_20px_rgba(45,212,191,0.3)]"
        >
          + New Template
        </Button>
      </div>

      {/* 2. Grid of Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <p className="text-muted text-sm animate-pulse">Loading library...</p>
        ) : templates.length === 0 ? (
          <div className="col-span-full py-16 text-center border border-dashed border-white/10 rounded-xl bg-white/5">
            <p className="text-muted mb-4">No templates found.</p>
            <Button
              variant="outline"
              onClick={() => setIsCreateModalOpen(true)}
            >
              Create your first one
            </Button>
          </div>
        ) : (
          templates.map((t) => (
            <Card
              key={t.id}
              className="group relative p-6 border-white/10 bg-surface hover:border-primary/50 transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-white/5 rounded-lg text-2xl">
                  {t.name.toLowerCase().includes("leg")
                    ? "🦵"
                    : t.name.toLowerCase().includes("push")
                    ? "💪"
                    : "⚡"}
                </div>
                <div className="px-2 py-1 rounded bg-black/40 border border-white/5 text-[10px] uppercase font-bold text-muted">
                  {t.intensity}
                </div>
              </div>

              <h3 className="text-lg font-bold text-white mb-1 truncate">
                {t.name}
              </h3>
              <p className="text-sm text-muted mb-4">{t.focus}</p>

              <div className="flex items-center gap-2 text-xs text-muted/50 border-t border-white/5 pt-4">
                <span>{t.exercises?.length || 0} Exercises</span>
              </div>

              {/* Edit/Delete Actions (Hover) */}
              <div className="absolute top-4 right-4 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <button className="p-2 hover:bg-white/10 rounded-full text-white transition-colors">
                  ✏️
                </button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* 3. THE MODAL COMPONENT */}
      <CreateTemplateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchTemplates} // Refreshes the list automatically
      />
    </div>
  );
}
