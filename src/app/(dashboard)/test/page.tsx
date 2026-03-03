"use client";

import React, { useEffect, useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import * as poseDetection from "@tensorflow-models/pose-detection";
import "@tensorflow/tfjs-backend-webgl";

export default function PoseCorrectionTest() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [repCount, setRepCount] = useState(0);
  const [feedback, setFeedback] = useState("Standing by...");
  const [bodyDetected, setBodyDetected] = useState(false);

  const detectorRef = useRef<poseDetection.PoseDetector | null>(null);
  const classifierRef = useRef<tf.LayersModel | null>(null);
  const isSquattingRef = useRef(false);
  const repCountRef = useRef(0);

  useEffect(() => {
    let stream: MediaStream | null = null;

    async function setupAI() {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: "user" } 
          });
          
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            
            videoRef.current.onloadedmetadata = async () => {
              videoRef.current!.play();
              
              await tf.ready();
              const detector = await poseDetection.createDetector(
                poseDetection.SupportedModels.BlazePose,
                { runtime: "tfjs", modelType: "lite" }
              );
              detectorRef.current = detector;

              const model = await tf.loadLayersModel("/models/squat/model.json");
              classifierRef.current = model;
              
              setIsLoaded(true);
              startDetecting();
            };
          }
        }
      } catch (error) {
        console.error("🚨 Camera Error:", error);
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
            const skeletonColor = isGoodForm ? "#10B981" : "#EF4444"; // Green / Red
            
            if (isGoodForm) setFeedback("Good Form!");
            else setFeedback("Fix Your Posture!");

            // ONLY draw the final Green or Red skeleton
            drawSkeleton(keypoints, ctx, skeletonColor);

            // REP COUNTING
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
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      
      <div className="mb-4 text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Squat Analyzer</h1>
        <p className={`font-bold ${bodyDetected ? "text-green-400" : "text-red-500"}`}>
          {bodyDetected ? "✅ Body Detected" : "❌ No Body Detected (Step into frame)"}
        </p>
      </div>

      {/* FIXED ASPECT RATIO CONTAINER: This stops the skeleton from floating off the body! */}
      <div className="relative w-full max-w-3xl aspect-[4/3] bg-black rounded-lg overflow-hidden border-4 border-gray-700 shadow-2xl">
        
        {!isLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 z-50">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-white font-bold animate-pulse">Loading AI Models...</p>
          </div>
        )}

        {/* The width and height attributes fixed the TensorFlow 0x0 bug! */}
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          width={640}
          height={480}
          className="absolute inset-0 w-full h-full object-contain -scale-x-100" 
        />
        
        <canvas 
          ref={canvasRef} 
          width={640}
          height={480}
          className="absolute inset-0 w-full h-full object-contain -scale-x-100 z-10" 
        />
      </div>

      <div className="mt-8 flex gap-8">
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 w-48 text-center">
          <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">Total Reps</p>
          <p className="text-6xl font-black text-blue-500">{repCount}</p>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 w-64 text-center flex flex-col justify-center">
          <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">Form Check</p>
          <p className={`text-2xl font-bold ${
            feedback === "Good Form!" ? "text-green-500" : 
            feedback === "Fix Your Posture!" ? "text-red-500" : "text-white"
          }`}>
            {feedback}
          </p>
        </div>
      </div>

    </div>
  );
}