"use client";

import { useEffect, useRef, useState } from "react";
import * as poseDetection from "@tensorflow-models/pose-detection";
import "@tensorflow/tfjs-backend-webgl";
import * as tf from "@tensorflow/tfjs";

export default function TestSquat() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [status, setStatus] = useState("Loading AI...");
  const [reps, setReps] = useState(0);

  const modelRef = useRef<any>(null);
  const detectorRef = useRef<any>(null);

  const squatDown = useRef(false);

  useEffect(() => {
    async function start() {
      await tf.ready();

      detectorRef.current = await poseDetection.createDetector(
        poseDetection.SupportedModels.BlazePose,
        { runtime: "tfjs", modelType: "full" }
      );

      modelRef.current = await tf.loadLayersModel("/models/squat/model.json");

      const stream = await navigator.mediaDevices.getUserMedia({ video: true });

      const video = videoRef.current!;
      video.srcObject = stream;
      await video.play();

      detect();
    }

    async function detect() {
      const video = videoRef.current!;
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext("2d")!;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const poses = await detectorRef.current.estimatePoses(video, {
        flipHorizontal: true,
      });

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (poses.length > 0) {
        const keypoints = poses[0].keypoints;

        let input: number[] = [];

        keypoints.forEach((kp: any) => {
          input.push(kp.x);
          input.push(kp.y);
          input.push(0);
          input.push(kp.score || 0);
        });

        const tensor = tf.tensor2d([input]);

        const pred = modelRef.current.predict(tensor);
        const score = pred.dataSync()[0];

        tensor.dispose();

        const good = score > 0.5;

        setStatus(good ? "Correct Squat" : "Incorrect Squat");

        checkRep(keypoints, good);

        drawSkeleton(keypoints, ctx, good);
      }

      requestAnimationFrame(detect);
    }

    start();
  }, []);

  function checkRep(keypoints: any, good: boolean) {
    const hip = keypoints[24];
    const knee = keypoints[26];

    if (!hip || !knee) return;

    const down = hip.y > knee.y;

    if (down && !squatDown.current) {
      squatDown.current = true;
    }

    if (!down && squatDown.current) {
      squatDown.current = false;

      if (good) {
        setReps((r) => r + 1);
      }
    }
  }

  function drawSkeleton(keypoints: any, ctx: any, good: boolean) {
    const pairs = poseDetection.util.getAdjacentPairs(
      poseDetection.SupportedModels.BlazePose
    );

    const color = good ? "#00ff88" : "#ff3333";

    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 4;

    pairs.forEach(([i, j]: any) => {
      const kp1 = keypoints[i];
      const kp2 = keypoints[j];

      if (kp1.score > 0.3 && kp2.score > 0.3) {
        ctx.beginPath();
        ctx.moveTo(kp1.x, kp1.y);
        ctx.lineTo(kp2.x, kp2.y);
        ctx.stroke();
      }
    });

    keypoints.forEach((kp: any) => {
      if (kp.score > 0.3) {
        ctx.beginPath();
        ctx.arc(kp.x, kp.y, 5, 0, 2 * Math.PI);
        ctx.fill();
      }
    });
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-black text-white">
      <h1 className="text-2xl mb-2">{status}</h1>
      <h2 className="text-xl mb-4">Reps: {reps}</h2>

      <div className="relative">
        <video ref={videoRef} width={640} height={480} className="-scale-x-100" />

        <canvas
          ref={canvasRef}
          width={640}
          height={480}
          className="absolute top-0 left-0 -scale-x-100"
        />
      </div>
    </div>
  );
}