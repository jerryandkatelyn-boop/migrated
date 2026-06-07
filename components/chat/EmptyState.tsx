"use client";

import { Code, Bug, BookOpen, Rocket, Zap, Terminal, Sparkles, Star, ArrowRight, Check } from "lucide-react";

interface EmptyStateProps {
  onSuggestionClick: (text: string) => void;
}

const suggestions = [
  {
    icon: Code,
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20 hover:border-orange-500/40",
    title: "Generate Script",
    description: "Create a complete player health system",
    prompt:
      "Create a complete player health system for Roblox with health regeneration, damage handling, and a UI health bar. Use modern Roblox best practices with proper client-server architecture.",
  },
  {
    icon: Bug,
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20 hover:border-red-500/40",
    title: "Fix Code",
    description: "Debug a RemoteEvent issue",
    prompt:
      "My RemoteEvent in Roblox isn't working. Here's my code:\n\n-- Server\nlocal RE = Instance.new('RemoteEvent')\nRE.Name = 'DamageEvent'\nRE.Parent = ReplicatedStorage\n\nRE.OnServerEvent:Connect(function(player, target, damage)\n  target.Humanoid.Health -= damage\nend)\n\n-- Client\nlocal RE = ReplicatedStorage:WaitForChild('DamageEvent')\nRE:FireServer(target, 50)\n\nCan you help me fix what's wrong?",
  },
  {
    icon: BookOpen,
    color: "text-sky-400",
    bg: "bg-sky-500/10",
    border: "border-sky-500/20 hover:border-sky-500/40",
    title: "Learn Concept",
    description: "RemoteEvents vs BindableEvents",
    prompt:
      "Explain the difference between RemoteEvents, RemoteFunctions, BindableEvents, and BindableFunctions in Roblox. Include when to use each one with code examples.",
  },
  {
    icon: Rocket,
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20 hover:border-violet-500/40",
    title: "Build System",
    description: "Currency system with DataStore",
    prompt:
      "Design a complete in-game currency system for Roblox with DataStore persistence, leaderstats, earning mechanics, and a shop UI. Include proper error handling and session locking.",
  },
];

export function EmptyState({ onSuggestionClick }: EmptyStateProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-3 sm:px-4 py-6 sm:py-12 min-h-full">
      {/* Logo area */}
      <div className="text-center mb-6 sm:mb-8">
        <div className="relative w-14 h-14 sm:w-18 sm:h-18 mx-auto mb-3 sm:mb-4">
          <div className="absolute inset-0 rounded-2xl bg-primary/20 blur-xl animate-glow-pulse" />
          <div className="relative w-14 h-14 sm:w-18 sm:h-18 rounded-2xl bg-card border border-primary/30 flex items-center justify-center shadow-card-dark">
            <Zap className="h-7 w-7 text-primary" strokeWidth={1.5} />
          </div>
        </div>
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-gradient-white mb-1">
          RECOIL AI
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Your Roblox Development Intelligence Platform
        </p>
      </div>

      {/* Suggestions grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 w-full max-w-2xl mb-5 sm:mb-7">
        {suggestions.map((s, i) => (
          <button
            key={i}
            onClick={() => onSuggestionClick(s.prompt)}
            className={`flex items-start gap-3 p-3 sm:p-4 rounded-xl border ${s.border} bg-card/50 hover:bg-card transition-all duration-200 text-left group active:scale-[0.98]`}
          >
            <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl ${s.bg} border ${s.border} flex items-center justify-center shrink-0`}>
              <s.icon className={`h-4 w-4 ${s.color}`} />
            </div>
            <div className="min-w-0">
              <p className="font-display text-xs sm:text-sm font-semibold text-foreground mb-0.5">
                {s.title}
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {s.description}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* ── Pro Upgrade Banner ──────────────────────────────────────── */}
      <div className="w-full max-w-2xl mb-5 sm:mb-7">
        <div className="relative overflow-hidden rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/10 via-card to-violet-500/10 p-4 sm:p-5">
          {/* Decorative glow */}
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-primary/15 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-violet-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Icon */}
            <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
              <Star className="h-5 w-5 text-primary" />
            </div>

            {/* Copy */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="font-display text-sm font-bold text-foreground">
                  Upgrade to Pro
                </span>
                <span className="text-[9px] px-2 py-0.5 rounded-full border border-primary/30 bg-primary/10 text-primary font-display font-semibold uppercase tracking-wider">
                  Coming Soon
                </span>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {["Unlimited messages", "Priority AI access", "Advanced code review"].map((item) => (
                  <span key={item} className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Check className="h-3 w-3 text-primary/70 shrink-0" />
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Price */}
            <div className="flex items-center gap-2 sm:flex-col sm:items-end sm:gap-0 shrink-0">
              <div className="flex items-baseline gap-0.5">
                <span className="font-display text-2xl font-bold text-primary">$9</span>
                <span className="text-xs text-muted-foreground">/mo</span>
              </div>
              <div className="flex items-center gap-1 sm:mt-1 text-[10px] text-primary/70 font-medium">
                <span>Get notified</span>
                <ArrowRight className="h-3 w-3" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Capability pills */}
      <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
        {[
          { icon: Zap,      label: "Code Generation" },
          { icon: Bug,      label: "Bug Fixing" },
          { icon: BookOpen, label: "Teaching" },
          { icon: Terminal, label: "Architecture" },
        ].map((cap, i) => (
          <div
            key={i}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-border/50 bg-card/30 text-xs text-muted-foreground"
          >
            <cap.icon className="h-3 w-3 text-primary/70" />
            {cap.label}
          </div>
        ))}
        <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-primary/20 bg-primary/5 text-xs text-primary/80">
          <Sparkles className="h-3 w-3" />
          Luau-native AI
        </div>
      </div>
    </div>
  );
}
