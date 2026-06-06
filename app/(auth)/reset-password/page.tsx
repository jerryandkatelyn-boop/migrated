"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Terminal, Mail, CheckCircle, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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

  // Detect if we're in the "update password" flow (came from email link)
  const isUpdateFlow =
    typeof window !== "undefined" &&
    window.location.hash.includes("type=recovery");

  const handleSendReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      {
        redirectTo: `${window.location.origin}/reset-password`,
      }
    );

    if (resetError) {
      setError(resetError.message);
      setIsLoading(false);
      return;
    }

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
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      setError(updateError.message);
      setIsUpdating(false);
      return;
    }

    router.push("/");
  };

  if (emailSent) {
    return (
      <Card className="border-border/50 shadow-2xl">
        <CardContent className="pt-8 pb-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Mail className="h-7 w-7 text-blue-500" />
            </div>
            <div>
              <h2 className="font-bold text-lg">Check your inbox</h2>
              <p className="text-sm text-muted-foreground mt-1">
                We sent a reset link to{" "}
                <span className="font-medium text-foreground">{email}</span>.
                Click it to set a new password.
              </p>
            </div>
            <Link href="/login" className="text-xs text-primary hover:underline block">
              Back to sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isUpdateFlow) {
    return (
      <Card className="border-border/50 shadow-2xl">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <CheckCircle className="h-7 w-7 text-primary" />
          </div>
          <CardTitle className="text-xl font-bold">Set new password</CardTitle>
          <CardDescription className="text-sm mt-1">
            Choose a strong password for your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="newPassword" className="text-xs font-medium">
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
                  className="h-9 text-sm pr-9"
                  disabled={isUpdating}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
            {error && (
              <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
                {error}
              </p>
            )}
            <Button type="submit" className="w-full h-9 text-sm" disabled={isUpdating}>
              {isUpdating ? (
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Updating...
                </div>
              ) : "Update password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 shadow-2xl">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
          <Terminal className="h-7 w-7 text-primary" />
        </div>
        <CardTitle className="text-xl font-bold">Reset your password</CardTitle>
        <CardDescription className="text-sm mt-1">
          Enter your email and we'll send you a reset link
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <form onSubmit={handleSendReset} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-medium">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="h-9 text-sm"
              disabled={isLoading}
            />
          </div>
          {error && (
            <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
              {error}
            </p>
          )}
          <Button type="submit" className="w-full h-9 text-sm" disabled={isLoading}>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Sending...
              </div>
            ) : "Send reset link"}
          </Button>
        </form>
        <div className="text-center">
          <Link href="/login" className="text-xs text-muted-foreground hover:text-foreground">
            ← Back to sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
