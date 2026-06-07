"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Send, Square, Zap } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  isStreaming: boolean;
  onStop: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, isStreaming, onStop, disabled, placeholder }: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 220)}px`;
    }
  }, [input]);

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (!trimmed || disabled || isStreaming) return;
    onSend(trimmed);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const hasInput = input.trim().length > 0;
  const canSend = hasInput && !disabled && !isStreaming;

  return (
    <div className="border-t border-border/50 bg-background/90 backdrop-blur-xl p-4 shrink-0">
      <div className="max-w-3xl mx-auto">
        {/* Input container */}
        <div
          className={cn(
            "relative flex items-end gap-2 rounded-2xl border bg-card/60 p-3 transition-all duration-200",
            disabled
              ? "border-border/30 opacity-50"
              : isStreaming
              ? "border-primary/30 shadow-glow-orange"
              : hasInput
              ? "border-primary/40 shadow-glow-orange"
              : "border-border/50 focus-within:border-primary/40 focus-within:shadow-glow-orange"
          )}
        >
          {/* Textarea */}
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              placeholder ||
              "Ask RECOIL AI about Roblox development…"
            }
            disabled={disabled || isStreaming}
            rows={1}
            className="flex-1 min-h-[40px] max-h-[220px] resize-none border-0 bg-transparent px-1 py-1.5 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/40 leading-relaxed"
          />

          {/* Action button */}
          <div className="flex items-center gap-1.5 shrink-0 self-end pb-0.5">
            {isStreaming ? (
              <button
                onClick={onStop}
                className="flex items-center justify-center w-9 h-9 rounded-xl bg-destructive/90 hover:bg-destructive text-white transition-all duration-200 shadow-sm"
              >
                <Square className="h-3.5 w-3.5" fill="white" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!canSend}
                className={cn(
                  "flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200",
                  canSend
                    ? "bg-primary hover:bg-primary/90 text-white shadow-glow-orange shine-btn"
                    : "bg-muted text-muted-foreground/40 cursor-not-allowed"
                )}
              >
                <Send className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Footer hint */}
        <div className="flex items-center justify-center gap-2 mt-2">
          <Zap className="h-3 w-3 text-primary/40" />
          <p className="text-[11px] text-muted-foreground/40 text-center">
            {isStreaming
              ? "RECOIL AI is thinking…"
              : "Luau · Roblox APIs · Client-Server · DataStores · and more"}
          </p>
          {!isStreaming && (
            <span className="text-[10px] text-muted-foreground/30 hidden sm:inline">
              ↵ Send · ⇧↵ New line
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
