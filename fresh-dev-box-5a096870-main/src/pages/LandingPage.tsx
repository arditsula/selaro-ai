import { Link } from "react-router-dom";
import { Phone, Shield, Clock, PhoneOff, ArrowRight, Sparkles, Users, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Gradient Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950/80 via-background to-blue-950/80" />
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-violet-500/30 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-500/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-violet-600/10 rounded-full blur-3xl" />
      </div>

      {/* Sticky Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/60 border-b border-border/50 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl gradient-premium flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
                Selaro
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/dashboard">
                <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10">
                  Dashboard
                </Button>
              </Link>
              <Link to="/simulator">
                <Button variant="premium" size="sm" className="rounded-xl">
                  Demo starten
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-28 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="relative max-w-4xl mx-auto text-center flex flex-col items-center justify-center min-h-[45vh]">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/20 border border-violet-500/30 text-sm text-violet-300 font-medium mb-6 animate-fade-in backdrop-blur-sm">
            <Sparkles className="w-4 h-4" />
            KI-gestützte Telefonrezeption
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-4 animate-fade-in" style={{ animationDelay: "100ms" }}>
            <span className="text-white">Kein Anruf mehr</span>
            <span className="block bg-gradient-to-r from-violet-400 via-blue-400 to-violet-400 bg-clip-text text-transparent mt-2">
              verpasst.
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-white/60 max-w-2xl leading-relaxed mb-8 animate-fade-in" style={{ animationDelay: "200ms" }}>
            Selaro ist Ihr intelligenter AI-Rezeptionist für Zahnarztpraxen. 
            Automatische Patientenanfragen, 24/7 erreichbar, DSGVO-konform.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mb-12 animate-fade-in" style={{ animationDelay: "300ms" }}>
            <Link to="/simulator">
              <Button variant="premium" size="lg" className="px-8 rounded-xl shadow-xl shadow-violet-500/25">
                Kostenlos testen
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="outline" size="lg" className="px-8 rounded-xl border-white/20 text-white hover:bg-white/10 hover:text-white">
                Dashboard öffnen
              </Button>
            </Link>
          </div>

          {/* Trust Bar */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 animate-fade-in" style={{ animationDelay: "400ms" }}>
            <div className="flex items-center gap-2 text-sm text-white/70">
              <div className="w-9 h-9 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center backdrop-blur-sm">
                <Shield className="w-4 h-4 text-violet-400" />
              </div>
              <span className="font-medium">Datenschutzkonform</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-white/70">
              <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center backdrop-blur-sm">
                <Clock className="w-4 h-4 text-blue-400" />
              </div>
              <span className="font-medium">24/7 erreichbar</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-white/70">
              <div className="w-9 h-9 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center justify-center backdrop-blur-sm">
                <PhoneOff className="w-4 h-4 text-green-400" />
              </div>
              <span className="font-medium">Keine verpassten Anrufe</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Preview */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="p-6 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-xl animate-fade-in group hover:bg-white/10 transition-all duration-300" style={{ animationDelay: "500ms" }}>
              <div className="w-14 h-14 rounded-2xl gradient-premium flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                <Phone className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-white">AI Rezeptionist</h3>
              <p className="text-sm text-white/60">
                Intelligente Anrufannahme und Patientenerfassung rund um die Uhr.
              </p>
            </div>
            <div className="p-6 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-xl animate-fade-in group hover:bg-white/10 transition-all duration-300" style={{ animationDelay: "600ms" }}>
              <div className="w-14 h-14 rounded-2xl bg-blue-500/30 border border-blue-500/30 flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                <Users className="w-7 h-7 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-white">Lead-Management</h3>
              <p className="text-sm text-white/60">
                Alle Anfragen übersichtlich verwalten und priorisieren.
              </p>
            </div>
            <div className="p-6 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-xl animate-fade-in group hover:bg-white/10 transition-all duration-300" style={{ animationDelay: "700ms" }}>
              <div className="w-14 h-14 rounded-2xl bg-green-500/30 border border-green-500/30 flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
                <Calendar className="w-7 h-7 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-white">Terminplanung</h3>
              <p className="text-sm text-white/60">
                Automatische Terminvorschläge und Kalenderintegration.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="p-8 rounded-3xl backdrop-blur-xl bg-gradient-to-r from-violet-500/10 to-blue-500/10 border border-white/10">
            <div className="grid grid-cols-3 gap-8 text-center">
              <div>
                <p className="text-4xl font-bold bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">99%</p>
                <p className="text-sm text-white/60 mt-1">Anrufannahme</p>
              </div>
              <div>
                <p className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">24/7</p>
                <p className="text-sm text-white/60 mt-1">Verfügbarkeit</p>
              </div>
              <div>
                <p className="text-4xl font-bold bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">&lt;2s</p>
                <p className="text-sm text-white/60 mt-1">Reaktionszeit</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-premium flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm text-white/40">© 2024 Selaro. Alle Rechte vorbehalten.</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-white/40">System aktiv</span>
          </div>
        </div>
      </footer>
    </div>
  );
}