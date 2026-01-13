import Link from "next/link";
import { Button } from "../components/ui/Button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      {/* Navbar */}
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="text-2xl font-bold tracking-tighter">
          FitMind <span className="text-primary">AI</span>
        </div>
        <div className="flex gap-4">
          <Link href="/login">
            <Button className="bg-transparent hover:bg-white/10 text-white border border-white/20">
              Log In
            </Button>
          </Link>
          <Link href="/register">
            <Button className="bg-primary text-black font-bold hover:opacity-90">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 mt-10">
        <div className="space-y-6 max-w-3xl animate-in fade-in slide-in-from-bottom-8 duration-700">
          <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary text-sm font-bold border border-primary/20">
            ✨ AI-Powered Sarcopenia Prevention
          </span>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-tight">
            Aging is inevitable. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">
              Weakness is optional.
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Your personalized AI coach for muscle retention, mobility, and
            healthy aging. Tailored workouts that adapt to you.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link href="/register">
              <Button className="h-14 px-8 text-lg bg-primary text-black font-bold rounded-full shadow-[0_0_20px_rgba(45,212,191,0.4)] hover:shadow-[0_0_30px_rgba(45,212,191,0.6)] transition-all">
                Start Your Journey
              </Button>
            </Link>
            <Link href="/login">
              <Button className="h-14 px-8 text-lg bg-white/5 text-white border border-white/10 rounded-full hover:bg-white/10">
                I have an account
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
           <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] opacity-30"></div>
           <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] opacity-30"></div>
        </div>
      </main>
      
      <footer className="p-6 text-center text-gray-600 text-sm">
        © 2026 FitMind AI. All rights reserved.
      </footer>
    </div>
  );
}