"use client";

import { cn } from "@/lib/utils";
import { Zap, AlertTriangle, Star } from "lucide-react";

interface UsageBarProps {
  used: number;
  limit: number;
  remaining: number;
  hasReachedLimit: boolean;
}

export function UsageBar({ used, limit, hasReachedLimit }: UsageBarProps) {
  const percentage = Math.min(100, (used / limit) * 100);
  const isNearLimit = percentage >= 80 && !hasReachedLimit;

  const barColor = hasReachedLimit
    ? "bg-destructive"
    : isNearLimit
    ? "bg-amber-500"
    : "bg-primary";

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-2 border-b shrink-0 transition-colors",
        hasReachedLimit
          ? "border-destructive/20 bg-destructive/5"
          : isNearLimit
          ? "border-amber-500/20 bg-amber-500/5"
          : "border-border/40 bg-background/50"
      )}
    >
      {/* Icon */}
      <Zap
        className={cn(
          "h-3.5 w-3.5 shrink-0",
          hasReachedLimit ? "text-destructive" : isNearLimit ? "text-amber-500" : "text-primary/70"
        )}
      />

      {/* Bar + label */}
      <div className="flex-1 flex items-center gap-3 min-w-0">
        <div className="flex-1 h-1 rounded-full bg-border/50 overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all duration-500", barColor)}
            style={{ width: `${percentage}%` }}
          />
        </div>

        <span
          className={cn(
            "text-[11px] font-mono font-medium whitespace-nowrap shrink-0 tabular-nums",
            hasReachedLimit ? "text-destructive" : isNearLimit ? "text-amber-500" : "text-muted-foreground"
          )}
        >
          {used}
          <span className="text-muted-foreground/50">/{limit}</span>
        </span>
      </div>

      {/* Status / CTA */}
      {hasReachedLimit ? (
        <div className="flex items-center gap-1.5 shrink-0">
          <AlertTriangle className="h-3 w-3 text-destructive" />
          <span className="text-[10px] font-display font-semibold uppercase tracking-wider text-destructive hidden sm:inline">
            Limit reached
          </span>
          <div className="flex items-center gap-1 ml-1 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/30 cursor-pointer hover:bg-primary/20 transition-colors">
            <Star className="h-2.5 w-2.5 text-primary" />
            <span className="text-[9px] font-display font-bold uppercase tracking-wider text-primary">
              Go Pro
            </span>
          </div>
        </div>
      ) : isNearLimit ? (
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/30 cursor-pointer hover:bg-primary/20 transition-colors">
            <Star className="h-2.5 w-2.5 text-primary" />
            <span className="text-[9px] font-display font-bold uppercase tracking-wider text-primary">
              Upgrade
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
