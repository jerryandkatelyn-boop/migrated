"use client";

import { Zap } from "lucide-react";

interface EmptyStateProps {
  onSuggestionClick?: (text: string) => void;
}

export function EmptyState({ onSuggestionClick: _ }: EmptyStateProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 h-full select-none pointer-events-none">
      {/* Logo */}
      <div className="relative w-14 h-14 mb-5">
        <div className="absolute inset-0 rounded-2xl bg-primary/20 blur-xl animate-glow-pulse" />
        <div className="relative w-14 h-14 rounded-2xl bg-card border border-primary/30 flex items-center justify-center shadow-card-dark">
          <Zap className="h-7 w-7 text-primary" strokeWidth={1.5} />
        </div>
      </div>

      <h2 className="font-display text-2xl sm:text-3xl font-bold text-gradient-white mb-2">
        RECOIL AI
      </h2>
      <p className="text-sm text-muted-foreground">
        How can I help you today?
      </p>
    </div>
  );
}
