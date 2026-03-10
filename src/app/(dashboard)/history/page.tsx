"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../../lib/supabase/client";
import { Card } from "../../../components/shared/Card";
import { useRouter } from "next/navigation";

export default function HistoryPage() {
  const supabase = createClient();
  const router = useRouter();

  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState({
    avgAccuracy: 0,
    totalSessions: 0,
    consistency: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: historyLogs } = await supabase
        .from("workout_history_logs")
        .select(`*, session_exercises (exercise_library (name))`)
        .eq("user_id", user.id)
        .order("date_completed", { ascending: false });

      if (historyLogs) {
        setLogs(historyLogs);

        // CALCULATE ANALYTICS
        const aiLogs = historyLogs.filter(
          (l) => l.ai_form_accuracy_score !== null,
        );
        const avg =
          aiLogs.length > 0
            ? aiLogs.reduce(
                (acc, curr) => acc + curr.ai_form_accuracy_score,
                0,
              ) / aiLogs.length
            : 0;

        setStats({
          avgAccuracy: Math.round(avg),
          totalSessions: new Set(
            historyLogs.map((l) => l.date_completed.split("T")[0]),
          ).size,
          consistency: Math.min(100, (historyLogs.length / 28) * 100),
        });
      }
      setIsLoading(false);
    }
    fetchHistory();
  }, [supabase]);

  return (
    <div className="w-full min-h-screen bg-transparent pb-32 pt-10 px-6 md:px-10 font-sans antialiased text-white">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* HEADER */}
        <header className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white/40 hover:text-white transition-colors"
          >
            ←
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              Performance <span className="text-primary">History</span>
            </h1>
            <p className="text-[10px] text-white/40 font-medium uppercase tracking-widest">
              Historical Data Analysis
            </p>
          </div>
        </header>

        <hr className="border-white/5" />

        {/* ANALYTICS GRID: Show the results of your AI system */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-4 bg-[#0a0a0a]/60 border-white/5 backdrop-blur-xl text-center">
            <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">
              Avg Accuracy
            </p>
            <p className="text-xl font-black text-primary italic">
              {stats.avgAccuracy}%
            </p>
          </Card>
          <Card className="p-4 bg-[#0a0a0a]/60 border-white/5 backdrop-blur-xl text-center">
            <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">
              Sessions
            </p>
            <p className="text-xl font-black text-white italic">
              {stats.totalSessions}
            </p>
          </Card>
          <Card className="p-4 bg-[#0a0a0a]/60 border-white/5 backdrop-blur-xl text-center">
            <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">
              Compliance
            </p>
            <p className="text-xl font-black text-white italic">
              {Math.round(stats.consistency)}%
            </p>
          </Card>
        </div>

        {/* LOG FEED */}
        <div className="space-y-4">
          <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] ml-1">
            Activity Feed
          </p>

          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : logs.length > 0 ? (
            logs.map((log) => (
              <div key={log.id} className="relative group">
                <div className="absolute left-[19px] top-10 bottom-0 w-px bg-white/5 group-last:hidden" />

                <div className="flex gap-4">
                  <div
                    className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 z-10 ${
                      log.ai_form_accuracy_score
                        ? "bg-primary/10 border-primary/20 text-primary"
                        : "bg-white/5 border-white/10 text-white/20"
                    }`}
                  >
                    {log.ai_form_accuracy_score ? "⚡" : "✓"}
                  </div>

                  <Card className="flex-1 p-4 bg-[#0a0a0a] border-white/5 group-hover:border-white/10 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-tight">
                          {log.session_exercises?.exercise_library?.name ||
                            "Movement Log"}
                        </h3>
                        <p className="text-[9px] font-bold text-white/20 uppercase mt-1">
                          {new Date(log.date_completed).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-white">
                          {log.actual_reps_completed}{" "}
                          <span className="text-[8px] text-white/30">REPS</span>
                        </p>
                        {log.ai_form_accuracy_score && (
                          <span className="text-[8px] font-black text-primary uppercase bg-primary/5 px-2 py-0.5 rounded border border-primary/10 mt-1 inline-block">
                            {log.ai_form_accuracy_score}% Accuracy
                          </span>
                        )}
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center border border-dashed border-white/10 rounded-[2rem] text-white/10 font-bold uppercase text-[10px]">
              No Logs Recorded
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
