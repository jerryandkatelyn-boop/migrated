"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Zap, Mail, CheckCircle2, Eye, EyeOff, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const isUpdateFlow =
    typeof window !== "undefined" &&
    window.location.hash.includes("type=recovery");

  const handleSendReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (resetError) { setError(resetError.message); setIsLoading(false); return; }
    setEmailSent(true);
    setIsLoading(false);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsUpdating(true);
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      setIsUpdating(false);
      return;
    }
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    if (updateError) { setError(updateError.message); setIsUpdating(false); return; }
    router.push("/dashboard");
  };

  // ── Email sent ───────────────────────────────────────────────────────
  if (emailSent) {
    return (
      <div className="glass-orange rounded-2xl overflow-hidden shadow-card-dark">
        <div className="h-1 w-full bg-gradient-to-r from-sky-500/0 via-sky-500 to-sky-500/0" />
        <div className="p-8 text-center">
          <div className="relative mx-auto w-16 h-16 mb-5">
            <div className="absolute inset-0 rounded-full bg-sky-500/20 blur-md" />
            <div className="relative w-16 h-16 rounded-full bg-sky-500/10 border border-sky-500/30 flex items-center justify-center">
              <Mail className="h-8 w-8 text-sky-400" />
            </div>
          </div>
          <h2 className="font-display text-2xl font-bold mb-2">Check your inbox</h2>
          <p className="text-sm text-muted-foreground mb-1 leading-relaxed">
            We sent a reset link to
          </p>
          <p className="text-sm font-semibold text-foreground mb-8">{email}</p>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  // ── Update password flow ─────────────────────────────────────────────
  if (isUpdateFlow) {
    return (
      <div className="glass-orange rounded-2xl overflow-hidden shadow-card-dark">
        <div className="h-1 w-full bg-gradient-to-r from-primary/0 via-primary to-primary/0" />
        <div className="p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="relative w-14 h-14 mb-4">
              <div className="absolute inset-0 rounded-2xl bg-emerald-500/20 blur-md" />
              <div className="relative w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                <CheckCircle2 className="h-7 w-7 text-emerald-400" />
              </div>
            </div>
            <h1 className="font-display text-2xl font-bold">Set new password</h1>
            <p className="text-sm text-muted-foreground mt-1">Choose a strong password</p>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-display">
                New password
              </Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  disabled={isUpdating}
                  className="h-11 text-sm pr-11 bg-background/60 border-border/60 focus:border-primary/60 focus:ring-primary/20"
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
            </div>

            {error && (
              <div className="flex items-start gap-2.5 text-xs text-destructive bg-destructive/8 border border-destructive/20 rounded-lg px-3.5 py-3">
                <span>⚠ {error}</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={isUpdating}
              className="w-full h-11 text-sm font-semibold bg-primary hover:bg-primary/90 text-white shine-btn glow-orange"
            >
              {isUpdating ? (
                <span className="flex items-center gap-2.5">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Updating…
                </span>
              ) : "Update password"}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  // ── Send reset link ──────────────────────────────────────────────────
  return (
    <div className="glass-orange rounded-2xl overflow-hidden shadow-card-dark">
      <div className="h-1 w-full bg-gradient-to-r from-primary/0 via-primary to-primary/0" />
      <div className="p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-14 h-14 mb-4">
            <div className="absolute inset-0 rounded-2xl bg-primary/20 blur-md" />
            <div className="relative w-14 h-14 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center">
              <Zap className="h-7 w-7 text-primary" strokeWidth={2} />
            </div>
          </div>
          <h1 className="font-display text-2xl font-bold">Reset password</h1>
          <p className="text-sm text-muted-foreground mt-1 text-center">
            Enter your email and we&apos;ll send a reset link
          </p>
        </div>

        <form onSubmit={handleSendReset} className="space-y-5">
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
              className="h-11 text-sm bg-background/60 border-border/60 focus:border-primary/60 focus:ring-primary/20"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2.5 text-xs text-destructive bg-destructive/8 border border-destructive/20 rounded-lg px-3.5 py-3">
              <span>⚠ {error}</span>
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 text-sm font-semibold bg-primary hover:bg-primary/90 text-white shine-btn glow-orange"
          >
            {isLoading ? (
              <span className="flex items-center gap-2.5">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Sending…
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Send reset link
                <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
