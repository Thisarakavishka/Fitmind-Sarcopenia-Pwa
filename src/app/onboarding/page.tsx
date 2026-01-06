"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { useUserStore } from "../../lib/store/userStore";
// import { predictWorkoutPlan } from "../../features/schedule/utils/predictPlan"; // <--- You will uncomment this later

export default function OnboardingPage() {
  const router = useRouter();
  const setUserData = useUserStore((state) => state.setUserData);

  // Track which step the user is on (1, 2, or 3)
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Local state to hold answers before saving
  const [formData, setFormData] = useState({
    age: "",
    weight: "",
    height: "",
    goal: "muscle", // Default value
    level: "beginner", // Default value
  });

  // Helper to update specific fields
  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = async () => {
    // --- VALIDATION LOGIC ---

    // Step 1: Check Body Stats
    if (step === 1) {
      if (!formData.age || !formData.weight || !formData.height) {
        alert("Please fill in all fields to continue.");
        return;
      }
      const ageNum = parseInt(formData.age);
      if (ageNum < 10 || ageNum > 100) {
        alert("Please enter a valid age (10-100).");
        return;
      }
      // If valid, go to next step
      setStep(2);
      return;
    }

    // Step 2: Goal (Always has a default, so just proceed)
    if (step === 2) {
      setStep(3);
      return;
    }

    // Step 3: Final Submission
    if (step === 3) {
      setIsLoading(true);

      // 1. Format the data for storage
      const finalData = {
        age: parseInt(formData.age),
        weight: parseInt(formData.weight),
        height: parseInt(formData.height),
        goal: formData.goal as
          | "muscle"
          | "weight_loss"
          | "sarcopenia_prevention",
        level: formData.level as "beginner" | "intermediate" | "advanced",
      };

      // 2. Save to Global Store (Zustand)
      setUserData(finalData);

      // 3. (FUTURE) Call AI Model Here
      try {
        console.log("🤖 AI Generative Model Running...");
        // const schedule = await predictWorkoutPlan(finalData);
        // setUserData({ recommendedPlan: schedule }); // Save AI result to store

        // Simulate a small delay for "AI Thinking" effect
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // 4. Redirect to Dashboard
        router.push("/home");
      } catch (error) {
        console.error("Error generating plan:", error);
        alert("Something went wrong. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
      {/* 1. Progress Bar */}
      <div className="w-full max-w-md mb-8 flex gap-2">
        <div
          className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
            step >= 1 ? "bg-primary" : "bg-white/10"
          }`}
        />
        <div
          className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
            step >= 2 ? "bg-primary" : "bg-white/10"
          }`}
        />
        <div
          className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
            step >= 3 ? "bg-primary" : "bg-white/10"
          }`}
        />
      </div>

      {/* 2. Main Card */}
      <Card className="w-full max-w-md p-6 border-white/10 bg-surface">
        {/* STEP 1: Body Stats */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white">
                Let's get your stats
              </h2>
              <p className="text-muted text-sm mt-1">
                We use this to calculate your metabolic rate.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted uppercase">
                  Age
                </label>
                <input
                  type="number"
                  placeholder="25"
                  value={formData.age}
                  onChange={(e) => updateField("age", e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white text-lg font-bold text-center focus:border-primary focus:outline-none transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted uppercase">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  placeholder="70"
                  value={formData.weight}
                  onChange={(e) => updateField("weight", e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white text-lg font-bold text-center focus:border-primary focus:outline-none transition-colors"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted uppercase">
                Height (cm)
              </label>
              <input
                type="number"
                placeholder="175"
                value={formData.height}
                onChange={(e) => updateField("height", e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white text-lg font-bold text-center focus:border-primary focus:outline-none transition-colors"
              />
            </div>
          </div>
        )}

        {/* STEP 2: Goal Selection */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white">
                What's your main goal?
              </h2>
              <p className="text-muted text-sm mt-1">
                We will tailor the intensity for you.
              </p>
            </div>

            <div className="space-y-3">
              {[
                {
                  id: "muscle",
                  label: "Build Muscle",
                  icon: "💪",
                  desc: "Hypertrophy & Strength",
                },
                {
                  id: "weight_loss",
                  label: "Lose Weight",
                  icon: "🔥",
                  desc: "High Intensity Cardio",
                },
                {
                  id: "sarcopenia_prevention",
                  label: "Healthy Aging (40+)",
                  icon: "🩺",
                  desc: "Mobility & Balance",
                },
              ].map((goal) => (
                <div
                  key={goal.id}
                  onClick={() => updateField("goal", goal.id)}
                  className={`p-4 rounded-xl border cursor-pointer flex items-center gap-4 transition-all hover:scale-[1.02] active:scale-[0.98] ${
                    formData.goal === goal.id
                      ? "bg-primary/10 border-primary shadow-[0_0_15px_rgba(45,212,191,0.2)]"
                      : "bg-black/20 border-white/10 hover:bg-white/5"
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center text-2xl">
                    {goal.icon}
                  </div>
                  <div>
                    <h3
                      className={`font-bold ${
                        formData.goal === goal.id
                          ? "text-primary"
                          : "text-white"
                      }`}
                    >
                      {goal.label}
                    </h3>
                    <p className="text-xs text-muted">{goal.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3: Experience Level */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white">
                Experience Level
              </h2>
              <p className="text-muted text-sm mt-1">
                Be honest, we won't judge!
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {[
                { id: "beginner", label: "Beginner", desc: "New to fitness" },
                {
                  id: "intermediate",
                  label: "Intermediate",
                  desc: "Train 1-2 times a week",
                },
                {
                  id: "advanced",
                  label: "Advanced",
                  desc: "Training for years",
                },
              ].map((lvl) => (
                <div
                  key={lvl.id}
                  onClick={() => updateField("level", lvl.id)}
                  className={`p-4 rounded-xl border cursor-pointer flex justify-between items-center transition-all ${
                    formData.level === lvl.id
                      ? "bg-primary/10 border-primary"
                      : "bg-black/20 border-white/10 hover:bg-white/5"
                  }`}
                >
                  <span className="capitalize font-bold text-white">
                    {lvl.label}
                  </span>
                  <span className="text-xs text-muted">{lvl.desc}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Button */}
        <Button
          onClick={handleNext}
          disabled={isLoading}
          className="w-full mt-8 bg-primary text-black font-bold h-12 text-lg shadow-[0_0_20px_rgba(45,212,191,0.3)] hover:shadow-[0_0_30px_rgba(45,212,191,0.5)] transition-all"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              Generating... <span className="animate-spin">⏳</span>
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
