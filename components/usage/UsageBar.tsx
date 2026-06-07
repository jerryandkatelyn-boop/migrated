"use client";

import { cn } from "@/lib/utils";
import { Zap, AlertTriangle } from "lucide-react";

interface UsageBarProps {
  used: number;
  limit: number;
  remaining: number;
  hasReachedLimit: boolean;
}

export function UsageBar({ used, limit, hasReachedLimit }: UsageBarProps) {
  const percentage = Math.min(100, (used / limit) * 100);

  const barColor = hasReachedLimit
    ? "bg-destructive"
    : percentage > 75
    ? "bg-amber-500"
    : "bg-primary";

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-2 border-b shrink-0 transition-colors",
        hasReachedLimit
          ? "border-destructive/20 bg-destructive/5"
          : "border-border/40 bg-background/50"
      )}
    >
      {/* Icon */}
      <Zap
        className={cn(
          "h-3.5 w-3.5 shrink-0",
          hasReachedLimit ? "text-destructive" : "text-primary/70"
        )}
      />

      {/* Bar + label */}
      <div className="flex-1 flex items-center gap-3 min-w-0">
        {/* Track */}
        <div className="flex-1 h-1 rounded-full bg-border/50 overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all duration-500", barColor)}
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Count */}
        <span
          className={cn(
            "text-[11px] font-mono font-medium whitespace-nowrap shrink-0 tabular-nums",
            hasReachedLimit ? "text-destructive" : "text-muted-foreground"
          )}
        >
          {used}
          <span className="text-muted-foreground/50">/{limit}</span>
        </span>
      </div>

      {/* Limit warning */}
      {hasReachedLimit && (
        <div className="flex items-center gap-1 shrink-0">
          <AlertTriangle className="h-3 w-3 text-destructive" />
          <span className="text-[10px] font-display font-semibold uppercase tracking-wider text-destructive">
            Limit reached
          </span>
        </div>
      )}
    </div>
  );
}
