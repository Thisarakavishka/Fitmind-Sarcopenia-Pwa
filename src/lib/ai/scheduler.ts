// lib/ai/scheduler.ts
import * as ort from "onnxruntime-web";

interface BioData {
  age: number;
  weight: number;
  height: number;
  gender: string;
  experience: string;
  pain_level: string;
  goal: string;
}

export async function predictWorkoutPlan(data: BioData): Promise<string> {
  try {
    // 1. Math conversions
    const heightInMeters = data.height / 100;
    const bmi = parseFloat(
      (data.weight / (heightInMeters * heightInMeters)).toFixed(1),
    );

    // 2. Data Encoding (Must exactly match the Python notebook)
    const genderNum = data.gender === "female" ? 1 : 0;

    let expNum = 0; // beginner
    if (data.experience === "intermediate") expNum = 1;
    if (data.experience === "advanced") expNum = 2;

    let painNum = 0; // none
    if (data.pain_level === "mild_joint_pain") painNum = 1;
    if (data.pain_level === "severe_mobility_issues") painNum = 2;

    let goalNum = 0; // build muscle
    if (data.goal === "weight_loss") goalNum = 1;
    if (data.goal === "sarcopenia_prevention") goalNum = 2;

    // 3. Load the Model from the public folder
    const session = await ort.InferenceSession.create(
      "/models/schedule_classifier.onnx",
    );

    // 4. Create Tensor with SIX (6) inputs
    const float32Data = new Float32Array([
      data.age,
      bmi,
      genderNum,
      expNum,
      painNum,
      goalNum,
    ]);
    const tensor = new ort.Tensor("float32", float32Data, [1, 6]);

    // 5. Run Inference
    const feeds: Record<string, ort.Tensor> = { float_input: tensor };
    const results = await session.run(feeds);

    const outputTensor = results[session.outputNames[0]];
    const predictionInt = Number(outputTensor.data[0]);

    // 6. Map to the 5 Database Tags
    const planMap: Record<number, string> = {
      0: "Silver_Mobility_Rehab",
      1: "Low_Impact_Fat_Burn",
      2: "Hypertrophy_Muscle_Builder",
      3: "Athlete_Performance",
      4: "Active_Fat_Burn",
    };

    console.log(`🤖 AI Predicted: ${planMap[predictionInt]}`);
    return planMap[predictionInt] || "Hypertrophy_Muscle_Builder";
  } catch (error) {
    console.error("🚨 ONNX Model Error:", error);
    return "Hypertrophy_Muscle_Builder"; // Fallback safety
  }
}
