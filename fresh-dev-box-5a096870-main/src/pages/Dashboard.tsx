import { Link } from "react-router-dom";
import { 
  Users, 
  AlertTriangle, 
  Calendar, 
  TrendingUp, 
  Phone, 
  Clock, 
  Activity,
  ArrowUpRight,
  Sparkles,
  CheckCircle2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useRecentLeads, useLeadStats } from "@/hooks/useLeads";
import { useAppointments } from "@/hooks/useAppointments";
import { formatDateTime, getUrgencyColor, getStatusColor, getStatusLabel } from "@/lib/utils";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

// Mock data for charts (in production, fetch from API)
const dailyCallsData = [
  { day: "Mo", calls: 12 },
  { day: "Di", calls: 19 },
  { day: "Mi", calls: 15 },
  { day: "Do", calls: 22 },
  { day: "Fr", calls: 18 },
  { day: "Sa", calls: 8 },
  { day: "So", calls: 5 },
];

const leadTypesData = [
  { name: "Terminanfrage", value: 45, color: "#8b5cf6" },
  { name: "Notfall", value: 15, color: "#ef4444" },
  { name: "Beratung", value: 25, color: "#3b82f6" },
  { name: "Sonstiges", value: 15, color: "#6b7280" },
];

const responseTimeData = [
  { time: "0-1m", count: 35 },
  { time: "1-3m", count: 45 },
  { time: "3-5m", count: 15 },
  { time: "5m+", count: 5 },
];

