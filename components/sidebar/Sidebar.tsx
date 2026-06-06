"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Plus,
  MessageSquare,
  Trash2,
  Edit3,
  Check,
  X,
  PanelLeftClose,
  LogOut,
  Settings,
  Shield,
  Zap,
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
}

export function Sidebar({
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  onRenameChat,
  isOpen,
  onToggle,
  user,
}: SidebarProps) {
  const router = useRouter();
  const { logout } = useAuth();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const handleStartEdit = (chat: Chat) => {
    setEditingId(chat.id);
    setEditTitle(chat.title);
  };

  const handleSaveEdit = (chatId: string) => {
    if (editTitle.trim()) {
      onRenameChat(chatId, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
  };

  return (
    <TooltipProvider delayDuration={0}>
      <div
        className={cn(
          "flex flex-col h-full bg-sidebar border-r border-border transition-all duration-300 ease-in-out",
          isOpen ? "w-72 min-w-[288px]" : "w-0 min-w-0 overflow-hidden opacity-0"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-sm tracking-tight">RECOIL AI</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onToggle}
          >
            <PanelLeftClose className="h-4 w-4" />
          </Button>
        </div>

        {/* New Chat Button */}
        <div className="px-3 py-2">
          <Button
            onClick={onNewChat}
            className="w-full justify-start gap-2"
            variant="outline"
          >
            <Plus className="h-4 w-4" />
            New Chat
          </Button>
        </div>

        {/* Chat List */}
        <ScrollArea className="flex-1 px-2">
          <div className="space-y-0.5">
            {chats.map((chat) => (
              <div key={chat.id} className="group relative">
                {editingId === chat.id ? (
                  <div className="flex items-center gap-1 px-2 py-1.5">
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveEdit(chat.id);
                        if (e.key === "Escape") handleCancelEdit();
                      }}
                      autoFocus
                      className="flex-1 bg-background border border-input rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleSaveEdit(chat.id)}
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={handleCancelEdit}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <button
                    onClick={() => onSelectChat(chat.id)}
                    className={cn(
                      "w-full flex items-center gap-2 px-2 py-2 rounded-md text-sm transition-colors",
                      activeChatId === chat.id
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-accent/50 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <MessageSquare className="h-4 w-4 shrink-0" />
                    <span className="flex-1 text-left truncate">{chat.title}</span>

                    {/* Actions */}
                    <div
                      className={cn(
                        "flex items-center gap-0.5",
                        activeChatId === chat.id
                          ? "opacity-100"
                          : "opacity-0 group-hover:opacity-100"
                      )}
                    >
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartEdit(chat);
                            }}
                          >
                            <Edit3 className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Rename</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-destructive hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteChat(chat.id);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Delete</TooltipContent>
                      </Tooltip>
                    </div>
                  </button>
                )}
              </div>
            ))}

            {chats.length === 0 && (
              <div className="px-4 py-8 text-center">
                <p className="text-xs text-muted-foreground">
                  No chats yet. Start a new conversation!
                </p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t border-border p-2 space-y-1">
          {user?.role === "admin" && (
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-xs h-8"
              onClick={() => router.push("/admin")}
            >
              <Shield className="h-3.5 w-3.5" />
              Admin Panel
            </Button>
          )}
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-xs h-8"
            disabled
          >
            <Settings className="h-3.5 w-3.5" />
            Settings
          </Button>
          <div className="flex items-center gap-2 px-2 py-1.5">
            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
              {user?.name?.charAt(0)?.toUpperCase() || "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">
                {user?.name || "User"}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">
                {user?.email || ""}
              </p>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={logout}
                >
                  <LogOut className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Sign out</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
