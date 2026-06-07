"use client";

import { useState } from "react";
import Link from "next/link";
import { Zap, Eye, EyeOff, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      setIsLoading(false);
      return;
    }

    const supabase = createClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: name.trim() },
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setIsLoading(false);
      return;
    }

    setSuccess(true);
    setIsLoading(false);
  };

  // ── Success state ────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="glass-orange rounded-2xl overflow-hidden shadow-card-dark">
        <div className="h-1 w-full bg-gradient-to-r from-emerald-500/0 via-emerald-500 to-emerald-500/0" />
        <div className="p-8 text-center">
          <div className="relative mx-auto w-16 h-16 mb-5">
            <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-md" />
            <div className="relative w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-emerald-400" />
            </div>
          </div>
          <h2 className="font-display text-2xl font-bold mb-2">Check your email</h2>
          <p className="text-sm text-muted-foreground mb-1 leading-relaxed">
            We sent a confirmation link to
          </p>
          <p className="text-sm font-semibold text-foreground mb-6">{email}</p>
          <p className="text-xs text-muted-foreground mb-6">
            Click the link to activate your account and start building.
          </p>
          <p className="text-xs text-muted-foreground">
            Already confirmed?{" "}
            <Link href="/login" className="text-primary hover:text-primary/80 font-semibold transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    );
  }

  // ── Signup form ──────────────────────────────────────────────────────
  return (
    <div className="glass-orange rounded-2xl overflow-hidden shadow-card-dark">
      <div className="h-1 w-full bg-gradient-to-r from-primary/0 via-primary to-primary/0" />
      <div className="p-8">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-14 h-14 mb-4">
            <div className="absolute inset-0 rounded-2xl bg-primary/20 blur-md" />
            <div className="relative w-14 h-14 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center">
              <Zap className="h-7 w-7 text-primary" strokeWidth={2} />
            </div>
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            Create your account
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Start building with RECOIL AI for free
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSignup} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-display">
              Display name
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
              disabled={isLoading}
              className="h-11 text-sm bg-background/60 border-border/60 focus:border-primary/60 focus:ring-primary/20 transition-all"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-display">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              disabled={isLoading}
              className="h-11 text-sm bg-background/60 border-border/60 focus:border-primary/60 focus:ring-primary/20 transition-all"
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-display">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                disabled={isLoading}
                className="h-11 text-sm pr-11 bg-background/60 border-border/60 focus:border-primary/60 focus:ring-primary/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-muted-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {/* Password strength indicator */}
            <div className="flex gap-1 mt-1.5">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`h-0.5 flex-1 rounded-full transition-all duration-300 ${
                    password.length === 0
                      ? "bg-border/40"
                      : password.length < 6
                      ? i === 1 ? "bg-red-500" : "bg-border/40"
                      : password.length < 8
                      ? i <= 2 ? "bg-amber-500" : "bg-border/40"
                      : password.length < 12
                      ? i <= 3 ? "bg-emerald-500" : "bg-border/40"
                      : "bg-emerald-500"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2.5 text-xs text-destructive bg-destructive/8 border border-destructive/20 rounded-lg px-3.5 py-3">
              <span className="shrink-0 mt-0.5">⚠</span>
              <span>{error}</span>
            </div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 text-sm font-semibold bg-primary hover:bg-primary/90 text-white shine-btn glow-orange transition-all mt-2"
          >
            {isLoading ? (
              <span className="flex items-center gap-2.5">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating account…
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Create free account
                <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border/50" />
          </div>
          <div className="relative flex justify-center text-[11px] text-muted-foreground/50">
            <span className="bg-card px-3">or</span>
          </div>
        </div>

        {/* Login link */}
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:text-primary/80 font-semibold transition-colors">
            Sign in
          </Link>
        </p>

        <p className="text-center text-[11px] text-muted-foreground/50 mt-4">
          By signing up, you agree to our Terms of Service.
        </p>
      </div>
    </div>
  );
}
