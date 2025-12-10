import { useState } from "react";
import { X, Phone, AlertTriangle, Circle, MessageSquare, Loader2, Sparkles, Clock, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Lead, useUpdateLead } from "@/hooks/useLeads";
import { useMessages } from "@/hooks/useMessages";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface LeadModalProps {
  lead: Lead;
  onClose: () => void;
}

const statusOptions = [
  { value: "new", label: "Neu", icon: Sparkles },
  { value: "in_review", label: "In Bearbeitung", icon: Clock },
  { value: "completed", label: "Abgeschlossen", icon: CheckCircle2 },
  { value: "rejected", label: "Abgelehnt", icon: XCircle },
];

const urgencyConfig: Record<string, { color: string; icon: typeof AlertTriangle }> = {
  akut: { color: "bg-red-500/20 text-red-400 border-red-500/30", icon: AlertTriangle },
  normal: { color: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: Circle },
  niedrig: { color: "bg-muted text-muted-foreground border-border", icon: Circle },
};

export function LeadModal({ lead, onClose }: LeadModalProps) {
  const [notes, setNotes] = useState(lead.notes || "");
  const [status, setStatus] = useState(lead.status || "new");
  const updateLead = useUpdateLead();
  const { data: messages, isLoading: messagesLoading } = useMessages(lead.call_sid);

  const handleSave = async () => {
    try {
      await updateLead.mutateAsync({
        id: lead.id,
        updates: { notes, status },
      });
      toast.success("Lead aktualisiert");
    } catch (error) {
      toast.error("Fehler beim Speichern");
    }
  };

  const urgency = urgencyConfig[lead.urgency || "normal"] || urgencyConfig.normal;
  const UrgencyIcon = urgency.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with gradient */}
      <div
        className="absolute inset-0 bg-background/60 backdrop-blur-xl animate-fade-in"
        onClick={onClose}
      />
      
      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-violet-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
      
      {/* Modal - Glassmorphism */}
      <div className="relative backdrop-blur-2xl bg-card/80 border border-border/50 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-scale-in">
        {/* Header with gradient */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-blue-500/20" />
          <div className="relative flex items-center justify-between p-6 border-b border-border/50">
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
                {lead.name}
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {new Date(lead.created_at).toLocaleString("de-DE")}
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose} 
              className="rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Patient Info - Glass cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-border/50 backdrop-blur-sm">
              <div className="h-10 w-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
                <Phone className="h-5 w-5 text-violet-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Telefon</p>
                <p className="font-medium">{lead.phone || "Keine Nummer"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-border/50 backdrop-blur-sm">
              <div className="h-10 w-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <UrgencyIcon className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Dringlichkeit</p>
                <Badge className={`${urgency.color} border gap-1.5 mt-0.5`}>
                  <UrgencyIcon className="h-3 w-3" />
                  {lead.urgency === "akut" ? "Akut" : "Normal"}
                </Badge>
              </div>
            </div>
            <div className="col-span-2 p-4 rounded-2xl bg-white/5 border border-border/50 backdrop-blur-sm">
              <p className="text-xs text-muted-foreground mb-1">Anliegen</p>
              <p className="text-sm">{lead.concern || "Kein Anliegen angegeben"}</p>
            </div>
            {lead.insurance && (
              <div className="col-span-2 p-4 rounded-2xl bg-white/5 border border-border/50 backdrop-blur-sm">
                <p className="text-xs text-muted-foreground mb-1">Versicherung</p>
                <p className="text-sm">{lead.insurance}</p>
              </div>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="text-sm font-medium mb-2 block text-muted-foreground">Status ändern</label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="rounded-xl bg-white/5 border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {opt.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm font-medium mb-2 block text-muted-foreground">Interne Notizen</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notizen hinzufügen..."
              rows={3}
              className="rounded-xl resize-none bg-white/5 border-border/50"
            />
          </div>

          {/* Conversation History */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-lg gradient-premium flex items-center justify-center">
                <MessageSquare className="h-4 w-4 text-white" />
              </div>
              <h3 className="font-medium">Gesprächsverlauf</h3>
            </div>
            {messagesLoading ? (
              <div className="space-y-3 p-4 rounded-2xl bg-white/5 border border-border/50">
                <Skeleton className="h-12 w-3/4" />
                <Skeleton className="h-10 w-1/2 ml-auto" />
                <Skeleton className="h-14 w-2/3" />
              </div>
            ) : messages && messages.length > 0 ? (
              <div className="space-y-3 max-h-64 overflow-y-auto rounded-2xl bg-white/5 border border-border/50 p-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`text-sm p-4 rounded-xl transition-all duration-200 ${
                      msg.role === "user"
                        ? "bg-violet-500/20 ml-8 border border-violet-500/30"
                        : "bg-blue-500/20 mr-8 border border-blue-500/30"
                    }`}
                  >
                    <span className="font-medium text-xs text-muted-foreground">
                      {msg.role === "user" ? "Patient" : "AI"}
                    </span>
                    <p className="mt-1">{msg.message}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground text-center py-8 rounded-2xl bg-white/5 border border-border/50">
                Kein Gesprächsverlauf vorhanden
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-border/50 bg-gradient-to-r from-violet-500/5 to-blue-500/5">
          <Button variant="outline" onClick={onClose} className="rounded-xl">
            Abbrechen
          </Button>
          <Button variant="premium" onClick={handleSave} disabled={updateLead.isPending} className="rounded-xl">
            {updateLead.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Speichern...
              </>
            ) : (
              "Speichern"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}