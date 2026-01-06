"use client";

import { useState } from "react"; // Import State
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { useUserStore } from "../../../lib/store/userStore"; // Import Store

export default function RegisterPage() {
  const router = useRouter();
  const setUserData = useUserStore((state) => state.setUserData); // Get action

  // 1. Capture Inputs
  const [input, setInput] = useState({ name: "", email: "", password: "" });

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();

    // 2. Simple Validation
    if (!input.name || !input.email || !input.password) {
      alert("Please fill in all fields");
      return;
    }

    // 3. Save Name/Email to Store (So we can use it later)
    setUserData({ name: input.name, email: input.email });

    // 4. Move to Onboarding
    router.push("/onboarding");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-8 border-primary/20">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-muted">Start your AI fitness journey today.</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-muted uppercase">
              Full Name
            </label>
            <input
              type="text"
              value={input.name}
              onChange={(e) => setInput({ ...input, name: e.target.value })} // Bind input
              className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-muted uppercase">
              Email
            </label>
            <input
              type="email"
              value={input.email}
              onChange={(e) => setInput({ ...input, email: e.target.value })} // Bind input
              className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-muted uppercase">
              Password
            </label>
            <input
              type="password"
              value={input.password}
              onChange={(e) => setInput({ ...input, password: e.target.value })} // Bind input
              className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:border-primary transition-colors"
            />
          </div>

          <Button className="w-full bg-primary text-black font-bold">
            START FREE
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted">
          Already a member?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Log In
          </Link>
        </div>
      </Card>
    </div>
  );
}
