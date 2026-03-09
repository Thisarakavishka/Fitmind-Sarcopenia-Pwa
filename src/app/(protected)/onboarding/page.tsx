"use client";

import { useState, useRef, useEffect, UIEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";
import { useUserStore } from "../../../lib/store/userStore";
import { predictWorkoutPlan } from "../../../lib/ai/scheduler";
import { generateScheduleInDB } from "../../../lib/ai/templateBuilder";
import { Button } from "@/src/components/shared/Button";

type Gender = "male" | "female";
type Goal = "muscle" | "weight_loss" | "sarcopenia_prevention";
type Level = "beginner" | "intermediate" | "advanced";
type Pain = "none" | "mild_joint_pain" | "severe_mobility_issues";

interface OnboardingData {
  age: number;
  weight: number;
  height: number;
  gender: Gender;
  goal: Goal;
  level: Level;
  pain_level: Pain;
}

const ScrollPicker = ({
  min,
  max,
  value,
  onChange,
  unit,
}: {
  min: number;
  max: number;
  value: number;
  onChange: (val: number) => void;
  unit?: string;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const items = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  const ITEM_HEIGHT = 64;

  useEffect(() => {
    if (containerRef.current) {
      const index = value - min;
      containerRef.current.scrollTop = index * ITEM_HEIGHT;
    }
  }, []);

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const index = Math.round(container.scrollTop / ITEM_HEIGHT);
    const newValue = items[index];

    if (newValue && newValue !== value) {
      onChange(newValue);
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(10);
      }
    }
  };

  return (
    <div className="relative h-[192px] w-full max-w-[200px] overflow-hidden mask-image-gradient">
      <div className="absolute top-1/2 left-0 w-full h-[64px] -translate-y-1/2 border-y-2 border-primary/50 bg-primary/5 pointer-events-none" />

      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full w-full overflow-y-auto snap-y snap-mandatory hide-scrollbar relative"
        style={{ scrollBehavior: "smooth" }}
      >
        <div style={{ height: "64px" }} />
        {items.map((item) => (
          <div
            key={item}
            className={`h-[64px] flex items-center justify-center snap-center transition-all duration-200 ${
              value === item
                ? "text-4xl font-black text-primary drop-shadow-[0_0_20px_rgba(208,255,0,0.5)]"
                : "text-2xl font-bold text-white/30"
            }`}
          >
            {item}
            {value === item && unit && (
              <span className="text-sm ml-1 text-primary/70">{unit}</span>
            )}
          </div>
        ))}
        <div style={{ height: "64px" }} />
      </div>
    </div>
  );
};

