"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { useUserStore } from "../../lib/store/userStore";
import { predictWorkoutPlan } from "../../lib/ai/scheduler";
import { generateScheduleInDB } from "../../lib/ai/templateBuilder";

type Gender = "male" | "female";
type Goal = "muscle" | "weight_loss" | "sarcopenia_prevention";
type Level = "beginner" | "intermediate" | "advanced";
type Pain = "none" | "mild_joint_pain" | "severe_mobility_issues";

interface OnboardingData {
  age: string;
  weight: string;
  height: string;
  gender: Gender;
  goal: Goal;
  level: Level;
  pain_level: Pain;
}

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const { setUserData } = useUserStore();

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<OnboardingData>({
    age: "",
    weight: "",
    height: "",
    gender: "male",
    goal: "muscle",
    level: "beginner",
    pain_level: "none",
  });

  const updateField = (field: keyof OnboardingData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = async () => {
    if (step === 1) {
      if (!formData.age || !formData.weight || !formData.height) {
        alert("Please fill in all fields.");
        return;
      }
      setStep(2);
      return;
    }

    if (step === 2) {
      setStep(3);
      return;
    }

    if (step === 3) {
      setIsLoading(true);

      try {
        const ageNum = parseInt(formData.age);
        const weightNum = parseInt(formData.weight);
        const heightNum = parseInt(formData.height);

        // 1. For AI Prediction we sending all 6 inputs to the ONNX model!
        const aiTag = await predictWorkoutPlan({
          age: ageNum,
          weight: weightNum,
          height: heightNum,
          gender: formData.gender,
          experience: formData.level,
          pain_level: formData.pain_level,
          goal: formData.goal,
        });

        // 2. Save to Zustand
        setUserData({
          age: ageNum,
          weight: weightNum,
          height: heightNum,
          goal: formData.goal,
          level: formData.level,
        });

        // 3. Update Supabase (Using UPSERT to prevent missing row errors)
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { error } = await supabase.from("profiles").upsert({
            id: user.id,
            email: user.email,
            is_onboarded: true,
            age: ageNum,
            weight_kg: weightNum,
            height_cm: heightNum,
            gender: formData.gender,
            target_goal: formData.goal,
            experience_level: formData.level,
            pain_level: formData.pain_level,
            ai_plan_tag: aiTag, // 🌟 Save the AI Tag to the profile!
          });

          if (error) throw error;

          // 🌟 NEW: Build the physical schedule in the database!
          console.log(`Building ${aiTag} schedule in database...`);
          await generateScheduleInDB(user.id, aiTag);
        }

        router.refresh();
        router.push("/home");
      } catch (error) {
        console.error("Onboarding Error:", error);
        alert("Failed to save profile. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm mb-6 flex gap-1.5">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              step >= s ? "bg-primary" : "bg-white/10"
            }`}
          />
        ))}
      </div>

      <Card className="w-full max-w-sm p-5 border-white/10 bg-surface shadow-2xl">
        {/* --- STEP 1: BIO-METRICS --- */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-2">
            <div className="text-center mb-2">
              <h2 className="text-xl font-bold text-white">Bio-Metrics</h2>
              <p className="text-muted text-xs mt-0.5">
                Required for AI Safety.
              </p>
            </div>

            <div className="bg-black/20 p-1 rounded-lg flex gap-1 mb-2">
              {["male", "female"].map((g) => (
                <button
                  key={g}
                  onClick={() => updateField("gender", g)}
                  className={`flex-1 py-2 rounded-md text-sm font-bold capitalize transition-all ${
                    formData.gender === g
                      ? "bg-primary text-black shadow-lg"
                      : "text-muted hover:text-white"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted uppercase tracking-wider">
                  Age
                </label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => updateField("age", e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-lg p-2.5 text-white text-base font-bold text-center focus:border-primary focus:outline-none"
                  placeholder="55"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted uppercase tracking-wider">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => updateField("weight", e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-lg p-2.5 text-white text-base font-bold text-center focus:border-primary focus:outline-none"
                  placeholder="70"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted uppercase tracking-wider">
                Height (cm)
              </label>
              <input
                type="number"
                value={formData.height}
                onChange={(e) => updateField("height", e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-lg p-2.5 text-white text-base font-bold text-center focus:border-primary focus:outline-none"
                placeholder="175"
              />
            </div>
          </div>
        )}

        {/* --- STEP 2: GOALS --- */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-2">
            <div className="text-center mb-2">
              <h2 className="text-xl font-bold text-white">Main Goal?</h2>
              <p className="text-muted text-xs">Tailors the intensity.</p>
            </div>
            <div className="space-y-2">
              {[
                {
                  id: "muscle",
                  label: "Build Muscle",
                  icon: "💪",
                  desc: "Hypertrophy",
                },
                {
                  id: "weight_loss",
                  label: "Lose Weight",
                  icon: "🔥",
                  desc: "High Burn",
                },
                {
                  id: "sarcopenia_prevention",
                  label: "Healthy Aging",
                  icon: "🩺",
                  desc: "Mobility",
                },
              ].map((goal) => (
                <div
                  key={goal.id}
                  onClick={() => updateField("goal", goal.id)}
                  className={`p-3 rounded-xl border cursor-pointer flex items-center gap-3 transition-all ${
                    formData.goal === goal.id
                      ? "bg-primary/10 border-primary"
                      : "bg-black/20 border-white/10 hover:bg-white/5"
                  }`}
                >
                  <div className="text-xl">{goal.icon}</div>
                  <div className="flex-1">
                    <h3
                      className={`text-sm font-bold ${formData.goal === goal.id ? "text-primary" : "text-white"}`}
                    >
                      {goal.label}
                    </h3>
                    <p className="text-[10px] text-muted">{goal.desc}</p>
                  </div>
                  {formData.goal === goal.id && (
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- STEP 3: EXPERIENCE & PAIN LEVEL --- */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-2">
            <div className="text-center mb-2">
              <h2 className="text-xl font-bold text-white">Safety Check</h2>
              <p className="text-muted text-xs">
                Crucial for AI plan generation.
              </p>
            </div>

            {/* Experience Selection */}
            <div className="space-y-2 mb-4">
              <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">
                Fitness Level
              </label>
              {[
                { id: "beginner", label: "Beginner", desc: "Just starting" },
                {
                  id: "intermediate",
                  label: "Intermediate",
                  desc: "6mo - 2yrs",
                },
              ].map((lvl) => (
                <div
                  key={lvl.id}
                  onClick={() => updateField("level", lvl.id)}
                  className={`p-2.5 rounded-xl border cursor-pointer flex justify-between items-center transition-all ${
                    formData.level === lvl.id
                      ? "bg-primary/10 border-primary"
                      : "bg-black/20 border-white/10 hover:bg-white/5"
                  }`}
                >
                  <span className="text-sm font-bold text-white capitalize">
                    {lvl.label}
                  </span>
                  <span className="text-[10px] text-muted">{lvl.desc}</span>
                </div>
              ))}
            </div>

            {/* Pain Level Selection (NEW) */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">
                Current Joint Pain?
              </label>
              {[
                { id: "none", label: "None", desc: "I feel great" },
                {
                  id: "mild_joint_pain",
                  label: "Mild Pain",
                  desc: "Aching knees/back",
                },
                {
                  id: "severe_mobility_issues",
                  label: "Severe",
                  desc: "Limited mobility",
                },
              ].map((pain) => (
                <div
                  key={pain.id}
                  onClick={() => updateField("pain_level", pain.id)}
                  className={`p-2.5 rounded-xl border cursor-pointer flex justify-between items-center transition-all ${
                    formData.pain_level === pain.id
                      ? "bg-red-500/10 border-red-500"
                      : "bg-black/20 border-white/10 hover:bg-white/5"
                  }`}
                >
                  <span
                    className={`text-sm font-bold capitalize ${formData.pain_level === pain.id ? "text-red-400" : "text-white"}`}
                  >
                    {pain.label}
                  </span>
                  <span className="text-[10px] text-muted">{pain.desc}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <Button
          onClick={handleNext}
          disabled={isLoading}
          className="w-full mt-6 bg-primary text-black font-bold h-10 text-sm shadow-lg hover:shadow-primary/20 transition-all"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              Thinking... <span className="animate-spin text-xs">⏳</span>
            </span>
          ) : step === 3 ? (
            "GENERATE PLAN ✨"
          ) : (
            "CONTINUE"
          )}
        </Button>
      </Card>
    </div>
  );
}
