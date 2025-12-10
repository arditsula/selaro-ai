import { Calendar, Clock, User, CalendarDays, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SkeletonCard } from "@/components/ui/skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useAppointments } from "@/hooks/useAppointments";
import { formatDate } from "@/lib/utils";

const statusConfig: Record<string, { color: string; icon: typeof CheckCircle2; label: string }> = {
  scheduled: { color: "bg-violet-500/20 text-violet-400 border-violet-500/30", icon: Calendar, label: "Geplant" },
  confirmed: { color: "bg-green-500/20 text-green-400 border-green-500/30", icon: CheckCircle2, label: "Bestätigt" },
  completed: { color: "bg-green-500/20 text-green-400 border-green-500/30", icon: CheckCircle2, label: "Abgeschlossen" },
  cancelled: { color: "bg-red-500/20 text-red-400 border-red-500/30", icon: XCircle, label: "Abgesagt" },
  pending: { color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", icon: AlertCircle, label: "Ausstehend" },
};

export default function Appointments() {
  const { data: appointments, isLoading } = useAppointments();

  const todayCount = appointments?.filter((a) =>
    a.appointment_date === new Date().toISOString().split("T")[0]
  ).length || 0;

  const weekCount = appointments?.filter((a) => {
    const aptDate = new Date(a.appointment_date);
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return aptDate >= now && aptDate <= weekFromNow;
  }).length || 0;

  return (
    <div className="min-h-screen relative">
      {/* Gradient Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950/50 via-background to-blue-950/50" />
        <div className="absolute top-40 left-1/3 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-40 right-1/3 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl" />
      </div>

      {/* Sticky Header */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-background/60 border-b border-border/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
              Termine
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Alle geplanten Termine verwalten
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl gradient-premium flex items-center justify-center shadow-lg">
              <CalendarDays className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-bold">{appointments?.length || 0}</span>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6 page-enter">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          {isLoading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : (
            <>
              <Card className="backdrop-blur-xl bg-card/60 border-border/50 shadow-premium-lg rounded-2xl overflow-hidden group hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Heute</p>
                      <p className="text-3xl font-bold mt-1">{todayCount}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Termine heute
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-violet-500/20 to-violet-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Calendar className="h-6 w-6 text-violet-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-xl bg-card/60 border-border/50 shadow-premium-lg rounded-2xl overflow-hidden group hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Diese Woche</p>
                      <p className="text-3xl font-bold mt-1">{weekCount}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Kommende Termine
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Clock className="h-6 w-6 text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-xl bg-card/60 border-border/50 shadow-premium-lg rounded-2xl overflow-hidden group hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Gesamt</p>
                      <p className="text-3xl font-bold mt-1">{appointments?.length || 0}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Alle Termine
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-green-500/20 to-green-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <User className="h-6 w-6 text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Appointments Table */}
        <Card className="backdrop-blur-xl bg-card/60 border-border/50 shadow-premium-lg rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-border/50 bg-gradient-to-r from-blue-500/10 to-transparent">
            <CardTitle className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl gradient-premium flex items-center justify-center shadow-lg">
                <CalendarDays className="h-5 w-5 text-white" />
              </div>
              <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
                Alle Termine
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                ))}
              </div>
            ) : appointments && appointments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50 bg-muted/30">
                      <th className="text-left py-4 px-6 text-sm font-semibold text-muted-foreground">Patient</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-muted-foreground">Datum</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-muted-foreground">Uhrzeit</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-muted-foreground">Grund</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-muted-foreground">Telefon</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {appointments.map((apt, index) => {
                      const status = statusConfig[apt.status || "scheduled"] || statusConfig.scheduled;
                      const StatusIcon = status.icon;

                      return (
                        <tr
                          key={apt.id}
                          className="transition-all duration-200 hover:bg-gradient-to-r hover:from-violet-500/10 hover:to-blue-500/10 group"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <td className="py-4 px-6">
                            <span className="font-medium group-hover:text-violet-400 transition-colors">
                              {apt.patient_name}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-muted-foreground">
                            {formatDate(apt.appointment_date)}
                          </td>
                          <td className="py-4 px-6">
                            <span className="font-medium text-blue-400">{apt.appointment_time}</span>
                          </td>
                          <td className="py-4 px-6 text-muted-foreground max-w-[200px] truncate">
                            {apt.reason || "-"}
                          </td>
                          <td className="py-4 px-6 text-muted-foreground">
                            {apt.phone || "-"}
                          </td>
                          <td className="py-4 px-6">
                            <Badge className={`${status.color} border gap-1.5`}>
                              <StatusIcon className="h-3 w-3" />
                              {status.label}
                            </Badge>
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
                  icon={Calendar}
                  title="Noch keine Termine vorhanden"
                  description="Termine werden automatisch erstellt, wenn Leads als 'Termin vereinbart' markiert werden."
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}