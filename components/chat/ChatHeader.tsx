"use client";

import { useTheme } from "next-themes";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Moon, Sun, PanelLeftOpen, Zap, ChevronDown } from "lucide-react";

interface ChatHeaderProps {
  selectedModel: string;
  selectedProvider: string;
  onModelChange: (model: string) => void;
  onProviderChange: (provider: string) => void;
  models: Array<{ provider: string; providerName: string; model: string; label: string }>;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export function ChatHeader({
  selectedModel, onModelChange, onProviderChange,
  models, sidebarOpen, onToggleSidebar,
}: ChatHeaderProps) {
  const { theme, setTheme } = useTheme();

  const groupedModels = models.reduce((acc, m) => {
    if (!acc[m.provider]) acc[m.provider] = [];
    acc[m.provider].push(m);
    return acc;
  }, {} as Record<string, typeof models>);

  const currentModel = models.find((m) => m.model === selectedModel);

  return (
    <header className="h-14 border-b border-border/50 flex items-center justify-between px-4 bg-background/80 backdrop-blur-xl shrink-0 relative z-20">
      {/* Left */}
      <div className="flex items-center gap-3">
        {!sidebarOpen && (
          <button
            onClick={onToggleSidebar}
            className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          >
            <PanelLeftOpen className="h-4 w-4" />
          </button>
        )}

        {!sidebarOpen && (
          <div className="flex items-center gap-2 pl-1 border-l border-border/50">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-display text-xs font-bold tracking-widest uppercase">
              RECOIL AI
            </span>
          </div>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Model selector */}
        <Select
          value={selectedModel}
          onValueChange={(value) => {
            onModelChange(value);
            const m = models.find((m) => m.model === value);
            if (m) onProviderChange(m.provider);
          }}
        >
          <SelectTrigger className="h-8 text-xs border-border/60 bg-card/60 hover:bg-card hover:border-border gap-2 pr-2.5 pl-3 min-w-[180px] max-w-[260px] transition-all">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
              <SelectValue placeholder="Select model">
                {currentModel ? (
                  <span className="truncate font-mono text-[11px]">
                    {currentModel.label || currentModel.model}
                  </span>
                ) : null}
              </SelectValue>
            </div>
            <ChevronDown className="h-3 w-3 text-muted-foreground shrink-0" />
          </SelectTrigger>
          <SelectContent className="min-w-[260px]">
            {Object.entries(groupedModels).map(([provider, providerModels]) => (
              <div key={provider}>
                <div className="px-3 py-1.5 text-[10px] font-display font-semibold text-muted-foreground uppercase tracking-widest">
                  {providerModels[0]?.providerName || provider}
                </div>
                {providerModels.map((m) => (
                  <SelectItem key={m.model} value={m.model} className="font-mono text-xs py-2">
                    {m.label || m.model}
                  </SelectItem>
                ))}
                <div className="my-1 border-t border-border/40" />
              </div>
            ))}
          </SelectContent>
        </Select>

        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>
    </header>
  );
}
