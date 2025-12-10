import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Phone, Calendar, Clock, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLead, useUpdateLead } from "@/hooks/useLeads";
import { formatDateTime, getUrgencyColor, getStatusColor, getStatusLabel } from "@/lib/utils";
import { toast } from "sonner";
import { useState, useEffect } from "react";

export default function LeadDetails() {
  const { id } = useParams<{ id: string }>();
  const { data: lead, isLoading } = useLead(id || "");
  const updateLead = useUpdateLead();
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (lead?.notes) {
      setNotes(lead.notes);
    }
  }, [lead]);

  const handleStatusChange = async (status: string) => {
    if (!id) return;
    try {
      await updateLead.mutateAsync({ id, updates: { status } });
      toast.success("Status aktualisiert");
    } catch (error) {
      toast.error("Fehler beim Aktualisieren");
    }
  };

  const handleSaveNotes = async () => {
    if (!id) return;
    try {
      await updateLead.mutateAsync({ id, updates: { notes } });
      toast.success("Notizen gespeichert");
    } catch (error) {
      toast.error("Fehler beim Speichern");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Laden...</p>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="space-y-4">
        <Link to="/leads" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Zurück zu Leads
        </Link>
        <p className="text-muted-foreground">Lead nicht gefunden.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <Link to="/leads" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Zurück zu Leads
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{lead.name}</h1>
            {lead.urgency === "akut" && (
              <Badge className={getUrgencyColor(lead.urgency)}>Akut</Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-1">
            Erstellt am {formatDateTime(lead.created_at)}
          </p>
        </div>
        <Select value={lead.status || "new"} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="new">Neu</SelectItem>
            <SelectItem value="contacted">Kontaktiert</SelectItem>
            <SelectItem value="scheduled">Termin vereinbart</SelectItem>
            <SelectItem value="completed">Abgeschlossen</SelectItem>
            <SelectItem value="lost">Verloren</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Info Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Kontaktdaten
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{lead.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Telefon</p>
              <p className="font-medium">{lead.phone || "Keine Angabe"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Quelle</p>
              <p className="font-medium capitalize">{lead.source || "Unbekannt"}</p>
            </div>
            {lead.call_sid && (
              <div>
                <p className="text-sm text-muted-foreground">Call SID</p>
                <p className="font-mono text-xs">{lead.call_sid}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Appointment Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Terminwunsch
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Anliegen</p>
              <p className="font-medium">{lead.concern || "Keine Angabe"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Wunschtermin</p>
              <p className="font-medium">
                {lead.preferred_slots?.raw || "Keine Angabe"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Dringlichkeit</p>
              <Badge className={getUrgencyColor(lead.urgency)}>
                {lead.urgency === "akut" ? "Akut" : "Normal"}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Versicherung</p>
              <p className="font-medium">{lead.insurance || "Keine Angabe"}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Notizen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Interne Notizen zum Lead..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
          />
          <Button onClick={handleSaveNotes} disabled={updateLead.isPending}>
            {updateLead.isPending ? "Speichern..." : "Notizen speichern"}
          </Button>
        </CardContent>
      </Card>

      {/* Status Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(lead.status)}>
              {getStatusLabel(lead.status)}
            </Badge>
            <span className="text-muted-foreground text-sm">
              Zuletzt aktualisiert: {formatDateTime(lead.updated_at)}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
