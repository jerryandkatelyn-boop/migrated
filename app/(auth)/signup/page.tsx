"use client";

import { useState } from "react";
import Link from "next/link";
import { Terminal, Zap, Eye, EyeOff, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
        data: {
          full_name: name.trim(),
        },
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

  if (success) {
    return (
      <Card className="border-border/50 shadow-2xl">
        <CardContent className="pt-8 pb-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle className="h-7 w-7 text-emerald-500" />
            </div>
            <div>
              <h2 className="font-bold text-lg">Check your email</h2>
              <p className="text-sm text-muted-foreground mt-1">
                We sent a confirmation link to{" "}
                <span className="font-medium text-foreground">{email}</span>.
                Click it to activate your account.
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Already confirmed?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
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
        <CardTitle className="text-xl font-bold tracking-tight">
          Create your account
        </CardTitle>
        <CardDescription className="text-sm mt-1">
          Start building with RECOIL AI for free
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs font-medium">
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
              className="h-9 text-sm"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-medium">
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
              className="h-9 text-sm"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-medium">
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
                className="h-9 text-sm pr-9"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-3.5 w-3.5" />
                ) : (
                  <Eye className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          <Button
            type="submit"
            className="w-full h-9 text-sm"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Creating account...
              </div>
            ) : (
              <>
                <Zap className="mr-2 h-3.5 w-3.5" />
                Create free account
              </>
            )}
          </Button>
        </form>

        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-primary hover:underline font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>

        <p className="text-[10px] text-muted-foreground text-center">
          By signing up, you agree to our Terms of Service.
          Free tier: 20 messages per day.
        </p>
      </CardContent>
    </Card>
  );
}
