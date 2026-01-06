// This maps the "AI Prediction ID" to a Real Schedule
export const WORKOUT_TEMPLATES = {
  // 0: Sarcopenia Prevention (The "Silver" Plan)
  0: {
    name: "Silver Vitality & Balance",
    focus: "Mobility, Stability, Joint Health",
    intensity: "Low Impact",
    schedule: [
      {
        day: "Mon",
        title: "Balance & Core",
        duration: "20 min",
        exercises: ["Single Leg Stand", "Chair Squats", "Wall Pushups"],
      },
      {
        day: "Tue",
        title: "Active Recovery",
        duration: "15 min",
        exercises: ["Light Walking", "Stretching"],
      },
      {
        day: "Wed",
        title: "Gentle Strength",
        duration: "25 min",
        exercises: ["Band Pull-Aparts", "Seated Rows", "Glute Bridges"],
      },
      { day: "Thu", title: "Rest & Hydrate", duration: "0 min", exercises: [] },
      {
        day: "Fri",
        title: "Full Body Mobility",
        duration: "20 min",
        exercises: ["Cat-Cow Stretch", "Bird-Dog", "Chair Sit-to-Stand"],
      },
      {
        day: "Sat",
        title: "Light Cardio",
        duration: "30 min",
        exercises: ["Brisk Walking", "Swimming (Optional)"],
      },
      { day: "Sun", title: "Rest", duration: "0 min", exercises: [] },
    ],
  },

  // 1: Weight Loss (The "Burn" Plan)
  1: {
    name: "Metabolic Fire",
    focus: "High Calorie Burn, Cardio Endurance",
    intensity: "High",
    schedule: [
      {
        day: "Mon",
        title: "HIIT Cardio",
        duration: "35 min",
        exercises: ["Jumping Jacks", "Burpees", "Mountain Climbers"],
      },
      {
        day: "Tue",
        title: "Steady State Cardio",
        duration: "45 min",
        exercises: ["Jogging", "Cycling"],
      },
      {
        day: "Wed",
        title: "Full Body Circuit",
        duration: "40 min",
        exercises: ["Bodyweight Squats", "Pushups", "Lunges"],
      },
      {
        day: "Thu",
        title: "Active Recovery",
        duration: "20 min",
        exercises: ["Yoga Flow"],
      },
      {
        day: "Fri",
        title: "Tabata Intervals",
        duration: "30 min",
        exercises: ["High Knees", "Plank Jacks", "Squat Jumps"],
      },
      {
        day: "Sat",
        title: "Long Distance",
        duration: "60 min",
        exercises: ["Hiking", "Running"],
      },
      { day: "Sun", title: "Rest", duration: "0 min", exercises: [] },
    ],
  },

  // 2: Hypertrophy (The "Muscle" Plan) - DEFAULT
  2: {
    name: "Hypertrophy Foundations",
    focus: "Muscle Growth, Volume",
    intensity: "Moderate-High",
    schedule: [
      {
        day: "Mon",
        title: "Upper Body Push",
        duration: "45 min",
        exercises: ["Pushups", "Dumbbell Press", "Lateral Raises"],
      },
      {
        day: "Tue",
        title: "Lower Body",
        duration: "50 min",
        exercises: ["Squats", "Lunges", "Calf Raises"],
      },
      { day: "Wed", title: "Rest", duration: "0 min", exercises: [] },
      {
        day: "Thu",
        title: "Upper Body Pull",
        duration: "45 min",
        exercises: ["Pull-ups", "Dumbbell Rows", "Face Pulls"],
      },
      {
        day: "Fri",
        title: "Full Body Volume",
        duration: "55 min",
        exercises: ["Deadlifts", "Bench Press", "Leg Press"],
      },
      {
        day: "Sat",
        title: "Weak Points",
        duration: "30 min",
        exercises: ["Bicep Curls", "Tricep Extensions"],
      },
      { day: "Sun", title: "Rest", duration: "0 min", exercises: [] },
    ],
  },

  // 3: Advanced Strength
  3: {
    name: "Power & Performance",
    focus: "Max Strength, Low Reps",
    intensity: "Very High",
    schedule: [
      {
        day: "Mon",
        title: "Max Effort Lower",
        duration: "60 min",
        exercises: ["Heavy Squats", "Deadlifts"],
      },
      {
        day: "Tue",
        title: "Max Effort Upper",
        duration: "60 min",
        exercises: ["Bench Press", "Weighted Pull-ups"],
      },
      { day: "Wed", title: "Rest", duration: "0 min", exercises: [] },
      {
        day: "Thu",
        title: "Dynamic Effort Lower",
        duration: "45 min",
        exercises: ["Speed Squats", "Box Jumps"],
      },
      {
        day: "Fri",
        title: "Dynamic Effort Upper",
        duration: "45 min",
        exercises: ["Speed Bench", "Medicine Ball Throws"],
      },
      {
        day: "Sat",
        title: "Conditioning",
        duration: "30 min",
        exercises: ["Sled Push", "Farmers Walk"],
      },
      { day: "Sun", title: "Rest", duration: "0 min", exercises: [] },
    ],
  },
};
