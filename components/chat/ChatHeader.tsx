"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Moon, Sun, PanelLeftOpen, Zap, Settings, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface BrandedModel {
  id: string;
  name: string;
  tier: "fast" | "balanced" | "powerful";
  tagline: string;
  provider: string;
  model: string;
  badge: string;
}

interface ChatHeaderProps {
  selectedBrandedModel: string;
  onBrandedModelChange: (brandedId: string, provider: string, model: string) => void;
  brandedModels: BrandedModel[];
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onOpenSettings?: () => void;
}

const tierMeta: Record<string, { color: string; dot: string; glow: string }> = {
  fast:      { color: "text-emerald-400", dot: "bg-emerald-400",  glow: "shadow-[0_0_8px_rgba(52,211,153,0.4)]" },
  balanced:  { color: "text-primary",     dot: "bg-primary",       glow: "shadow-[0_0_8px_rgba(249,115,22,0.4)]" },
  powerful:  { color: "text-violet-400",  dot: "bg-violet-400",    glow: "shadow-[0_0_8px_rgba(167,139,250,0.4)]" },
};

export function ChatHeader({
  selectedBrandedModel,
  onBrandedModelChange,
  brandedModels,
  sidebarOpen,
  onToggleSidebar,
  onOpenSettings,
}: ChatHeaderProps) {
  const { theme, setTheme } = useTheme();
  const current = brandedModels.find((m) => m.id === selectedBrandedModel) ?? brandedModels[0];
  const meta = current ? tierMeta[current.tier] : tierMeta.balanced;

  return (
    <header className="h-14 border-b border-border/50 flex items-center justify-between px-3 sm:px-4 bg-background/80 backdrop-blur-xl shrink-0 relative z-20">
      {/* Left */}
      <div className="flex items-center gap-2 sm:gap-3">
        {!sidebarOpen && (
          <button
            onClick={onToggleSidebar}
            className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Open sidebar"
          >
            <PanelLeftOpen className="h-4 w-4" />
          </button>
        )}

        {!sidebarOpen && (
          <div className="flex items-center gap-2 pl-1 border-l border-border/50">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-display text-xs font-bold tracking-widest uppercase hidden sm:inline">
              RECOIL AI
            </span>
          </div>
        )}
      </div>

      {/* Center — Branded model picker */}
      <div className="absolute left-1/2 -translate-x-1/2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border/60 bg-card/60 hover:bg-card hover:border-border transition-all duration-200 group">
              {/* Dot */}
              <div className={cn("w-2 h-2 rounded-full shrink-0", meta.dot, meta.glow)} />

              {/* Name + badge */}
              <span className="font-display text-sm font-bold tracking-wide text-foreground">
                {current?.name ?? "Model"}
              </span>
              <span className={cn(
                "hidden sm:inline text-[10px] font-medium px-1.5 py-0.5 rounded-full border font-display uppercase tracking-wider",
                current?.tier === "fast"     && "text-emerald-400 border-emerald-400/30 bg-emerald-400/10",
                current?.tier === "balanced" && "text-primary border-primary/30 bg-primary/10",
                current?.tier === "powerful" && "text-violet-400 border-violet-400/30 bg-violet-400/10",
              )}>
                {current?.badge}
              </span>
              <ChevronDown className="h-3 w-3 text-muted-foreground group-hover:text-foreground transition-colors" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="center" className="w-64 p-1.5">
            <p className="text-[10px] font-display font-semibold uppercase tracking-widest text-muted-foreground/60 px-2 pb-1.5 pt-0.5">
              Choose your model
            </p>
            {brandedModels.map((m) => {
              const mMeta = tierMeta[m.tier];
              const isSelected = m.id === selectedBrandedModel;
              return (
                <DropdownMenuItem
                  key={m.id}
                  onClick={() => onBrandedModelChange(m.id, m.provider, m.model)}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg cursor-pointer mb-0.5",
                    isSelected && "bg-accent"
                  )}
                >
                  {/* Icon dot */}
                  <div className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0", mMeta.dot, isSelected && mMeta.glow)} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-display text-sm font-semibold">{m.name}</span>
                      <span className={cn(
                        "text-[9px] font-display font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full border",
                        m.tier === "fast"     && "text-emerald-400 border-emerald-400/30 bg-emerald-400/10",
                        m.tier === "balanced" && "text-primary border-primary/30 bg-primary/10",
                        m.tier === "powerful" && "text-violet-400 border-violet-400/30 bg-violet-400/10",
                      )}>
                        {m.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                      {m.tagline}
                    </p>
                  </div>
                  {isSelected && (
                    <div className={cn("w-1.5 h-1.5 rounded-full mt-1.5 shrink-0", mMeta.dot)} />
                  )}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Settings */}
        {onOpenSettings && (
          <button
            onClick={onOpenSettings}
            className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Settings"
          >
            <Settings className="h-4 w-4" />
          </button>
        )}

        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>
    </header>
  );
}
