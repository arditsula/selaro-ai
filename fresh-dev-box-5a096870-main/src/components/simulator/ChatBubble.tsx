import { Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { AvatarIcon } from "@/components/ui/avatar-icon";

interface ChatBubbleProps {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  onPlayAudio?: () => void;
}

export function ChatBubble({ role, content, timestamp, onPlayAudio }: ChatBubbleProps) {
  return (
    <div
      className={cn(
        "flex gap-3 animate-fade-in",
        role === "user" ? "justify-end" : "justify-start"
      )}
    >
      {role === "assistant" && <AvatarIcon type="assistant" />}
      
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-4 py-3 shadow-sm transition-shadow hover:shadow-md",
          role === "user"
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "bg-card border border-border rounded-bl-md"
        )}
      >
        <p className="text-sm leading-relaxed">{content}</p>
        <div className="flex items-center justify-between gap-3 mt-2">
          <span className={cn(
            "text-[10px]",
            role === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
          )}>
            {timestamp.toLocaleTimeString("de-DE", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          {role === "assistant" && onPlayAudio && (
            <button
              onClick={onPlayAudio}
              className="text-muted-foreground hover:text-primary transition-colors p-1 rounded-lg hover:bg-muted"
            >
              <Volume2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
      
      {role === "user" && <AvatarIcon type="user" />}
    </div>
  );
}
