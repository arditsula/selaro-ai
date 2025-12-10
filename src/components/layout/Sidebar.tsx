import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Settings,
  Phone,
  Menu,
  X,
  Sparkles,
  LogOut,
  Info,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useClinic } from "@/hooks/useClinic";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const navItems = [
  { title: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { title: "Leads", path: "/leads", icon: Users },
  { title: "Termine", path: "/appointments", icon: Calendar },
  { title: "Simulator", path: "/simulator", icon: Phone },
  { title: "Einstellungen", path: "/settings", icon: Settings, showBadge: true },
  { title: "Über Selaro", path: "/about", icon: Info },
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { signOut, user } = useAuth();
  const { data: clinic } = useClinic();

  // Check if settings are incomplete
  const isSettingsIncomplete = clinic && (!clinic.name || !clinic.phone_number || !clinic.address || !clinic.instructions);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error('Fehler beim Abmelden');
    } else {
      toast.success('Erfolgreich abgemeldet');
    }
  };

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden bg-background/80 backdrop-blur-sm shadow-premium"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40 md:hidden animate-fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-64 transition-all duration-300 md:translate-x-0",
          isOpen ? "translate-x-0 animate-slide-in-right" : "-translate-x-full"
        )}
        style={{
          background: "linear-gradient(180deg, #1e1b4b 0%, #5b3df5 100%)",
        }}
      >
        <div className="relative flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center gap-3 border-b border-white/10 px-6">
            <div className="relative">
              <div className="absolute inset-0 bg-white/20 rounded-xl blur-md" />
              <div className="relative h-9 w-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white">Selaro</span>
              <p className="text-[10px] text-white/60 uppercase tracking-widest">
                AI Receptionist
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const showIncomplete = item.showBadge && isSettingsIncomplete;
              
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-white/20 text-white border border-white/30 shadow-lg"
                      : "text-white/70 hover:bg-white/10 hover:text-white/80"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-5 w-5 transition-transform duration-200",
                      !isActive && "group-hover:scale-110"
                    )}
                  />
                  <span className="flex-1">{item.title}</span>
                  {showIncomplete && (
                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-[10px] px-1.5 py-0.5">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Unvollständig
                    </Badge>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-white/10 p-4 space-y-3">
            {user && (
              <div className="px-3 py-2 rounded-xl bg-white/5">
                <p className="text-xs text-white/40 truncate">
                  {user.email}
                </p>
              </div>
            )}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white/80 transition-all duration-200"
            >
              <LogOut className="h-5 w-5" />
              Abmelden
            </button>
            <div className="flex items-center gap-2 px-3 py-2">
              <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
              <p className="text-xs text-white/60">
                Powered by Selaro AI
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
