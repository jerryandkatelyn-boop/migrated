"use client";

import { Code, Bug, BookOpen, Rocket, Zap, Terminal } from "lucide-react";

interface EmptyStateProps {
  onSuggestionClick: (text: string) => void;
}

const suggestions = [
  {
    icon: Code,
    title: "Generate Script",
    description: "Create a complete player health system with regeneration",
    prompt:
      "Create a complete player health system for Roblox with health regeneration, damage handling, and a UI health bar. Use modern Roblox best practices with proper client-server architecture.",
  },
  {
    icon: Bug,
    title: "Fix Code",
    description: "Debug this RemoteEvent that's not firing properly",
    prompt:
      "My RemoteEvent in Roblox isn't working. Here's my code:\n\n-- Server\nlocal RE = Instance.new('RemoteEvent')\nRE.Name = 'DamageEvent'\nRE.Parent = ReplicatedStorage\n\nRE.OnServerEvent:Connect(function(player, target, damage)\n  target.Humanoid.Health -= damage\nend)\n\n-- Client\nlocal RE = ReplicatedStorage:WaitForChild('DamageEvent')\nRE:FireServer(target, 50)\n\nCan you help me fix what's wrong?",
  },
  {
    icon: BookOpen,
    title: "Learn Concept",
    description: "Explain the difference between RemoteEvents and BindableEvents",
    prompt:
      "Explain the difference between RemoteEvents, RemoteFunctions, BindableEvents, and BindableFunctions in Roblox. Include when to use each one with code examples.",
  },
  {
    icon: Rocket,
    title: "Build System",
    description: "Design a currency system with DataStore persistence",
    prompt:
      "Design a complete in-game currency system for Roblox with DataStore persistence, leaderstats, earning mechanics, and a shop UI. Include proper error handling and session locking.",
  },
];

export function EmptyState({ onSuggestionClick }: EmptyStateProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
      {/* Logo */}
      <div className="mb-6">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 mx-auto">
          <Terminal className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-center tracking-tight">
          RECOIL AI
        </h2>
        <p className="text-sm text-muted-foreground text-center mt-1">
          Your Roblox Development Intelligence Platform
        </p>
      </div>

      {/* Suggestions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl mt-4">
        {suggestions.map((suggestion, i) => (
          <button
            key={i}
            onClick={() => onSuggestionClick(suggestion.prompt)}
            className="flex items-start gap-3 p-4 rounded-lg border border-border bg-muted/30 hover:bg-muted/60 hover:border-primary/30 transition-all text-left group"
          >
            <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
              <suggestion.icon className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-medium">{suggestion.title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                {suggestion.description}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Capabilities */}
      <div className="flex items-center gap-6 mt-8 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Zap className="h-3 w-3" />
          <span>Code Generation</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Bug className="h-3 w-3" />
          <span>Bug Fixing</span>
        </div>
        <div className="flex items-center gap-1.5">
          <BookOpen className="h-3 w-3" />
          <span>Teaching</span>
        </div>
      </div>
    </div>
  );
}
