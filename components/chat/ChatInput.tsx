"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Square, Paperclip, Sparkles } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  isStreaming: boolean;
  onStop: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSend,
  isStreaming,
  onStop,
  disabled,
  placeholder,
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (!trimmed || disabled || isStreaming) return;
    onSend(trimmed);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t border-border bg-background p-4 shrink-0">
      <div className="max-w-3xl mx-auto">
        <div
          className={cn(
            "relative flex items-end gap-2 rounded-xl border bg-muted/30 p-2 transition-all duration-200",
            disabled
              ? "border-muted opacity-60"
              : "border-border focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20"
          )}
        >
          {/* Attach file button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
            disabled={true}
            title="Coming soon"
          >
            <Paperclip className="h-4 w-4" />
          </Button>

          {/* Textarea */}
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || "Ask RECOIL AI anything..."}
            disabled={disabled || isStreaming}
            className="flex-1 min-h-[36px] max-h-[200px] resize-none border-0 bg-transparent px-2 py-1.5 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60"
            rows={1}
          />

          {/* Send / Stop button */}
          {isStreaming ? (
            <Button
              variant="destructive"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={onStop}
            >
              <Square className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button
              variant="default"
              size="icon"
              className={cn(
                "h-8 w-8 shrink-0 transition-all",
                !input.trim() || disabled
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              )}
              onClick={handleSubmit}
              disabled={!input.trim() || disabled}
            >
              <Send className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        {/* Hint */}
        <div className="flex items-center justify-center mt-1.5 gap-1">
          <Sparkles className="h-3 w-3 text-muted-foreground/50" />
          <p className="text-[10px] text-muted-foreground/50">
            RECOIL AI can generate code, fix bugs, explain concepts, and more
          </p>
        </div>
      </div>
    </div>
  );
}
