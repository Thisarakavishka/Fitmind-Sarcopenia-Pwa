import * as ort from "onnxruntime-web";

const PLAN_TAGS = {
  0: "Silver_Mobility",
  1: "Low_Impact_Burn",
  2: "Hypertrophy_Builder",
  3: "Athlete_Performance",
};

export async function predictWorkoutPlan(userData: {
  age: number;
  weight: number;
  height: number;
  gender: string;
  experience: string;
}) {
  console.group("🧠 AI Debugger Started");
  try {
    // 1. Calculations & Inputs
    const heightM = userData.height / 100;
    const bmi = userData.weight / (heightM * heightM);
    const genderNum = userData.gender === "female" ? 1 : 0;
    let expNum = 0;
    if (userData.experience === "intermediate") expNum = 1;
    if (userData.experience === "advanced") expNum = 2;

    console.log("📊 Raw Inputs:", userData);
    console.log("🔢 Normalized Tensor Inputs:", {
      age: userData.age,
      bmi: bmi.toFixed(2),
      gender: genderNum,
      experience: expNum,
    });

    // 2. Load Model
    console.time("⏳ Model Load Time");
    const session = await ort.InferenceSession.create(
      "/models/schedule_classifier.onnx"
    );
    console.timeEnd("⏳ Model Load Time");

    // 3. Create Tensor
    const inputData = Float32Array.from([userData.age, bmi, genderNum, expNum]);
    const tensor = new ort.Tensor("float32", inputData, [1, 4]);

    // 4. Run Prediction
    const outputName = session.outputNames[0];
    console.log(`🔎 Model Output Node Name: "${outputName}"`);

    const results = await session.run({ float_input: tensor }, [outputName]);

    // 5. Decode Result
    const labelData = results[outputName].data[0];
    const labelIndex = Number(labelData);
    const predictionTag = PLAN_TAGS[labelIndex as keyof typeof PLAN_TAGS];

    console.log(`✅ AI Raw Output: ${labelIndex}`);
    console.log(`🏷️ Mapped Tag: "${predictionTag}"`);
    console.groupEnd();

    return predictionTag || "Hypertrophy_Builder";
  } catch (error) {
    console.error("❌ AI CRITICAL ERROR:", error);
    console.groupEnd();
    return "Hypertrophy_Builder"; // Fallback
  }
}
