import { Sparkles, Phone, Brain, Clock, Calendar, TrendingUp, Zap, Shield, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: Phone,
    title: "24/7 Telefonempfang",
    description: "Automatische Anrufannahme und intelligente Gesprächsführung rund um die Uhr."
  },
  {
    icon: Brain,
    title: "KI-gestützte Kommunikation",
    description: "Natürliche Gespräche in deutscher Sprache mit Verständnis für medizinische Terminologie."
  },
  {
    icon: Calendar,
    title: "Terminverwaltung",
    description: "Automatische Erfassung von Terminwünschen und Priorisierung nach Dringlichkeit."
  },
  {
    icon: Shield,
    title: "DSGVO-konform",
    description: "Sichere Verarbeitung und Speicherung aller Patientendaten nach deutschen Standards."
  },
  {
    icon: Zap,
    title: "Sofortige Lead-Erfassung",
    description: "Automatische Extraktion von Patientendaten und Anliegen aus jedem Gespräch."
  },
  {
    icon: Clock,
    title: "Keine Wartezeiten",
    description: "Patienten werden sofort bedient – keine Warteschleifen, keine verpassten Anrufe."
  },
];

const roadmapItems = [
  {
    status: "Q1 2025",
    title: "WhatsApp Integration",
    description: "Patientenanfragen direkt über WhatsApp empfangen und beantworten."
  },
  {
    status: "Q2 2025",
    title: "Multi-Praxis Dashboard",
    description: "Verwaltung mehrerer Praxisstandorte in einem zentralen Dashboard."
  },
  {
    status: "Q3 2025",
    title: "Kalender-Synchronisation",
    description: "Direkte Integration mit gängigen Praxisverwaltungssystemen."
  },
];

export default function About() {
  return (
    <div className="min-h-screen relative">
      {/* Gradient Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950/50 via-background to-blue-950/50" />
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-background/60 border-b border-border/50 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl gradient-premium flex items-center justify-center shadow-lg">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
              Über Selaro
            </h1>
            <p className="text-sm text-muted-foreground">
              Die intelligente KI-Rezeptionistin für Zahnarztpraxen
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8 page-enter">
        {/* Intro Section */}
        <Card className="backdrop-blur-xl bg-card/60 border-border/50 shadow-premium-lg rounded-2xl overflow-hidden">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-shrink-0">
                <div className="h-24 w-24 rounded-2xl gradient-premium flex items-center justify-center shadow-xl">
                  <Sparkles className="h-12 w-12 text-white" />
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
                  Willkommen bei Selaro
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Selaro ist ein KI-gestützter Telefon-Rezeptionist, der speziell für deutsche Zahnarztpraxen entwickelt wurde. 
                  Unsere intelligente Assistentin nimmt Anrufe entgegen, erfasst Patientenanliegen, priorisiert Notfälle 
                  und sorgt dafür, dass kein Patient mehr in der Warteschleife hängt. Mit modernster Sprachverarbeitung 
                  und einem tiefen Verständnis für den Praxisalltag revolutionieren wir die Patientenkommunikation.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div>
          <h3 className="text-xl font-bold mb-6 bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
            Funktionen
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Card 
                key={feature.title}
                className="backdrop-blur-xl bg-card/60 border-border/50 shadow-premium rounded-2xl overflow-hidden group hover:shadow-xl transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <feature.icon className="h-6 w-6 text-violet-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-2">{feature.title}</h4>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Roadmap Section */}
        <Card className="backdrop-blur-xl bg-card/60 border-border/50 shadow-premium-lg rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-border/50 bg-gradient-to-r from-violet-500/10 to-blue-500/10">
            <CardTitle className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl gradient-premium flex items-center justify-center shadow-lg">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
                Roadmap
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {roadmapItems.map((item, index) => (
                <div 
                  key={item.title}
                  className="flex gap-4 items-start animate-fade-in"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <Badge className="bg-violet-500/20 text-violet-400 border-violet-500/30 shrink-0">
                    {item.status}
                  </Badge>
                  <div>
                    <h4 className="font-semibold mb-1">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Contact CTA */}
        <Card className="backdrop-blur-xl bg-gradient-to-r from-violet-500/20 to-blue-500/20 border-border/50 shadow-premium-lg rounded-2xl overflow-hidden">
          <CardContent className="p-8 text-center">
            <Globe className="h-12 w-12 text-violet-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Interesse geweckt?</h3>
            <p className="text-muted-foreground mb-4">
              Kontaktieren Sie uns für eine Demo oder weitere Informationen.
            </p>
            <p className="text-sm text-violet-400">info@selaro.ai</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
