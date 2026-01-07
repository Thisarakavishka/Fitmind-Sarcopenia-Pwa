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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // 1. Create User in Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        // This metadata is caught by our SQL trigger to create the Profile
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

    // 2. Save Name/Email to Local Store (for the Onboarding wizard)
    setUserData({ name: formData.name, email: formData.email });

    // 3. Success! Move to Onboarding
    // Note: If you enabled "Confirm Email" in Supabase, you might need to show a "Check your email" message instead.
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
