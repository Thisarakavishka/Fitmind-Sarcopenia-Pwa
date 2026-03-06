"use client";

import React, { useEffect, useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import * as poseDetection from "@tensorflow-models/pose-detection";
import "@tensorflow/tfjs-backend-webgl";
import { useRouter } from "next/navigation";
import { Button } from "../../../components/ui/Button";

export default function CameraPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isLoaded, setIsLoaded] = useState(false);
  const [repCount, setRepCount] = useState(0);
  const [feedback, setFeedback] = useState("Initializing AI...");
  const [bodyDetected, setBodyDetected] = useState(false);

  const detectorRef = useRef<poseDetection.PoseDetector | null>(null);
  const classifierRef = useRef<tf.LayersModel | null>(null);
  const isSquattingRef = useRef(false);
  const repCountRef = useRef(0);

  useEffect(() => {
    let stream: MediaStream | null = null;

    async function setupAI() {
      try {
        await tf.ready();
        
        detectorRef.current = await poseDetection.createDetector(
          poseDetection.SupportedModels.BlazePose,
          { runtime: "tfjs", modelType: "lite" }
        );

        classifierRef.current = await tf.loadLayersModel("/models/squat/model.json");

        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: "user" } // Removed ideal constraints to prevent conflicts
          });
          
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => {
              videoRef.current!.play();
              setIsLoaded(true);
              setFeedback("Step into frame");
              startDetecting();
            };
          }
        }
      } catch (error) {
        console.error("🚨 AI/Camera Init Error:", error);
        setFeedback("Camera Error. Check Permissions.");
      }
    }

    setupAI();
    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, []);

  const startDetecting = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    async function detectFrame() {
      if (!ctx || !detectorRef.current || !classifierRef.current) return;

      try {
        if (video.readyState === 4) {
          // Exactly as it was in your working test file
          const videoWidth = video.videoWidth || 640;
          const videoHeight = video.videoHeight || 480;
          
          if (videoWidth > 0 && videoHeight > 0) {
            canvas.width = videoWidth;
            canvas.height = videoHeight;
          }

          const poses = await detectorRef.current.estimatePoses(video, { flipHorizontal: false });
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          if (poses.length > 0) {
            setBodyDetected(true);
            const pose = poses[0];
            const keypoints = pose.keypoints;

            try {
              // EXACT custom model math from your test file
              let inputArray: number[] = [];
              keypoints.forEach((kp) => {
                inputArray.push(kp.x / videoWidth);
                inputArray.push(kp.y / videoHeight);
                inputArray.push(kp.z || 0);
                inputArray.push(kp.score || 0);
              });

              const inputTensor = tf.tensor2d([inputArray]);
              const prediction = classifierRef.current.predict(inputTensor) as tf.Tensor;
              const score = prediction.dataSync()[0];
              inputTensor.dispose();

              const isGoodForm = score > 0.5;
              const skeletonColor = isGoodForm ? "#D0FF00" : "#EF4444"; // Neon Green or Red
              
              setFeedback(isGoodForm ? "Good Form!" : "Fix Your Posture!");
              drawSkeleton(keypoints, ctx, skeletonColor);

              // REP COUNTING (Exact test logic)
              const leftHip = keypoints[23];
              const leftKnee = keypoints[25];

              if (leftHip && leftKnee && leftHip.score != null && leftKnee.score != null && leftHip.score > 0.5 && leftKnee.score > 0.5) {
                  if (leftHip.y > leftKnee.y - 40 && !isSquattingRef.current) {
                      isSquattingRef.current = true;
                  }
                  if (leftHip.y < leftKnee.y - 80 && isSquattingRef.current) {
                      isSquattingRef.current = false;
                      if (isGoodForm) {
                          repCountRef.current += 1;
                          setRepCount(repCountRef.current);
                      }
                  }
              }
            } catch (modelError) {
              console.error("🚨 Custom Model Math Error:", modelError);
            }

          } else {
            setBodyDetected(false);
            setFeedback("Scanning for body...");
          }
        }
      } catch (error) {
        console.error("🚨 Detection loop error:", error);
      }
      
      requestAnimationFrame(detectFrame);
    }
    detectFrame();
  };

  const drawSkeleton = (keypoints: poseDetection.Keypoint[], ctx: CanvasRenderingContext2D, color: string) => {
    const adjacentPairs = poseDetection.util.getAdjacentPairs(poseDetection.SupportedModels.BlazePose);
    ctx.strokeStyle = color;
    ctx.lineWidth = 6;

    adjacentPairs.forEach(([i, j]) => {
      const kp1 = keypoints[i];
      const kp2 = keypoints[j];
      
      if (kp1.score != null && kp2.score != null && kp1.score > 0.2 && kp2.score > 0.2) {
        ctx.beginPath();
        ctx.moveTo(kp1.x, kp1.y);
        ctx.lineTo(kp2.x, kp2.y);
        ctx.stroke();
      }
    });

    ctx.fillStyle = "white";
    keypoints.forEach((kp) => {
      if (kp.score != null && kp.score > 0.2) {
        ctx.beginPath();
        ctx.arc(kp.x, kp.y, 5, 0, 2 * Math.PI);
        ctx.fill();
      }
    });
  };

  return (
    <div className="flex flex-col h-screen bg-black text-white overflow-hidden font-sans">
      
      {/* Header UI */}
      <div className="absolute top-0 inset-x-0 p-4 z-30 flex justify-between items-start pointer-events-none">
        <Button 
          onClick={() => router.back()} 
          className="pointer-events-auto bg-black/50 backdrop-blur-md border border-white/10 hover:bg-white/10 rounded-2xl px-6"
        >
          ✕ Quit
        </Button>

        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
            <div className={`w-2 h-2 rounded-full ${bodyDetected ? "bg-primary animate-pulse" : "bg-red-500"}`} />
            <span className={`text-[10px] font-bold uppercase tracking-widest ${bodyDetected ? "text-primary" : "text-red-500"}`}>
              {bodyDetected ? "AI Active" : "No Body Found"}
            </span>
          </div>
          
          <div className="bg-black/50 backdrop-blur-md px-6 py-4 rounded-3xl border border-white/10 text-center shadow-2xl">
            <p className="text-xs text-primary font-black uppercase tracking-widest mb-1">Rep Counter</p>
            <p className="text-5xl font-black tabular-nums">{repCount}</p>
          </div>
        </div>
      </div>

      {/* Camera Stage */}
      <div className="relative flex-1 bg-[#0a0a0a] flex items-center justify-center p-4">
        {!isLoaded && (
          <div className="absolute inset-0 z-40 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-primary font-bold tracking-widest animate-pulse uppercase">Warming Up Camera...</p>
          </div>
        )}

        {/* 🌟 THE FIX: Hardcoded width/height to stop TFJS from crashing! */}
        <div ref={containerRef} className="relative w-full max-w-2xl aspect-[4/3] bg-black rounded-[2rem] overflow-hidden border-2 border-white/10 shadow-2xl">
          <video 
            ref={videoRef} 
            playsInline 
            muted 
            width={640}
            height={480}
            className="absolute inset-0 w-full h-full object-cover -scale-x-100" 
          />
          <canvas 
            ref={canvasRef} 
            width={640}
            height={480}
            className="absolute inset-0 w-full h-full object-cover -scale-x-100 z-10" 
          />
        </div>

        {/* Dynamic Feedback Overlay */}
        <div className="absolute bottom-8 inset-x-0 flex justify-center px-4 z-20">
          <div className={`w-full max-w-md py-4 rounded-2xl border-2 backdrop-blur-xl transition-all duration-300 shadow-2xl ${
            feedback === "Good Form!" 
              ? "bg-primary/20 border-primary text-primary" 
              : feedback === "Step into frame" || feedback.includes("Scanning")
              ? "bg-white/10 border-white/20 text-white"
              : "bg-red-500/20 border-red-500 text-red-400"
          }`}>
            <p className="text-center text-xl font-black uppercase tracking-tight">
              {feedback}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}