"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "../../../lib/supabase/client";
import { Button } from "../../../components/shared/Button";
import { Card } from "../../../components/shared/Card";
import { predictWorkoutPlan } from "../../../lib/ai/scheduler";
import { generateScheduleInDB } from "../../../lib/ai/templateBuilder";

export default function ProfilePage() {
  const supabase = createClient();
  const [isAdmin, setIsAdmin] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [editData, setEditData] = useState({
    weight_kg: 0,
    height_cm: 0,
    age: 0,
    target_goal: "",
    pain_level: "",
    experience_level: "",
  });

  useEffect(() => {
    async function getProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        if (data) {
          setProfile(data);
          setEditData({
            weight_kg: data.weight_kg,
            height_cm: data.height_cm,
            age: data.age,
            target_goal: data.target_goal,
            pain_level: data.pain_level,
            experience_level: data.experience_level,
          });
          if (data.role === "admin") setIsAdmin(true);
        }
      }
    }
    getProfile();
  }, []);

  const handleUpdate = async () => {
    setIsSaving(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("profiles")
        .update(editData)
        .eq("id", user.id);
      if (error) throw error;

      if (
        editData.target_goal !== profile.target_goal ||
        editData.pain_level !== profile.pain_level
      ) {
        const newTag = await predictWorkoutPlan({
          age: editData.age,
          weight: editData.weight_kg,
          height: editData.height_cm,
          gender: profile.gender,
          experience: editData.experience_level,
          pain_level: editData.pain_level,
          goal: editData.target_goal,
        });
        await supabase
          .from("workout_plans")
          .update({ is_active: false })
          .eq("user_id", user.id);
        await generateScheduleInDB(user.id, newTag);
      }
      setProfile({ ...profile, ...editData });
      setIsEditing(false);
    } catch (e) {
      alert("System Update Error");
    } finally {
      setIsSaving(false);
    }
  };

  const bmi = profile
    ? (profile.weight_kg / Math.pow(profile.height_cm / 100, 2)).toFixed(1)
    : "0";

  if (!profile)
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="w-full min-h-screen bg-transparent pb-32 pt-10 px-6 md:px-10 font-sans antialiased text-white">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* IDENTITY HEADER */}
        <header className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-[2rem] bg-primary flex items-center justify-center text-black font-black text-2xl shadow-2xl shadow-primary/20">
            {profile.email?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              {profile.full_name}
            </h1>
            <p className="text-[10px] text-white/40 font-medium uppercase tracking-widest">
              {profile.email}
            </p>
          </div>
        </header>

        <div className="space-y-4">
          <hr className="border-white/5" />

          {/* 🌟 REFACTORED EDIT ACTION: Pencil icon aligned under HR */}
          <div className="flex justify-end px-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                isEditing
                  ? "text-red-500 bg-red-500/10"
                  : "text-primary bg-primary/10 hover:bg-primary/20"
              }`}
            >
              <span>{isEditing ? "✕ Cancel" : "✎ Edit Bio"}</span>
            </button>
          </div>
        </div>

        {/* CLINICAL SUMMARY */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-5 bg-[#0a0a0a]/60 border-white/5 backdrop-blur-xl">
            <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">
              Body Mass Index
            </p>
            <p className="text-2xl font-black text-white italic">{bmi}</p>
            <p className="text-[8px] font-bold text-primary uppercase mt-1">
              Status: {parseFloat(bmi) < 25 ? "Normal" : "High"}
            </p>
          </Card>
          <Card className="p-5 bg-[#0a0a0a]/60 border-white/5 backdrop-blur-xl">
            <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">
              Active Goal
            </p>
            <p className="text-xs font-bold text-white uppercase mt-2 truncate">
              {profile.target_goal.replace(/_/g, " ")}
            </p>
          </Card>
        </div>

        {/* DATA FIELDS */}
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-white/20 uppercase tracking-widest ml-1">
                Age
              </label>
              <input
                disabled={!isEditing}
                type="number"
                value={editData.age}
                onChange={(e) =>
                  setEditData({ ...editData, age: Number(e.target.value) })
                }
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold text-white focus:border-primary/50 outline-none disabled:opacity-30"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-white/20 uppercase tracking-widest ml-1">
                Weight (KG)
              </label>
              <input
                disabled={!isEditing}
                type="number"
                value={editData.weight_kg}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    weight_kg: Number(e.target.value),
                  })
                }
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold text-white focus:border-primary/50 outline-none disabled:opacity-30"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black text-white/20 uppercase tracking-widest ml-1">
              Clinical Goal
            </label>
            <select
              disabled={!isEditing}
              value={editData.target_goal}
              onChange={(e) =>
                setEditData({ ...editData, target_goal: e.target.value })
              }
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-bold text-white outline-none appearance-none disabled:opacity-30"
            >
              <option value="muscle">Building Muscle</option>
              <option value="weight_loss">Weight Loss</option>
              <option value="sarcopenia_prevention">
                Sarcopenia Prevention
              </option>
            </select>
          </div>

          {isEditing && (
            <Button
              onClick={handleUpdate}
              disabled={isSaving}
              className="w-full h-14 bg-primary text-black font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-2xl shadow-primary/20"
            >
              {isSaving ? "UPDATING SYSTEM..." : "CONFIRM CHANGES"}
            </Button>
          )}
        </div>

        {/* LOGS */}
        <div className="space-y-3 pt-4">
          <p className="text-[9px] font-black text-white/10 uppercase tracking-[0.4em]">
            Historical Data
          </p>
          <Link href="/history">
            <Card className="p-5 bg-white/5 border-white/5 flex justify-between items-center hover:bg-white/10 transition-all group">
              <div className="flex items-center gap-4">
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-white uppercase">
                    Activity Logs
                  </span>
                  <span className="text-[9px] text-white/30 uppercase">
                    Track Accuracy Trends
                  </span>
                </div>
              </div>
              <span className="text-primary font-bold">→</span>
            </Card>
          </Link>
        </div>

        {/* ADMIN TOOLS */}
        {isAdmin && (
          <div className="pt-6 border-t border-white/5 grid grid-cols-2 gap-3">
            <Link
              href="/template"
              className="p-4 rounded-xl border border-primary/20 bg-primary/5 text-[9px] font-bold text-center text-white uppercase tracking-widest"
            >
              Templates
            </Link>
            <Link
              href="/exercises"
              className="p-4 rounded-xl border border-primary/20 bg-primary/5 text-[9px] font-bold text-center text-white uppercase tracking-widest"
            >
              Exercises
            </Link>
            <Link
              href="/foods"
              className="p-4 rounded-xl border border-primary/20 bg-primary/5 text-[9px] font-bold text-center text-primary uppercase tracking-widest hover:bg-primary/10 transition-colors"
            >
              Food Library
            </Link>
          </div>
        )}

        {/* LOGOUT */}
        <Button
          variant="ghost"
          className="w-full h-14 text-red-500 font-black uppercase tracking-[0.3em] text-[10px] border border-red-500/10 rounded-2xl hover:bg-red-500/5 mt-6"
          onClick={async () => {
            await supabase.auth.signOut();
            window.location.href = "/login";
          }}
        >
          Logout Account
        </Button>
      </div>
    </div>
  );
}
