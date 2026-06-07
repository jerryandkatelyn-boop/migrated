"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  User as UserIcon,
  Palette,
  Zap,
  Shield,
  Moon,
  Sun,
  Check,
  LogOut,
} from "lucide-react";
import type { User } from "@/types/database";
import { useAuth } from "@/hooks/useAuth";

export interface BrandedModel {
  id: string;
  name: string;
  tier: "fast" | "balanced" | "powerful";
  tagline: string;
  badge: string;
}

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
  brandedModels: BrandedModel[];
  selectedBrandedModel: string;
  onBrandedModelChange: (id: string, provider: string, model: string) => void;
  resolveModel: (id: string) => { provider: string; model: string };
}

type Tab = "account" | "models" | "appearance";

const tabs: { id: Tab; label: string; icon: typeof UserIcon }[] = [
  { id: "account",    label: "Account",    icon: UserIcon },
  { id: "models",     label: "AI Models",  icon: Zap },
  { id: "appearance", label: "Appearance", icon: Palette },
];

const tierStyles: Record<string, { color: string; border: string; bg: string; dot: string }> = {
  fast:      { color: "text-emerald-400", border: "border-emerald-400/30", bg: "bg-emerald-400/10", dot: "bg-emerald-400" },
  balanced:  { color: "text-orange-400",  border: "border-orange-400/30",  bg: "bg-orange-400/10",  dot: "bg-orange-400" },
  powerful:  { color: "text-violet-400",  border: "border-violet-400/30",  bg: "bg-violet-400/10",  dot: "bg-violet-400" },
};

export function SettingsModal({
  open,
  onClose,
  user,
  brandedModels,
  selectedBrandedModel,
  onBrandedModelChange,
  resolveModel,
}: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>("account");
  const { theme, setTheme } = useTheme();
  const { logout } = useAuth();

  const initials = user?.name?.charAt(0)?.toUpperCase() ?? user?.email?.charAt(0)?.toUpperCase() ?? "?";

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-[580px] w-full p-0 gap-0 overflow-hidden bg-background border border-border/60 shadow-2xl">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle className="font-display text-base font-bold tracking-wide">Settings</DialogTitle>
        </DialogHeader>

        <div className="flex mt-4">
          {/* Sidebar tabs */}
          <nav className="w-40 shrink-0 border-r border-border/50 px-2 pb-6 space-y-0.5">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all",
                  activeTab === tab.id
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <tab.icon className="h-3.5 w-3.5 shrink-0" />
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Tab content */}
          <div className="flex-1 px-6 pb-6 pt-2 min-h-[340px]">

            {/* ── Account ─────────────────────────────────────────── */}
            {activeTab === "account" && (
              <div className="space-y-5">
                {/* Avatar + name */}
                <div className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border/60">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/60 to-primary/20 border border-primary/30 flex items-center justify-center text-xl font-display font-bold text-primary shrink-0">
                    {initials}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{user?.name ?? "User"}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{user?.email}</p>
                    {user?.role === "admin" && (
                      <div className="flex items-center gap-1 mt-1.5">
                        <Shield className="h-3 w-3 text-amber-400" />
                        <span className="text-[10px] text-amber-400 font-medium">Admin</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Fields */}
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Display Name</Label>
                    <Input
                      defaultValue={user?.name ?? ""}
                      placeholder="Your name"
                      className="h-9 text-sm bg-card border-border/60"
                      readOnly
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email</Label>
                    <Input
                      defaultValue={user?.email ?? ""}
                      placeholder="you@example.com"
                      className="h-9 text-sm bg-card border-border/60"
                      readOnly
                    />
                  </div>
                </div>

                {/* Account stats */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-xl bg-card border border-border/50 text-center">
                    <p className="font-display text-lg font-bold text-primary">20</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Daily messages</p>
                  </div>
                  <div className="p-3 rounded-xl bg-card border border-border/50 text-center">
                    <p className="font-display text-lg font-bold text-foreground capitalize">{user?.role ?? "user"}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Account tier</p>
                  </div>
                </div>

                {/* Sign out */}
                <div className="pt-2 border-t border-border/40">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { logout(); onClose(); }}
                    className="w-full h-9 text-xs border-destructive/30 text-destructive hover:bg-destructive/10 hover:border-destructive/50"
                  >
                    <LogOut className="h-3.5 w-3.5 mr-2" />
                    Sign out
                  </Button>
                </div>
              </div>
            )}

            {/* ── AI Models ───────────────────────────────────────── */}
            {activeTab === "models" && (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                  Choose your default AI model. You can also switch mid-conversation from the header.
                </p>
                {brandedModels.map((m) => {
                  const s = tierStyles[m.tier];
                  const isSelected = m.id === selectedBrandedModel;
                  const resolved = resolveModel(m.id);
                  return (
                    <button
                      key={m.id}
                      onClick={() => onBrandedModelChange(m.id, resolved.provider, resolved.model)}
                      className={cn(
                        "w-full flex items-center gap-3.5 p-4 rounded-xl border text-left transition-all duration-200",
                        isSelected
                          ? "bg-primary/8 border-primary/30"
                          : "bg-card border-border/60 hover:border-border hover:bg-card/80"
                      )}
                    >
                      {/* Dot */}
                      <div className={cn("w-2.5 h-2.5 rounded-full shrink-0", s.dot)} />

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-display text-sm font-bold">{m.name}</span>
                          <span className={cn("text-[9px] font-display font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full border", s.color, s.border, s.bg)}>
                            {m.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">{m.tagline}</p>
                      </div>

                      {/* Check */}
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center shrink-0">
                          <Check className="h-3 w-3 text-primary" />
                        </div>
                      )}
                    </button>
                  );
                })}

                <p className="text-[11px] text-muted-foreground/60 pt-1">
                  All models are accessed through a single secure gateway.
                </p>
              </div>
            )}

            {/* ── Appearance ──────────────────────────────────────── */}
            {activeTab === "appearance" && (
              <div className="space-y-4">
                {/* Theme */}
                <div className="p-4 rounded-xl bg-card border border-border/60">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm font-medium">Theme</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Choose your color scheme</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setTheme("dark")}
                      className={cn(
                        "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all",
                        theme === "dark"
                          ? "border-primary/40 bg-primary/8"
                          : "border-border/50 bg-background hover:border-border"
                      )}
                    >
                      <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center">
                        <Moon className="h-4 w-4 text-zinc-200" />
                      </div>
                      <span className="text-xs font-medium">Dark</span>
                      {theme === "dark" && <Check className="h-3 w-3 text-primary" />}
                    </button>
                    <button
                      onClick={() => setTheme("light")}
                      className={cn(
                        "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all",
                        theme === "light"
                          ? "border-primary/40 bg-primary/8"
                          : "border-border/50 bg-background hover:border-border"
                      )}
                    >
                      <div className="w-10 h-10 rounded-lg bg-white border border-zinc-200 flex items-center justify-center">
                        <Sun className="h-4 w-4 text-zinc-700" />
                      </div>
                      <span className="text-xs font-medium">Light</span>
                      {theme === "light" && <Check className="h-3 w-3 text-primary" />}
                    </button>
                  </div>
                </div>

                {/* UI preferences */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-card border border-border/60">
                    <div>
                      <p className="text-sm font-medium">Compact messages</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Reduce message spacing</p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-card border border-border/60">
                    <div>
                      <p className="text-sm font-medium">Sound effects</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Play sound on new messages</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
