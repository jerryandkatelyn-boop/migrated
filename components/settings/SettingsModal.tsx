"use client";

import { useState } from "react";
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
import {
  User as UserIcon,
  Zap,
  Shield,
  Check,
  LogOut,
  Star,
  ArrowRight,
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

type Tab = "account" | "models";

const tabs: { id: Tab; label: string; icon: typeof UserIcon }[] = [
  { id: "account", label: "Account", icon: UserIcon },
  { id: "models",  label: "AI Models", icon: Zap },
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
  const { logout } = useAuth();

  const initials =
    user?.name?.charAt(0)?.toUpperCase() ??
    user?.email?.charAt(0)?.toUpperCase() ??
    "?";

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-[520px] w-[calc(100vw-1.5rem)] p-0 gap-0 overflow-hidden bg-background border border-border/60 shadow-2xl rounded-2xl">

        {/* Header */}
        <DialogHeader className="px-5 pt-5 pb-0">
          <DialogTitle className="font-display text-base font-bold tracking-wide">
            Settings
          </DialogTitle>
        </DialogHeader>

        {/* Horizontal top tabs — works great on mobile */}
        <div className="flex gap-1 px-5 pt-4 pb-0 border-b border-border/40">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-t-lg text-xs font-medium transition-all border-b-2 -mb-px",
                activeTab === tab.id
                  ? "text-primary border-primary bg-primary/5"
                  : "text-muted-foreground border-transparent hover:text-foreground hover:bg-accent/50"
              )}
            >
              <tab.icon className="h-3.5 w-3.5 shrink-0" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content — scrollable, safe on small screens */}
        <div className="overflow-y-auto max-h-[70vh] p-5 space-y-4">

          {/* ── Account ────────────────────────────────────────────── */}
          {activeTab === "account" && (
            <div className="space-y-4">
              {/* Avatar + name */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border/60">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/60 to-primary/20 border border-primary/30 flex items-center justify-center text-xl font-display font-bold text-primary shrink-0">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">{user?.name ?? "User"}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{user?.email}</p>
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
                  <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    Display Name
                  </Label>
                  <Input
                    defaultValue={user?.name ?? ""}
                    placeholder="Your name"
                    className="h-9 text-sm bg-card border-border/60"
                    readOnly
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                    Email
                  </Label>
                  <Input
                    defaultValue={user?.email ?? ""}
                    placeholder="you@example.com"
                    className="h-9 text-sm bg-card border-border/60"
                    readOnly
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl bg-card border border-border/50 text-center">
                  <p className="font-display text-lg font-bold text-primary">20</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Daily messages</p>
                </div>
                <div className="p-3 rounded-xl bg-card border border-border/50 text-center">
                  <p className="font-display text-lg font-bold text-foreground capitalize">
                    {user?.role ?? "user"}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Account tier</p>
                </div>
              </div>

              {/* Pro upgrade CTA */}
              <div className="relative overflow-hidden rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-violet-500/10 p-4">
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary/15 rounded-full blur-xl" />
                <div className="relative flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Star className="h-3.5 w-3.5 text-primary" />
                      <span className="text-sm font-display font-bold text-primary">Upgrade to Pro</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full border border-primary/30 bg-primary/10 text-primary font-display font-semibold uppercase tracking-wider">
                        Soon
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Unlimited messages, priority AI, advanced code review.
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="font-display text-xl font-bold text-primary">$9</span>
                    <span className="text-[10px] text-muted-foreground">/mo</span>
                  </div>
                </div>
              </div>

              {/* Sign out */}
              <div className="pt-1 border-t border-border/40">
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

          {/* ── AI Models ──────────────────────────────────────────── */}
          {activeTab === "models" && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground leading-relaxed">
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
                    <div className={cn("w-2.5 h-2.5 rounded-full shrink-0", s.dot)} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-display text-sm font-bold">{m.name}</span>
                        <span className={cn(
                          "text-[9px] font-display font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full border",
                          s.color, s.border, s.bg
                        )}>
                          {m.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">{m.tagline}</p>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center shrink-0">
                        <Check className="h-3 w-3 text-primary" />
                      </div>
                    )}
                  </button>
                );
              })}

              {/* Pro model teaser */}
              <div className="relative overflow-hidden rounded-xl border border-dashed border-primary/30 p-4 mt-2">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-amber-400 to-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-display text-sm font-bold text-muted-foreground">
                        Ultra
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full border border-primary/30 bg-primary/10 text-primary font-display font-semibold uppercase tracking-wider">
                        Pro Only
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground/70">
                      Our most powerful model — reserved for Pro members.
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                </div>
              </div>

              <p className="text-[11px] text-muted-foreground/60 pt-1">
                All models are accessed through a single secure gateway.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
