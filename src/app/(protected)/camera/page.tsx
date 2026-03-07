"use client";

import React, { useEffect, useRef, useState, Suspense } from "react";
import * as tf from "@tensorflow/tfjs";
import * as poseDetection from "@tensorflow-models/pose-detection";
import "@tensorflow/tfjs-backend-webgl";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";
import { Button } from "../../../components/shared/Button";

function CameraContent() {
  const router = useRouter();
  const supabase = createClient();
  const searchParams = useSearchParams();
  const execId = searchParams.get("execId");
  const targetReps = parseInt(searchParams.get("target") || "10");

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [repCount, setRepCount] = useState(0);
  const [feedback, setFeedback] = useState("Initializing AI...");
  const [isSaving, setIsSaving] = useState(false);

  const detectorRef = useRef<poseDetection.PoseDetector | null>(null);
  const classifierRef = useRef<tf.LayersModel | null>(null);
  const isSquattingRef = useRef(false);
  const repCountRef = useRef(0);
  const accuracyScores = useRef<number[]>([]);

  useEffect(() => {
    async function setupAI() {
      try {
        await tf.ready();
        detectorRef.current = await poseDetection.createDetector(poseDetection.SupportedModels.BlazePose, { runtime: "tfjs", modelType: "lite" });
        classifierRef.current = await tf.loadLayersModel("/models/squat/model.json");
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => { videoRef.current!.play(); setIsLoaded(true); startDetecting(); };
        }
      } catch (e) { setFeedback("Camera Error"); }
    }
    setupAI();
  }, []);

  // 🌟 Auto-finish set
  useEffect(() => {
    if (repCount >= targetReps && !isSaving) {
      const saveSet = async () => {
        setIsSaving(true);
        const { data: { user } } = await supabase.auth.getUser();
        const avgScore = accuracyScores.current.length > 0 ? accuracyScores.current.reduce((a,b)=>a+b)/accuracyScores.current.length : 0;
        if (user && execId) {
          await supabase.from("workout_history_logs").insert({
            user_id: user.id,
            session_exercise_id: execId,
            actual_reps_completed: repCountRef.current,
            ai_form_accuracy_score: Math.round(avgScore * 100),
          });
        }
        if (navigator.vibrate) navigator.vibrate(200);
        router.back();
      };
      saveSet();
    }
  }, [repCount]);

  const startDetecting = async () => {
    const video = videoRef.current!;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const detect = async () => {
      if (!detectorRef.current || !classifierRef.current || video.readyState !== 4) { requestAnimationFrame(detect); return; }
      const poses = await detectorRef.current.estimatePoses(video);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (poses.length > 0) {
        const keypoints = poses[0].keypoints;
        const videoWidth = video.videoWidth, videoHeight = video.videoHeight;
        let input: number[] = [];
        keypoints.forEach(kp => { input.push(kp.x/videoWidth, kp.y/videoHeight, kp.z||0, kp.score||0); });
        const tensor = tf.tensor2d([input]);
        const pred = classifierRef.current.predict(tensor) as tf.Tensor;
        const score = (await pred.data())[0];
        accuracyScores.current.push(score);
        const good = score > 0.5;
        setFeedback(good ? "Correct Form" : "Adjust Posture");
        drawSkeleton(keypoints, ctx, good ? "#D0FF00" : "#EF4444");
        const hip = keypoints[23], knee = keypoints[25];
        if (hip.score! > 0.5 && knee.score! > 0.5) {
          if (hip.y > knee.y - 40 && !isSquattingRef.current) isSquattingRef.current = true;
          if (hip.y < knee.y - 80 && isSquattingRef.current) {
            isSquattingRef.current = false;
            if (good) { repCountRef.current++; setRepCount(repCountRef.current); }
          }
        }
        tensor.dispose(); pred.dispose();
      }
      requestAnimationFrame(detect);
    };
    detect();
  };

  const drawSkeleton = (kps: any[], ctx: any, color: string) => {
    ctx.strokeStyle = color; ctx.lineWidth = 6;
    poseDetection.util.getAdjacentPairs(poseDetection.SupportedModels.BlazePose).forEach(([i,j]) => {
      const kp1 = kps[i], kp2 = kps[j];
      if (kp1.score! > 0.3 && kp2.score! > 0.3) { ctx.beginPath(); ctx.moveTo(kp1.x, kp1.y); ctx.lineTo(kp2.x, kp2.y); ctx.stroke(); }
    });
  };

  return (
    <div className="h-screen bg-black text-white flex flex-col">
      <div className="absolute top-0 inset-x-0 p-6 z-30 flex justify-between items-start">
        <Button onClick={() => router.back()} className="bg-white/10 px-6">✕ Quit</Button>
        <div className="bg-black/60 p-5 rounded-3xl border border-white/10 text-center">
          <p className="text-[10px] text-primary font-black uppercase tracking-widest mb-1">Target: {targetReps}</p>
          <p className="text-5xl font-black tabular-nums">{repCount}</p>
        </div>
      </div>
      <div className="flex-1 relative flex items-center justify-center p-4">
        <div className="relative w-full max-w-2xl aspect-[4/3] bg-black rounded-[2rem] overflow-hidden border-2 border-white/10">
          <video ref={videoRef} playsInline muted width={640} height={480} className="absolute inset-0 w-full h-full object-cover -scale-x-100" />
          <canvas ref={canvasRef} width={640} height={480} className="absolute inset-0 w-full h-full object-cover -scale-x-100 z-10" />
        </div>
        <div className="absolute bottom-10 px-6 w-full max-w-md">
          <div className={`p-4 rounded-2xl border-2 text-center text-xl font-black uppercase ${feedback.includes("Correct") ? "bg-primary/20 border-primary text-primary" : "bg-red-500/20 border-red-500 text-red-400"}`}>
            {feedback}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CameraPage() { return <Suspense><CameraContent /></Suspense>; }