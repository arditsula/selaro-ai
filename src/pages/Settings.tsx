import { useState, useEffect } from "react";
import { Save, Building, Phone, MapPin, MessageSquare, Sparkles, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useClinic, useUpdateClinic } from "@/hooks/useClinic";
import { toast } from "sonner";
import { clinicSettingsSchema } from "@/lib/validations";

export default function Settings() {
  const { data: clinic, isLoading } = useClinic();
  const updateClinic = useUpdateClinic();

  const [formData, setFormData] = useState({
    name: "",
    phone_number: "",
    address: "",
    instructions: "",
  });

  useEffect(() => {
    if (clinic) {
      setFormData({
        name: clinic.name || "",
        phone_number: clinic.phone_number || "",
        address: clinic.address || "",
        instructions: clinic.instructions || "",
      });
    }
  }, [clinic]);

  const handleSave = async () => {
    const result = clinicSettingsSchema.safeParse(formData);
    if (!result.success) {
      const firstError = result.error.errors[0];
      toast.error(firstError.message);
      return;
    }

    try {
      await updateClinic.mutateAsync(result.data);
      toast.success("Einstellungen gespeichert");
    } catch (error) {
      toast.error("Fehler beim Speichern");
    }
  };

  return (
    <div className="min-h-screen relative">
      {/* Gradient Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950/50 via-background to-blue-950/50" />
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
      </div>

      {/* Sticky Header */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-background/60 border-b border-border/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
              Einstellungen
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Praxis- und AI-Konfiguration verwalten
            </p>
          </div>
          <Button 
            variant="premium" 
            onClick={handleSave} 
            disabled={updateClinic.isPending}
            className="rounded-xl"
          >
            {updateClinic.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Speichern...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Speichern
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-6 page-enter">
        {isLoading ? (
          <div className="space-y-6">
            <Card className="backdrop-blur-xl bg-card/60 border-border/50 shadow-premium-lg rounded-2xl">
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
            <Card className="backdrop-blur-xl bg-card/60 border-border/50 shadow-premium-lg rounded-2xl">
              <CardContent className="p-6">
                <Skeleton className="h-40 w-full" />
              </CardContent>
            </Card>
          </div>
        ) : (
          <>
            {/* Clinic Info Card */}
            <Card className="backdrop-blur-xl bg-card/60 border-border/50 shadow-premium-lg rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-border/50 bg-gradient-to-r from-violet-500/10 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl gradient-premium flex items-center justify-center shadow-lg">
                    <Building className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
                      Praxisinformationen
                    </CardTitle>
                    <CardDescription>
                      Grundlegende Informationen über Ihre Praxis
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Praxisname</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
                      <Building className="h-4 w-4 text-violet-400" />
                    </div>
                    <Input
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Zahnarztpraxis Muster"
                      className="pl-14 h-12 rounded-xl bg-white/5 border-border/50"
                      maxLength={100}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Telefonnummer</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <Phone className="h-4 w-4 text-blue-400" />
                    </div>
                    <Input
                      value={formData.phone_number}
                      onChange={(e) =>
                        setFormData({ ...formData, phone_number: e.target.value })
                      }
                      placeholder="+49 30 555 9999"
                      className="pl-14 h-12 rounded-xl bg-white/5 border-border/50"
                      maxLength={30}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Adresse</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                      <MapPin className="h-4 w-4 text-green-400" />
                    </div>
                    <Input
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      placeholder="Musterstraße 1, 12345 Berlin"
                      className="pl-14 h-12 rounded-xl bg-white/5 border-border/50"
                      maxLength={200}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Instructions Card */}
            <Card className="backdrop-blur-xl bg-card/60 border-border/50 shadow-premium-lg rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-border/50 bg-gradient-to-r from-blue-500/10 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-500/20 flex items-center justify-center shadow-lg">
                    <Sparkles className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-blue-400">
                      AI-Rezeptionsanweisungen
                    </CardTitle>
                    <CardDescription>
                      Diese Anweisungen steuern, wie der AI-Assistent am Telefon mit Patienten spricht.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <Textarea
                  value={formData.instructions}
                  onChange={(e) =>
                    setFormData({ ...formData, instructions: e.target.value })
                  }
                  placeholder="Sie sind eine freundliche Rezeptionistin für eine Zahnarztpraxis..."
                  rows={10}
                  className="rounded-xl bg-white/5 border-border/50 resize-none"
                  maxLength={5000}
                />
                <div className="flex items-start gap-3 p-4 rounded-xl bg-violet-500/10 border border-violet-500/20">
                  <MessageSquare className="h-5 w-5 text-violet-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-violet-400">Tipp:</span> Beschreiben Sie die Öffnungszeiten, angebotene Leistungen und besondere Hinweise für die AI. Je detaillierter, desto besser kann der Assistent Ihren Patienten helfen.
                  </p>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