export default function Dashboard() {
  const { data: recentLeads, isLoading: leadsLoading } = useRecentLeads(5);
  const { data: stats, isLoading: statsLoading } = useLeadStats();
  const { data: appointments, isLoading: appointmentsLoading } = useAppointments();

  const todaysAppointments = appointments?.filter(apt => {
    const today = new Date().toISOString().split('T')[0];
    return apt.appointment_date === today;
  }) || [];

  return (
    <div className="min-h-screen relative">
      {/* Gradient Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950/50 via-background to-blue-950/50" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
      </div>

      {/* Sticky Header */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-background/60 border-b border-border/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Willkommen zurück! Hier ist Ihre Praxisübersicht.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Heute</p>
              <p className="text-sm font-medium">
                {new Date().toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" })}
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl gradient-premium flex items-center justify-center shadow-lg">
              <Activity className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6 page-enter">
        {/* Stats Cards Row */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statsLoading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : (
            <>
              {/* Total Leads */}
              <Card className="backdrop-blur-xl bg-card/60 border-border/50 shadow-premium-lg rounded-2xl overflow-hidden group hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Leads gesamt</p>
                      <p className="text-3xl font-bold mt-1">{stats?.total || 0}</p>
                      <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 text-green-400" />
                        <span className="text-green-400">+12%</span> diese Woche
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-violet-500/20 to-violet-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Users className="h-6 w-6 text-violet-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* New Leads */}
              <Card className="backdrop-blur-xl bg-card/60 border-border/50 shadow-premium-lg rounded-2xl overflow-hidden group hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Neue Anfragen</p>
                      <p className="text-3xl font-bold mt-1">{stats?.new || 0}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Noch nicht bearbeitet
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Sparkles className="h-6 w-6 text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Urgent Cases */}
              <Card className="backdrop-blur-xl bg-card/60 border-border/50 shadow-premium-lg rounded-2xl overflow-hidden group hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Akute Fälle</p>
                      <p className="text-3xl font-bold mt-1 text-red-400">{stats?.urgent || 0}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Dringende Anfragen
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-red-500/20 to-red-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <AlertTriangle className="h-6 w-6 text-red-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Today Count */}
              <Card className="backdrop-blur-xl bg-card/60 border-border/50 shadow-premium-lg rounded-2xl overflow-hidden group hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Heute</p>
                      <p className="text-3xl font-bold mt-1">{stats?.todayCount || 0}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Anrufe heute
                      </p>
                    </div>
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-green-500/20 to-green-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Phone className="h-6 w-6 text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Daily Calls Chart */}
          <Card className="backdrop-blur-xl bg-card/60 border-border/50 shadow-premium-lg rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-violet-500/20 flex items-center justify-center">
                  <Activity className="h-4 w-4 text-violet-400" />
                </div>
                Anrufe diese Woche
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[160px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyCallsData}>
                    <defs>
                      <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="day" 
                      axisLine={false} 
                      tickLine={false}
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                    />
                    <YAxis hide />
                    <Area
                      type="monotone"
                      dataKey="calls"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorCalls)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Lead Types Chart */}
          <Card className="backdrop-blur-xl bg-card/60 border-border/50 shadow-premium-lg rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Users className="h-4 w-4 text-blue-400" />
                </div>
                Anfragen nach Typ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[160px] flex items-center justify-between">
                <ResponsiveContainer width="50%" height="100%">
                  <PieChart>
                    <Pie
                      data={leadTypesData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={60}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {leadTypesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {leadTypesData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2 text-xs">
                      <div 
                        className="h-2 w-2 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-muted-foreground">{item.name}</span>
                      <span className="font-medium">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Response Time Chart */}
          <Card className="backdrop-blur-xl bg-card/60 border-border/50 shadow-premium-lg rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-green-400" />
                </div>
                Reaktionszeit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[160px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={responseTimeData}>
                    <XAxis 
                      dataKey="time" 
                      axisLine={false} 
                      tickLine={false}
                      tick={{ fill: '#6b7280', fontSize: 11 }}
                    />
                    <YAxis hide />
                    <Bar 
                      dataKey="count" 
                      radius={[6, 6, 0, 0]}
                      fill="url(#barGradient)"
                    >
                      <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#22c55e" />
                          <stop offset="100%" stopColor="#22c55e" stopOpacity={0.3} />
                        </linearGradient>
                      </defs>
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-2">
                Durchschnitt: <span className="text-green-400 font-medium">1.8 min</span>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Leads */}
          <Card className="backdrop-blur-xl bg-card/60 border-border/50 shadow-premium-lg rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 bg-gradient-to-r from-violet-500/10 to-transparent">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl gradient-premium flex items-center justify-center">
                  <Users className="h-4 w-4 text-white" />
                </div>
                <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
                  Neueste Leads
                </span>
              </CardTitle>
              <Link
                to="/leads"
                className="text-sm text-violet-400 hover:text-violet-300 transition-colors font-medium flex items-center gap-1"
              >
                Alle anzeigen
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </CardHeader>
            <CardContent className="p-4">
              {leadsLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                  ))}
                </div>
              ) : recentLeads && recentLeads.length > 0 ? (
                <div className="space-y-2">
                  {recentLeads.slice(0, 4).map((lead, index) => (
                    <Link
                      key={lead.id}
                      to={`/leads/${lead.id}`}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-border/30 hover:bg-gradient-to-r hover:from-violet-500/10 hover:to-blue-500/10 transition-all duration-200 group"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm group-hover:text-violet-400 transition-colors">
                            {lead.name}
                          </span>
                          {lead.urgency === "akut" && (
                            <Badge className="bg-red-500/20 text-red-400 border border-red-500/30 text-xs">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Akut
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {lead.concern || "Keine Angabe"}
                        </p>
                      </div>
                      <div className="text-right space-y-0.5">
                        <Badge className={`${getStatusColor(lead.status)} text-xs`}>
                          {getStatusLabel(lead.status)}
                        </Badge>
                        <p className="text-[10px] text-muted-foreground">
                          {formatDateTime(lead.created_at)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Users}
                  title="Keine Leads vorhanden"
                  description="Sobald Patienten anrufen, erscheinen ihre Anfragen hier."
                />
              )}
            </CardContent>
          </Card>

          {/* Today's Appointments */}
          <Card className="backdrop-blur-xl bg-card/60 border-border/50 shadow-premium-lg rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 bg-gradient-to-r from-blue-500/10 to-transparent">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-blue-400" />
                </div>
                <span className="text-blue-400">
                  Termine heute
                </span>
              </CardTitle>
              <Link
                to="/appointments"
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium flex items-center gap-1"
              >
                Alle anzeigen
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </CardHeader>
            <CardContent className="p-4">
              {appointmentsLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <Skeleton className="h-5 w-16" />
                    </div>
                  ))}
                </div>
              ) : todaysAppointments.length > 0 ? (
                <div className="space-y-2">
                  {todaysAppointments.slice(0, 4).map((apt, index) => (
                    <div
                      key={apt.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-border/30"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="space-y-0.5">
                        <span className="font-medium text-sm">{apt.patient_name}</span>
                        <p className="text-xs text-muted-foreground">
                          {apt.reason || "Regulärer Termin"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <p className="text-sm font-medium text-blue-400">{apt.appointment_time}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {apt.status === "confirmed" ? (
                              <span className="flex items-center gap-1 text-green-400">
                                <CheckCircle2 className="h-3 w-3" />
                                Bestätigt
                              </span>
                            ) : apt.status}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Calendar}
                  title="Keine Termine heute"
                  description="Heute stehen keine Termine an."
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}