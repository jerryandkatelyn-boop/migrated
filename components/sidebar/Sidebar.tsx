"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Plus, MessageSquare, Trash2, Edit3, Check, X,
  PanelLeftClose, LogOut, Settings, Shield, Zap,
} from "lucide-react";
import type { User, Chat } from "@/types/database";
import { useAuth } from "@/hooks/useAuth";

interface SidebarProps {
  chats: Chat[];
  activeChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  onDeleteChat: (chatId: string) => void;
  onRenameChat: (chatId: string, title: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  user: User | null;
  onOpenSettings?: () => void;
}

export function Sidebar({
  chats, activeChatId, onSelectChat, onNewChat,
  onDeleteChat, onRenameChat, isOpen, onToggle, user, onOpenSettings,
}: SidebarProps) {
  const router = useRouter();
  const { logout } = useAuth();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const handleStartEdit = (chat: Chat) => { setEditingId(chat.id); setEditTitle(chat.title); };
  const handleSaveEdit = (chatId: string) => {
    if (editTitle.trim()) onRenameChat(chatId, editTitle.trim());
    setEditingId(null);
  };
  const handleCancelEdit = () => { setEditingId(null); setEditTitle(""); };

  return (
    <TooltipProvider delayDuration={0}>
      <div
        className={cn(
          "flex flex-col h-full bg-sidebar border-r border-sidebar-border",
          "w-[268px] min-w-[268px]"
        )}
      >
        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-sidebar-border shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="relative w-7 h-7 shrink-0">
              <div className="absolute inset-0 rounded-lg bg-primary/30 blur-sm" />
              <div className="relative w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
            </div>
            <span className="font-display text-xs font-bold tracking-widest uppercase text-sidebar-foreground">
              RECOIL AI
            </span>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
                onClick={onToggle}
              >
                <PanelLeftClose className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Collapse sidebar</TooltipContent>
          </Tooltip>
        </div>

        {/* ── New Chat ────────────────────────────────────────────────── */}
        <div className="px-3 py-3 shrink-0">
          <button
            onClick={onNewChat}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-dashed border-border/50 hover:border-primary/40 hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all duration-200 group"
          >
            <div className="w-5 h-5 rounded-md bg-border/50 group-hover:bg-primary/15 flex items-center justify-center transition-colors">
              <Plus className="h-3.5 w-3.5" />
            </div>
            <span className="text-xs font-medium">New conversation</span>
          </button>
        </div>

        {/* ── Chat List Label ─────────────────────────────────────────── */}
        {chats.length > 0 && (
          <div className="px-4 pb-1.5 shrink-0">
            <span className="text-[10px] font-display font-semibold uppercase tracking-widest text-muted-foreground/50">
              Recent
            </span>
          </div>
        )}

        {/* ── Chat List ───────────────────────────────────────────────── */}
        <ScrollArea className="flex-1 px-2">
          <div className="space-y-0.5 pb-2">
            {chats.map((chat) => (
              <div key={chat.id} className="group relative">
                {editingId === chat.id ? (
                  /* ── Edit mode ── */
                  <div className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-accent">
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveEdit(chat.id);
                        if (e.key === "Escape") handleCancelEdit();
                      }}
                      autoFocus
                      className="flex-1 bg-background/80 border border-input rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary/50"
                    />
                    <button
                      onClick={() => handleSaveEdit(chat.id)}
                      className="p-1 rounded-md hover:bg-emerald-500/15 text-emerald-400 transition-colors"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="p-1 rounded-md hover:bg-muted text-muted-foreground transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  /* ── Normal mode ── */
                  <button
                    onClick={() => onSelectChat(chat.id)}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs transition-all duration-150",
                      activeChatId === chat.id
                        ? "bg-primary/10 text-foreground border border-primary/20"
                        : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground border border-transparent"
                    )}
                  >
                    {/* Active indicator */}
                    {activeChatId === chat.id && (
                      <div className="w-1 h-1 rounded-full bg-primary shrink-0" />
                    )}
                    <MessageSquare className={cn(
                      "h-3.5 w-3.5 shrink-0",
                      activeChatId === chat.id ? "text-primary" : ""
                    )} />
                    <span className="flex-1 text-left truncate">{chat.title}</span>

                    {/* Action buttons */}
                    <div
                      className={cn(
                        "flex items-center gap-0.5 transition-opacity",
                        activeChatId === chat.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                      )}
                    >
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleStartEdit(chat); }}
                            className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Edit3 className="h-3 w-3" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>Rename</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={(e) => { e.stopPropagation(); onDeleteChat(chat.id); }}
                            className="p-1 rounded-md hover:bg-destructive/15 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>Delete</TooltipContent>
                      </Tooltip>
                    </div>
                  </button>
                )}
              </div>
            ))}

            {chats.length === 0 && (
              <div className="px-4 py-10 text-center">
                <div className="w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center mx-auto mb-3">
                  <MessageSquare className="h-5 w-5 text-muted-foreground/40" />
                </div>
                <p className="text-xs text-muted-foreground/60 leading-relaxed">
                  No conversations yet.
                  <br />Start a new one above!
                </p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* ── Footer ─────────────────────────────────────────────────── */}
        <div className="border-t border-sidebar-border p-3 space-y-1 shrink-0">
          {user?.role === "admin" && (
            <button
              onClick={() => router.push("/admin")}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors"
            >
              <Shield className="h-3.5 w-3.5 text-amber-400" />
              Admin Panel
            </button>
          )}

          <button
            onClick={onOpenSettings}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors"
          >
            <Settings className="h-3.5 w-3.5" />
            Settings
          </button>

          {/* User card */}
          <div className="flex items-center gap-2.5 px-3 py-2.5 mt-1 rounded-xl bg-sidebar-accent/50 border border-sidebar-border">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/60 to-primary/20 border border-primary/30 flex items-center justify-center text-xs font-display font-bold text-primary shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() || "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate text-sidebar-foreground">
                {user?.name || "User"}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">
                {user?.email || ""}
              </p>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={logout}
                  className="p-1.5 rounded-lg hover:bg-destructive/15 text-muted-foreground/60 hover:text-destructive transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Sign out</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
