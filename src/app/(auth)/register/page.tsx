"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { useUserStore } from "../../../lib/store/userStore";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();
  const setUserData = useUserStore((state) => state.setUserData);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  // 1. Google Signup Flow
  const handleGoogleLogin = async () => {
    // Note: When a user signs up with Google, our SQL Trigger (handle_new_user)
    // automatically creates their entry in the 'profiles' table.
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
        queryParams: { access_type: "offline", prompt: "consent" },
      },
    });

    if (error) alert("Google Signup Failed");
  };

  // 2. Email Signup Flow
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Step A: Create User in Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        // We pass metadata so the SQL Trigger can grab the name
        data: {
          full_name: formData.name,
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Step B: Save basic info to Zustand (Short-term memory)
    // This pre-fills the Onboarding Wizard so they don't have to type it again.
    setUserData({ name: formData.name, email: formData.email });

    // Step C: Redirect
    // If you have "Confirm Email" disabled in Supabase, this goes straight to onboarding.
    router.push("/onboarding");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md p-8 border-primary/20">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-muted">Start your AI fitness journey today.</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg mb-4 text-sm text-center">
            {error}
          </div>
        )}

        {/* --- GOOGLE SIGNUP --- */}
        <div className="mb-6">
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full bg-white text-gray-900 font-bold h-12 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-100 transition-colors border-2 border-transparent hover:border-gray-200"
          >
            {/* Official Google G Logo SVG */}
            <svg className="w-5 h-5" viewBox="0 0 24 24">
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
            CONTINUE WITH GOOGLE
          </button>
        </div>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#0a0a0a] px-2 text-muted">
              Or sign up with email
            </span>
          </div>
        </div>

        {/* --- EMAIL FORM --- */}
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-muted uppercase">
              Full Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:border-primary transition-colors"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-muted uppercase">
              Email
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:border-primary transition-colors"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-muted uppercase">
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:border-primary transition-colors"
            />
          </div>

          <Button
            disabled={loading}
            className="w-full bg-primary text-black font-bold h-12"
          >
            {loading ? "CREATING..." : "START FREE"}
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
