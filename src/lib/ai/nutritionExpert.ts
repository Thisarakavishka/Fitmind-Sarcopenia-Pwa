export interface UserBioData {
  age: number;
  weight_kg: number;
  height_cm: number;
  target_goal: string;
  pain_level: string;
  experience_level: string;
}

export function calculateNutritionExpert(profile: UserBioData, mealLogs: any[]) {
  const { age, weight_kg, height_cm, target_goal, pain_level } = profile;
  const bmi = weight_kg / (Math.pow(height_cm / 100, 2));
  
  // 1. Calculate Targets
  const estimatedBurn = Math.round((5.0 * 3.5 * weight_kg) / 200 * 45); // [cite: 82]
  let proteinMultiplier = age >= 40 ? 1.6 : 1.2; // [cite: 36, 56]
  let calorieMultiplier = bmi > 25 ? 26 : 30;

  // 2. Aggregate Today's Progress
  const today = new Date().toISOString().split('T')[0];
  const todaysLogs = mealLogs.filter(log => log.logged_at.startsWith(today));
  const currentProtein = todaysLogs.reduce((acc, log) => acc + Number(log.protein_earned), 0);
  const currentCalories = todaysLogs.reduce((acc, log) => acc + Number(log.calories_earned), 0);

  // 3. Expert Heuristics (Recommendations)
  const recommendations = [];

  if (age >= 40 || target_goal === "sarcopenia_prevention") {
    recommendations.push({
      title: "Anabolic Trigger",
      text: "Prioritize 30g of protein in your next meal to trigger muscle protein synthesis.",
      icon: "🥩",
      nutrient: "Leucine"
    });
  }

  if (pain_level !== "none") {
    recommendations.push({
      title: "Joint Recovery",
      text: "Detected joint pain. Increase Omega-3 intake (Salmon/Walnuts) to reduce inflammation.",
      icon: "🐟",
      nutrient: "Omega-3"
    });
  }

  return {
    proteinTarget: Math.round(weight_kg * proteinMultiplier),
    calorieTarget: Math.round(weight_kg * calorieMultiplier) + estimatedBurn,
    currentProtein,
    currentCalories,
    bmi: parseFloat(bmi.toFixed(1)),
    recommendations
  };
}