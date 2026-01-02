import CameraFeed from "../components/CameraFeed";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-zinc-950">
      {/* Header / Title Area */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tighter text-white sm:text-4xl">
          FitMind <span className="text-cyan-500">Vision</span>
        </h1>
        <p className="mt-2 text-zinc-400">
          Camera System & PWA Test Environment
        </p>
      </div>

      {/* The Camera Component */}
      <div className="w-full max-w-md">
        <CameraFeed />
      </div>

      {/* Footer / Status */}
      <div className="mt-8 text-xs text-zinc-600">
        <p>Running on feature/pwa-camera-setup</p>
      </div>
    </main>
  );
}
