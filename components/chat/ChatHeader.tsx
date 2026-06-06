"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Moon, Sun, PanelLeftOpen, Bot } from "lucide-react";
import { useTheme } from "@/components/providers/theme-provider";

interface ChatHeaderProps {
  selectedModel: string;
  selectedProvider: string;
  onModelChange: (model: string) => void;
  onProviderChange: (provider: string) => void;
  models: Array<{
    provider: string;
    providerName: string;
    model: string;
    label: string;
  }>;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export function ChatHeader({
  selectedModel,
  onModelChange,
  onProviderChange,
  models,
  sidebarOpen,
  onToggleSidebar,
}: ChatHeaderProps) {
  const { theme, setTheme } = useTheme();

  // Group models by provider
  const groupedModels = models.reduce(
    (acc, m) => {
      if (!acc[m.provider]) acc[m.provider] = [];
      acc[m.provider].push(m);
      return acc;
    },
    {} as Record<string, typeof models>
  );

  return (
    <header className="h-14 border-b border-border flex items-center justify-between px-4 bg-background/80 backdrop-blur-md shrink-0">
      <div className="flex items-center gap-3">
        {!sidebarOpen && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onToggleSidebar}
          >
            <PanelLeftOpen className="h-4 w-4" />
          </Button>
        )}
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <h1 className="font-semibold text-sm">RECOIL AI</h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Model Selector */}
        <Select
          value={selectedModel}
          onValueChange={(value) => {
            onModelChange(value);
            const model = models.find((m) => m.model === value);
            if (model) {
              onProviderChange(model.provider);
            }
          }}
        >
          <SelectTrigger className="w-[240px] h-8 text-xs">
            <SelectValue placeholder="Select model" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(groupedModels).map(([provider, providerModels]) => (
              <div key={provider}>
                <div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  {providerModels[0]?.providerName || provider}
                </div>
                {providerModels.map((m) => (
                  <SelectItem key={m.model} value={m.model} className="text-xs">
                    {m.model}
                  </SelectItem>
                ))}
              </div>
            ))}
          </SelectContent>
        </Select>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>
      </div>
    </header>
  );
}