// --- MAIN PAGE ---
export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const { setUserData } = useUserStore();

  const [step, setStep] = useState(1);

  // 🌟 REPLACED isLoading WITH MULTI-STEP ANIMATION STATE
  const [loadingState, setLoadingState] = useState<
    "idle" | "analyzing" | "predicted" | "generating"
  >("idle");
  const [predictedName, setPredictedName] = useState("");

  const [formData, setFormData] = useState<OnboardingData>({
    gender: "male",
    age: 21,
    weight: 70,
    height: 175,
    goal: "muscle",
    level: "beginner",
    pain_level: "none",
  });

  const TOTAL_STEPS = 6;

  const updateField = <K extends keyof OnboardingData>(
    field: K,
    value: OnboardingData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (typeof navigator !== "undefined" && navigator.vibrate)
      navigator.vibrate(15);
  };

  const handleNext = async () => {
    if (typeof navigator !== "undefined" && navigator.vibrate)
      navigator.vibrate(20);

    if (step < TOTAL_STEPS) {
      setStep(step + 1);
      return;
    }

    // 🌟 1. START ANALYZING ANIMATION
    setLoadingState("analyzing");

    try {
      // Run AI Prediction
      const aiTag = await predictWorkoutPlan({
        age: formData.age,
        weight: formData.weight,
        height: formData.height,
        gender: formData.gender,
        experience: formData.level,
        pain_level: formData.pain_level,
        goal: formData.goal,
      });

      // Format the tag name for the UI (e.g., "Silver_Mobility_Rehab" -> "Silver Mobility Rehab")
      const formattedName = aiTag.replace(/_/g, " ");
      setPredictedName(formattedName);

      // 2. SHOW PREDICTION RESULT & PAUSE FOR 2.5 SECONDS
      setLoadingState("predicted");
      await new Promise((resolve) => setTimeout(resolve, 2500));

      // 3. SHOW GENERATING ANIMATION & SAVE TO DB
      setLoadingState("generating");

      setUserData({
        age: formData.age,
        weight: formData.weight,
        height: formData.height,
        goal: formData.goal,
        level: formData.level,
      });

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { error } = await supabase.from("profiles").upsert({
          id: user.id,
          email: user.email,
          is_onboarded: true,
          age: formData.age,
          weight_kg: formData.weight,
          height_cm: formData.height,
          gender: formData.gender,
          target_goal: formData.goal,
          experience_level: formData.level,
          pain_level: formData.pain_level,
          ai_plan_tag: aiTag,
        });

        if (error) throw error;
        await generateScheduleInDB(user.id, aiTag);
      }

      // Add one tiny pause to make the database creation feel heavy and important
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // 🌟 4. REDIRECT
      router.refresh();
      router.push("/home");
    } catch (error) {
      console.error("Onboarding Error:", error);
      alert("Failed to save profile. Please try again.");
      setLoadingState("idle"); // Reset so they can try again
    }
  };

  // =========================================================================
  // AI LOADING UX OVERRIDE (Hides the form, shows the animation)
  // =========================================================================
  if (loadingState !== "idle") {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="max-w-md w-full space-y-8">
          {/* STEP 1: Analyzing */}
          {loadingState === "analyzing" && (
            <div className="space-y-6 animate-in fade-in zoom-in duration-500">
              <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-white/5" />
                <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl animate-pulse">🧠</span>
                </div>
              </div>
              <div>
                <h2 className="text-xl font-black text-white uppercase tracking-widest">
                  Processing Bio-Data
                </h2>
                <p className="text-white/40 text-xs uppercase tracking-widest mt-2">
                  Running Neural Network...
                </p>
              </div>
            </div>
          )}

          {/* STEP 2: The Prediction Reveal */}
          {loadingState === "predicted" && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-700">
              <div className="w-20 h-20 mx-auto bg-primary/20 rounded-full flex items-center justify-center border border-primary/50 shadow-[0_0_30px_rgba(208,255,0,0.3)]">
                <span className="text-primary text-3xl font-black">✓</span>
              </div>
              <div>
                <p className="text-white/50 text-[10px] font-black uppercase tracking-[0.3em] mb-2">
                  Optimal Workout Plan Found
                </p>
                <h2 className="text-3xl font-black text-primary tracking-tight">
                  {predictedName}
                </h2>
              </div>
            </div>
          )}

          {/* STEP 3: Building the Database */}
          {loadingState === "generating" && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="flex justify-center gap-2">
                <div
                  className="w-2 h-2 bg-primary rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <div
                  className="w-2 h-2 bg-primary rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <div
                  className="w-2 h-2 bg-primary rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Constructing 28-Day Roadmap
                </h2>
                <p className="text-white/40 text-xs uppercase tracking-widest mt-2">
                  Applying Rest-Day Algorithms...
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // NORMAL ONBOARDING FORM
  // =========================================================================
  return (
    <div className="min-h-screen flex flex-col items-center justify-between bg-[#050505] p-6 pb-12 font-sans">
      {/* Header & Progress */}
      <div className="w-full max-w-sm mt-8">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => (step > 1 ? setStep(step - 1) : router.back())}
            className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-white/50 hover:text-white"
          >
            ←
          </button>
          <span className="text-xs font-bold text-white/40 tracking-widest">
            STEP {step} OF {TOTAL_STEPS}
          </span>
          <div className="w-10 h-10" />
        </div>

        {/* Progress Bar */}
        <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
          />
        </div>
      </div>

      {/* Dynamic Content Area */}
      <div className="flex-1 w-full max-w-sm flex flex-col justify-center items-center py-10 animate-in fade-in slide-in-from-bottom-8 duration-500">
        {/* --- STEP 1: GENDER --- */}
        {step === 1 && (
          <div className="w-full text-center space-y-12">
            <div>
              <h1 className="text-3xl font-black text-white mb-2 tracking-tight">
                Tell Us About Yourself
              </h1>
              <p className="text-sm text-white/50 px-4">
                To give you a better experience and results, we need to know
                your gender.
              </p>
            </div>

            <div className="flex flex-col gap-6 items-center">
              {(["male", "female"] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => updateField("gender", g)}
                  className={`w-40 h-40 rounded-full flex flex-col items-center justify-center transition-all duration-300 ${
                    formData.gender === g
                      ? "bg-primary text-black scale-110 shadow-[0_0_30px_rgba(208,255,0,0.3)]"
                      : "bg-white/5 border border-white/10 text-white hover:bg-white/10"
                  }`}
                >
                  <span className="text-4xl mb-2">
                    {g === "male" ? "♂" : "♀"}
                  </span>
                  <span className="font-bold capitalize tracking-widest">
                    {g}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* --- STEP 2: AGE --- */}
        {step === 2 && (
          <div className="w-full text-center flex flex-col h-full justify-between">
            <div>
              <h1 className="text-3xl font-black text-white mb-2 tracking-tight">
                How Old Are You?
              </h1>
              <p className="text-sm text-white/50">
                This helps us personalize an exercise program that suits your
                stage of life.
              </p>
            </div>
            <div className="flex justify-center flex-1 items-center my-8">
              <ScrollPicker
                min={16}
                max={100}
                value={formData.age}
                onChange={(v) => updateField("age", v)}
              />
            </div>
          </div>
        )}

        {/* --- STEP 3: WEIGHT --- */}
        {step === 3 && (
          <div className="w-full text-center flex flex-col h-full justify-between">
            <div>
              <h1 className="text-3xl font-black text-white mb-2 tracking-tight">
                What is Your Weight?
              </h1>
              <p className="text-sm text-white/50">
                Don't worry, you can always change this later in your profile.
              </p>
            </div>
            <div className="flex justify-center flex-1 items-center my-8">
              <ScrollPicker
                min={40}
                max={150}
                value={formData.weight}
                unit="kg"
                onChange={(v) => updateField("weight", v)}
              />
            </div>
          </div>
        )}

        {/* --- STEP 4: HEIGHT --- */}
        {step === 4 && (
          <div className="w-full text-center flex flex-col h-full justify-between">
            <div>
              <h1 className="text-3xl font-black text-white mb-2 tracking-tight">
                What is Your Height?
              </h1>
              <p className="text-sm text-white/50">
                This helps us calculate your BMI and posture accuracy.
              </p>
            </div>
            <div className="flex justify-center flex-1 items-center my-8">
              <ScrollPicker
                min={140}
                max={220}
                value={formData.height}
                unit="cm"
                onChange={(v) => updateField("height", v)}
              />
            </div>
          </div>
        )}

        {/* --- STEP 5: GOAL --- */}
        {step === 5 && (
          <div className="w-full text-center">
            <h1 className="text-3xl font-black text-white mb-2 tracking-tight">
              What is Your Goal?
            </h1>
            <p className="text-sm text-white/50 mb-8">
              This tailors the AI's intensity calculations.
            </p>

            <div className="space-y-3">
              {[
                {
                  id: "muscle",
                  label: "Building Muscle",
                  desc: "Hypertrophy Focus",
                },
                {
                  id: "weight_loss",
                  label: "Lose Weight",
                  desc: "High Burn Intensity",
                },
                {
                  id: "sarcopenia_prevention",
                  label: "Healthy Aging",
                  desc: "Joint & Mobility Focus",
                },
              ].map((goal) => (
                <div
                  key={goal.id}
                  onClick={() => updateField("goal", goal.id as Goal)}
                  className={`p-4 rounded-2xl border cursor-pointer flex justify-between items-center transition-all duration-300 ${
                    formData.goal === goal.id
                      ? "bg-primary/20 border-primary"
                      : "bg-white/5 border-white/10"
                  }`}
                >
                  <div className="text-left">
                    <h3
                      className={`font-black ${formData.goal === goal.id ? "text-primary" : "text-white"}`}
                    >
                      {goal.label}
                    </h3>
                    <p className="text-xs text-white/40">{goal.desc}</p>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      formData.goal === goal.id
                        ? "border-primary bg-primary"
                        : "border-white/30"
                    }`}
                  >
                    {formData.goal === goal.id && (
                      <span className="text-black text-xs font-black">✓</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- STEP 6: SAFETY CHECK --- */}
        {step === 6 && (
          <div className="w-full text-center">
            <h1 className="text-3xl font-black text-white mb-2 tracking-tight">
              Safety Check
            </h1>
            <p className="text-sm text-white/50 mb-8">
              Crucial for generating a safe clinical pathway.
            </p>

            <div className="text-left mb-6">
              <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3 pl-1">
                Experience Level
              </p>
              <div className="flex gap-2">
                {[
                  { id: "beginner", label: "Beginner" },
                  { id: "intermediate", label: "Intermediate" },
                ].map((lvl) => (
                  <button
                    key={lvl.id}
                    onClick={() => updateField("level", lvl.id as Level)}
                    className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                      formData.level === lvl.id
                        ? "bg-primary text-black"
                        : "bg-white/5 text-white/50 border border-white/10"
                    }`}
                  >
                    {lvl.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-left">
              <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3 pl-1">
                Joint Health
              </p>
              <div className="space-y-2">
                {[
                  { id: "none", label: "No Pain (Feel Great)" },
                  { id: "mild_joint_pain", label: "Mild Aches & Pain" },
                  {
                    id: "severe_mobility_issues",
                    label: "Severe Mobility Issues",
                  },
                ].map((pain) => (
                  <button
                    key={pain.id}
                    onClick={() => updateField("pain_level", pain.id as Pain)}
                    className={`w-full py-4 px-4 rounded-xl font-bold text-left transition-all ${
                      formData.pain_level === pain.id
                        ? pain.id.includes("severe")
                          ? "bg-red-500/20 text-red-400 border border-red-500/50"
                          : "bg-primary/20 text-primary border border-primary/50"
                        : "bg-white/5 text-white border border-white/10"
                    }`}
                  >
                    {pain.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Fixed Bottom Action Bar */}
      <div className="w-full max-w-sm mt-auto pt-4">
        <Button
          onClick={handleNext}
          disabled={loadingState !== "idle"}
          className="w-full h-14 bg-primary text-black font-black text-base rounded-2xl shadow-[0_0_20px_rgba(208,255,0,0.2)] hover:scale-[1.02] active:scale-95 transition-all"
        >
          {step === TOTAL_STEPS ? "GENERATE PLAN ✨" : "CONTINUE"}
        </Button>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .mask-image-gradient {
          mask-image: linear-gradient(to bottom, transparent, black 30%, black 70%, transparent);
          -webkit-mask-image: linear-gradient(to bottom, transparent, black 30%, black 70%, transparent);
        }
      `,
        }}
      />
    </div>
  );
}
