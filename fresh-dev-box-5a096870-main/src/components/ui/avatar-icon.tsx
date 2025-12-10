import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface AvatarIconProps {
  type: "user" | "assistant";
  className?: string;
}

export function AvatarIcon({ type, className }: AvatarIconProps) {
  return (
    <div
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full flex-shrink-0 transition-all duration-200 hover:scale-110 ring-2 ring-background shadow-lg",
        type === "assistant"
          ? "gradient-premium text-white"
          : "bg-secondary text-secondary-foreground",
        className
      )}
    >
      {type === "assistant" ? (
        <Bot className="h-5 w-5" />
      ) : (
        <User className="h-5 w-5" />
      )}
    </div>
  );
}