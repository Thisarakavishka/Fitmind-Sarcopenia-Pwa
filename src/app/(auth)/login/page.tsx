"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.refresh();
      router.push("/home");
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
        queryParams: { access_type: "offline", prompt: "consent" },
      },
    });
    if (error) alert("Could not connect to Google.");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {/* COMPACT CARD: max-w-sm */}
      <Card className="w-full max-w-sm p-6 border-white/10 bg-surface shadow-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white mb-1">FitMind AI</h1>
          <p className="text-muted text-xs">
            Welcome back! Let's hit those goals.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-2.5 rounded-lg mb-4 text-xs text-center font-bold">
            {error}
          </div>
        )}

        {/* --- GOOGLE LOGIN (Compact) --- */}
        <div className="mb-5">
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full bg-white text-gray-900 font-bold h-10 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors border border-transparent text-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.11c-.22-.66-.35-1.36-.35-2.11s.13-1.45.35-2.11V7.05H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.95l3.66-2.84z"
              />
              <path
                fill="#EA4335"
                d="M12 4.62c1.61 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.09 14.97 0 12 0 7.7 0 3.99 2.47 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>
        </div>

        {/* Divider */}
        <div className="relative mb-5">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
            <span className="bg-[#0a0a0a] px-2 text-muted">
              Or login with email
            </span>
          </div>
        </div>

        {/* --- EMAIL FORM --- */}
        <form onSubmit={handleLogin} className="space-y-3">
          <div>
            <label className="text-[10px] font-bold text-muted uppercase block mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full bg-black/20 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-primary transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-muted uppercase block mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full bg-black/20 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-primary transition-colors"
              placeholder="••••••••"
            />
          </div>

          <Button
            disabled={loading}
            className="w-full bg-primary text-black font-bold h-10 text-sm mt-2"
          >
            {loading ? "Logging In..." : "Log In"}
          </Button>
        </form>

        <div className="mt-5 text-center text-xs text-muted">
          Don't have an account?{" "}
          <Link
            href="/register"
            className="text-primary hover:underline font-bold"
          >
            Sign Up
          </Link>
        </div>
      </Card>
    </div>
  );
}
