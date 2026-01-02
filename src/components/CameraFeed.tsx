'use client';

import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';

const videoConstraints = {
  width: 720,
  height: 1280,
  facingMode: "user" // Forces the front/selfie camera on phones
};

export default function CameraFeed() {
  const webcamRef = useRef<Webcam>(null);
  const [imgSrc, setImgSrc] = useState<string | null>(null);

  // Function to capture a screenshot (you'll need this for the AI later)
  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setImgSrc(imageSrc);
      console.log("Image Captured:", imageSrc); // Debugging
    }
  }, [webcamRef]);

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[50vh] bg-gray-900 p-4 rounded-xl">
      <div className="relative w-full max-w-md aspect-[9/16] overflow-hidden rounded-lg shadow-2xl border-2 border-cyan-500/30">
        
        {/* Live Camera Feed */}
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
          className="absolute top-0 left-0 w-full h-full object-cover transform scale-x-[-1]" // scale-x-[-1] creates the "Mirror" effect like a real mirror
          onUserMediaError={(err) => console.error("Camera Error:", err)}
        />

        {/* Overlay UI (Optional guidelines) */}
        <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-white/20 rounded-lg m-8"></div>
      </div>

      <button
        onClick={capture}
        className="mt-6 px-8 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-full transition-all shadow-lg active:scale-95"
      >
        Capture for Analysis
      </button>

      {/* Preview of captured image (just for testing) */}
      {imgSrc && (
        <div className="mt-4">
          <p className="text-white text-sm mb-2">Captured Preview:</p>
          <img src={imgSrc} alt="Captured" className="w-32 rounded-lg border border-white/50" />
        </div>
      )}
    </div>
  );
}