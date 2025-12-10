import { useState } from "react";
import { Search, Filter, Users, Sparkles, AlertTriangle, Circle, CheckCircle2, Clock, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SkeletonTable } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLeads, Lead } from "@/hooks/useLeads";
import { LeadModal } from "@/components/leads/LeadModal";

const urgencyConfig: Record<string, { color: string; icon: typeof AlertTriangle }> = {
  akut: { color: "bg-red-500/20 text-red-400 border-red-500/30", icon: AlertTriangle },
  normal: { color: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: Circle },
};

const statusConfig: Record<string, { color: string; icon: typeof Sparkles; label: string }> = {
  new: { color: "bg-violet-500/20 text-violet-400 border-violet-500/30", icon: Sparkles, label: "Neu" },
  in_review: { color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", icon: Clock, label: "In Bearbeitung" },
  contacted: { color: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: Circle, label: "Kontaktiert" },
  scheduled: { color: "bg-green-500/20 text-green-400 border-green-500/30", icon: CheckCircle2, label: "Termin vereinbart" },
  completed: { color: "bg-green-500/20 text-green-400 border-green-500/30", icon: CheckCircle2, label: "Abgeschlossen" },
  rejected: { color: "bg-red-500/20 text-red-400 border-red-500/30", icon: XCircle, label: "Abgelehnt" },
  lost: { color: "bg-red-500/20 text-red-400 border-red-500/30", icon: XCircle, label: "Verloren" },
};

export default function Leads() {
  const { data: leads, isLoading } = useLeads();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [urgencyFilter, setUrgencyFilter] = useState<string>("all");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const filteredLeads = leads?.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.concern?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || lead.status === statusFilter;

    const matchesUrgency =
      urgencyFilter === "all" || lead.urgency === urgencyFilter;

    return matchesSearch && matchesStatus && matchesUrgency;
  });

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen relative">
      {/* Gradient Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950/50 via-background to-blue-950/50" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
      </div>

      {/* Sticky Header */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-background/60 border-b border-border/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
              Leads Dashboard
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Alle Patientenanfragen verwalten
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl gradient-premium flex items-center justify-center shadow-lg">
              <Users className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-bold">{filteredLeads?.length || 0}</span>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6 page-enter">
        {/* Filters - Glassmorphism Card */}
        <Card className="backdrop-blur-xl bg-card/60 border-border/50 shadow-premium-lg rounded-2xl">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Suchen nach Name, Telefon, Anliegen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 rounded-xl bg-background/50 border-border/50"
                />
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[160px] rounded-xl bg-background/50 border-border/50">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle Status</SelectItem>
                    <SelectItem value="new">Neu</SelectItem>
                    <SelectItem value="in_review">In Bearbeitung</SelectItem>
                    <SelectItem value="contacted">Kontaktiert</SelectItem>
                    <SelectItem value="scheduled">Termin vereinbart</SelectItem>
                    <SelectItem value="completed">Abgeschlossen</SelectItem>
                    <SelectItem value="rejected">Abgelehnt</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
                  <SelectTrigger className="w-[140px] rounded-xl bg-background/50 border-border/50">
                    <SelectValue placeholder="Dringlichkeit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle</SelectItem>
                    <SelectItem value="akut">Akut</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table - Glassmorphism Card */}
        <Card className="backdrop-blur-xl bg-card/60 border-border/50 shadow-premium-lg rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-border/50 bg-gradient-to-r from-violet-500/10 to-blue-500/10">
            <CardTitle className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl gradient-premium flex items-center justify-center shadow-lg">
                <Users className="h-5 w-5 text-white" />
              </div>
              <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
                Patientenanfragen
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6">
                <SkeletonTable rows={6} />
              </div>
            ) : filteredLeads && filteredLeads.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50 bg-muted/30">
                      <th className="text-left py-4 px-6 text-sm font-semibold text-muted-foreground">Name</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-muted-foreground">Telefon</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-muted-foreground">Anliegen</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-muted-foreground">Dringlichkeit</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-muted-foreground">Status</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-muted-foreground">Datum</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {filteredLeads.map((lead, index) => {
                      const urgency = urgencyConfig[lead.urgency || "normal"] || urgencyConfig.normal;
                      const status = statusConfig[lead.status || "new"] || statusConfig.new;
                      const UrgencyIcon = urgency.icon;
                      const StatusIcon = status.icon;

                      return (
                        <tr
                          key={lead.id}
                          className="cursor-pointer transition-all duration-200 hover:bg-gradient-to-r hover:from-violet-500/10 hover:to-blue-500/10 group"
                          onClick={() => setSelectedLead(lead)}
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <td className="py-4 px-6">
                            <span className="font-medium group-hover:text-violet-400 transition-colors">
                              {lead.name}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-muted-foreground">
                            {lead.phone || "-"}
                          </td>
                          <td className="py-4 px-6 text-muted-foreground max-w-[200px] truncate">
                            {lead.concern || "-"}
                          </td>
                          <td className="py-4 px-6">
                            <Badge className={`${urgency.color} border gap-1.5`}>
                              <UrgencyIcon className="h-3 w-3" />
                              {lead.urgency === "akut" ? "Akut" : "Normal"}
                            </Badge>
                          </td>
                          <td className="py-4 px-6">
                            <Badge className={`${status.color} border gap-1.5`}>
                              <StatusIcon className="h-3 w-3" />
                              {status.label}
                            </Badge>
                          </td>
                          <td className="py-4 px-6 text-muted-foreground text-sm">
                            {formatDateTime(lead.created_at)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12">
                <EmptyState
                  icon={Users}
                  title="Keine Leads gefunden"
                  description={searchQuery || statusFilter !== "all" || urgencyFilter !== "all"
                    ? "Versuchen Sie, Ihre Suchkriterien anzupassen."
                    : "Sobald Patienten anrufen, erscheinen ihre Anfragen hier."
                  }
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Lead Modal */}
      {selectedLead && (
        <LeadModal lead={selectedLead} onClose={() => setSelectedLead(null)} />
      )}
    </div>
  );
}