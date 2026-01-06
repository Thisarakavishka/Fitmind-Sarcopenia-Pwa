"use client";

import Link from "next/link";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-8 border-primary/20">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">FitMind AI</h1>
          <p className="text-muted">Welcome back! Let's hit those goals.</p>
        </div>

        <form className="space-y-4">
          <div>
            <label className="text-xs font-bold text-muted uppercase">
              Email
            </label>
            <input
              type="email"
              placeholder="user@example.com"
              className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-muted uppercase">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <Button className="w-full bg-primary text-black font-bold">
            LOG IN
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted">
          Don't have an account?{" "}
          <Link href="/register" className="text-primary hover:underline">
            Sign Up
          </Link>
        </div>
      </Card>
    </div>
  );
}
