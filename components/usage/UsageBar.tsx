"use client";

import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { AlertTriangle, Zap } from "lucide-react";

interface UsageBarProps {
  used: number;
  limit: number;
  remaining: number;
  hasReachedLimit: boolean;
}

export function UsageBar({
  used,
  limit,
  hasReachedLimit,
}: UsageBarProps) {
  const percentage = Math.min(100, (used / limit) * 100);

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-2 border-b border-border shrink-0",
        hasReachedLimit ? "bg-destructive/5" : "bg-background"
      )}
    >
      <Zap
        className={cn(
          "h-3.5 w-3.5 shrink-0",
          hasReachedLimit ? "text-destructive" : "text-primary"
        )}
      />
      <div className="flex-1 flex items-center gap-3">
        <Progress
          value={percentage}
          className={cn(
            "h-1.5 flex-1",
            hasReachedLimit && "bg-destructive/20"
          )}
        />
        <span
          className={cn(
            "text-[10px] font-medium whitespace-nowrap",
            hasReachedLimit ? "text-destructive" : "text-muted-foreground"
          )}
        >
          {used}/{limit} messages
        </span>
      </div>
      {hasReachedLimit && (
        <div className="flex items-center gap-1 text-destructive">
          <AlertTriangle className="h-3 w-3" />
          <span className="text-[10px] font-medium">Limit reached</span>
        </div>
      )}
    </div>
  );
}
