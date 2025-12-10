import { Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-background/50 backdrop-blur-sm py-4 px-6">
      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Sparkles className="h-3 w-3 text-primary" />
        <span>Powered by Selaro AI · © 2024</span>
      </div>
    </footer>
  );
}
