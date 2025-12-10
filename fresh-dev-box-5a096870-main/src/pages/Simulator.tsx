import { useState, useRef, useEffect } from "react";
import { Phone, PhoneOff, Send, Loader2, RotateCcw, Volume2, MessageSquare, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { AvatarIcon } from "@/components/ui/avatar-icon";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useCreateMessage } from "@/hooks/useMessages";
import { useClinic } from "@/hooks/useClinic";
import { supabase } from "@/integrations/supabase/client";
import { api } from "@/lib/api";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ExtractedData {
  name?: string;
  phone?: string;
  concern?: string;
  urgency?: string;
  insurance?: string;
}

export default function Simulator() {
  const [isCallActive, setIsCallActive] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedData>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const createMessage = useCreateMessage();
  const { data: clinic, isLoading: clinicLoading, error: clinicError } = useClinic();

  // DEBUG: Log state values
  console.log("SIMULATOR DEBUG:", { 
    clinic, 
    clinicLoading, 
    clinicError, 
    isCallActive,
    sessionId 
  });

  const generateSessionId = () => `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startCall = () => {
    console.log("START CALL CLICKED!");
    const newSessionId = generateSessionId();
    setSessionId(newSessionId);
    setIsCallActive(true);
    setMessages([]);
    setExtractedData({});

    const clinicName = clinic?.name || "der Zahnarztpraxis";
    const greeting = `Guten Tag, Sie sind mit ${clinicName} verbunden. Wie kann ich Ihnen helfen?`;
    
    setMessages([{ role: "assistant", content: greeting, timestamp: new Date() }]);
    createMessage.mutate({ call_sid: newSessionId, role: "assistant", message: greeting });
    toast.success("Testanruf gestartet");
  };

  const endCall = async () => {
    if (extractedData.name || extractedData.concern) {
      try {
        const { error } = await supabase.from("leads").insert({
          name: extractedData.name || "Unbekannt",
          phone: extractedData.phone || null,
          concern: extractedData.concern || null,
          urgency: extractedData.urgency || "normal",
          insurance: extractedData.insurance || null,
          call_sid: sessionId,
          source: "simulator",
          status: "new",
        });
        if (error) throw error;
        toast.success("Lead wurde erstellt");
      } catch (error) {
        console.error("Error creating lead:", error);
        toast.error("Fehler beim Erstellen des Leads");
      }
    }
    setIsCallActive(false);
    setMessages([]);
    setSessionId(null);
    setExtractedData({});
    toast.info("Anruf beendet");
  };

  const resetSimulation = () => {
    setMessages([]);
    setExtractedData({});
    if (isCallActive) {
      const newSessionId = generateSessionId();
      setSessionId(newSessionId);
      const clinicName = clinic?.name || "der Zahnarztpraxis";
      const greeting = `Guten Tag, Sie sind mit ${clinicName} verbunden. Wie kann ich Ihnen helfen?`;
      setMessages([{ role: "assistant", content: greeting, timestamp: new Date() }]);
      createMessage.mutate({ call_sid: newSessionId, role: "assistant", message: greeting });
    }
    toast.info("Simulation zurückgesetzt");
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue("");

    setMessages((prev) => [
      ...prev,
      { role: "user", content: userMessage, timestamp: new Date() },
    ]);

    if (sessionId) {
      createMessage.mutate({ call_sid: sessionId, role: "user", message: userMessage });
    }

    setIsLoading(true);

    try {
      const data = await api.simulateStep(userMessage, sessionId!);

      if (data?.ok && data?.reply) {
        setSessionId(data.sessionId || sessionId);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.reply, timestamp: new Date() },
        ]);
        
        createMessage.mutate({
          call_sid: data.sessionId || sessionId,
          role: "assistant",
          message: data.reply,
        });

        if (data.extracted) {
          setExtractedData((prev) => ({ ...prev, ...data.extracted }));
        }
      } else {
        throw new Error(data?.error || "Unbekannter Fehler");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Fehler bei der Kommunikation mit der AI");
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Es tut mir leid, es ist ein technischer Fehler aufgetreten.", timestamp: new Date() },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const playAudio = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "de-DE";
      utterance.rate = 1.0;
      speechSynthesis.speak(utterance);
      toast.success("Audio wird abgespielt");
    } else {
      toast.error("Text-to-Speech wird nicht unterstützt");
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

      {/* Sticky Header with Clinic Info */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-background/60 border-b border-border/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl gradient-premium flex items-center justify-center shadow-lg">
              <Phone className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
                AI-Simulator
              </h1>
              <p className="text-sm text-muted-foreground">
                {clinic?.name || "Zahnarztpraxis"} · Testumgebung
              </p>
            </div>
          </div>
          {clinic && (
            <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-card/60 border border-border/50">
              <Sparkles className="h-4 w-4 text-violet-400" />
              <span className="text-sm text-muted-foreground">{clinic.phone_number || "Keine Telefonnummer"}</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 page-enter">
        <div className="grid gap-6 lg:grid-cols-5">
          {/* Phone Simulator */}
          <div className="lg:col-span-3">
            <Card className="h-[600px] flex flex-col overflow-hidden rounded-2xl shadow-premium-lg border-border/50 backdrop-blur-xl bg-card/60">
              <CardHeader className="border-b border-border/50 bg-gradient-to-r from-violet-500/10 to-blue-500/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-300",
                      isCallActive ? "gradient-premium shadow-glow" : "bg-muted"
                    )}>
                      <Phone className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Telefonsimulator</CardTitle>
                      <CardDescription>
                        {isCallActive ? (
                          <span className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                            Anruf aktiv
                          </span>
                        ) : (
                          "Kein aktiver Anruf"
                        )}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {isCallActive && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={resetSimulation}
                        className="rounded-xl border-border/50 hover:bg-violet-500/10 hover:border-violet-500/30 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Reset
                      </Button>
                    )}
                    {isCallActive ? (
                      <Button variant="destructive" onClick={endCall} className="rounded-xl">
                        <PhoneOff className="h-4 w-4 mr-2" />
                        Auflegen
                      </Button>
                    ) : (
                      <Button variant="premium" onClick={startCall} className="rounded-xl">
                        <Phone className="h-4 w-4 mr-2" />
                        Testanruf starten
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-5 space-y-5 min-h-0">
                  {!isCallActive ? (
                    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                      <Phone className="w-16 h-16 text-primary mb-6" />
                      <h2 className="text-xl font-semibold mb-2">
                        Bereit für einen Testanruf
                      </h2>
                      <p className="text-muted-foreground mb-6">
                        Klicken Sie auf "Testanruf starten", um zu beginnen.
                      </p>
                      <Button onClick={startCall} variant="premium" className="rounded-xl">
                        <Phone className="h-4 w-4 mr-2" />
                        Testanruf starten
                      </Button>
                    </div>
                  ) : (
                    <>
                      {messages.map((message, index) => (
                        <div
                          key={index}
                          className={cn(
                            "flex gap-3 animate-fade-in",
                            message.role === "user" ? "justify-end" : "justify-start"
                          )}
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          {message.role === "assistant" && <AvatarIcon type="assistant" />}
                          
                          <div
                            className={cn(
                              "max-w-[75%] rounded-2xl px-4 py-3 shadow-sm transition-all duration-200",
                              message.role === "user"
                                ? "bg-gradient-to-r from-violet-500 to-blue-500 text-white rounded-br-md"
                                : "bg-card border border-border/50 rounded-bl-md"
                            )}
                          >
                            <p className="text-sm leading-relaxed">{message.content}</p>
                            <div className="flex items-center justify-between gap-3 mt-2">
                              <span className={cn(
                                "text-[10px]",
                                message.role === "user" ? "text-white/70" : "text-muted-foreground"
                              )}>
                                {message.timestamp.toLocaleTimeString("de-DE", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                              {message.role === "assistant" && (
                                <button
                                  onClick={() => playAudio(message.content)}
                                  className="text-muted-foreground hover:text-violet-400 transition-colors p-1 rounded-lg hover:bg-violet-500/10"
                                >
                                  <Volume2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                          
                          {message.role === "user" && <AvatarIcon type="user" />}
                        </div>
                      ))}
                      {isLoading && (
                        <div className="flex gap-3 justify-start animate-fade-in">
                          <AvatarIcon type="assistant" />
                          <div className="bg-card border border-border/50 rounded-2xl rounded-bl-md px-4 py-3">
                            <div className="flex gap-1.5">
                              <span className="h-2 w-2 rounded-full bg-violet-400/50 animate-bounce" style={{ animationDelay: "0ms" }} />
                              <span className="h-2 w-2 rounded-full bg-violet-400/50 animate-bounce" style={{ animationDelay: "150ms" }} />
                              <span className="h-2 w-2 rounded-full bg-violet-400/50 animate-bounce" style={{ animationDelay: "300ms" }} />
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                {isCallActive && (
                  <div className="border-t border-border/50 bg-muted/30 p-4">
                    <div className="flex gap-3">
                      <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Was sagt der Patient..."
                        disabled={isLoading}
                        className="rounded-xl bg-background/50 border-border/50"
                      />
                      <Button 
                        variant="premium" 
                        onClick={sendMessage} 
                        disabled={isLoading || !inputValue.trim()} 
                        size="icon"
                        className="rounded-xl"
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Info Panel */}
          <div className="lg:col-span-2 space-y-6">
            {isCallActive && Object.keys(extractedData).length > 0 && (
              <Card className="animate-scale-in backdrop-blur-xl bg-card/60 border-border/50 rounded-2xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <div className="h-6 w-6 rounded-lg bg-violet-500/20 flex items-center justify-center">
                      <MessageSquare className="h-3.5 w-3.5 text-violet-400" />
                    </div>
                    Erkannte Daten
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {extractedData.name && (
                    <div className="p-3 rounded-xl bg-muted/50 animate-fade-in">
                      <span className="text-xs text-muted-foreground">Name</span>
                      <p className="text-sm font-medium">{extractedData.name}</p>
                    </div>
                  )}
                  {extractedData.phone && (
                    <div className="p-3 rounded-xl bg-muted/50 animate-fade-in" style={{ animationDelay: "50ms" }}>
                      <span className="text-xs text-muted-foreground">Telefon</span>
                      <p className="text-sm font-medium">{extractedData.phone}</p>
                    </div>
                  )}
                  {extractedData.concern && (
                    <div className="p-3 rounded-xl bg-muted/50 animate-fade-in" style={{ animationDelay: "100ms" }}>
                      <span className="text-xs text-muted-foreground">Anliegen</span>
                      <p className="text-sm font-medium">{extractedData.concern}</p>
                    </div>
                  )}
                  {extractedData.urgency && (
                    <div className="p-3 rounded-xl bg-muted/50 animate-fade-in" style={{ animationDelay: "150ms" }}>
                      <span className="text-xs text-muted-foreground">Dringlichkeit</span>
                      <p className="text-sm font-medium">{extractedData.urgency}</p>
                    </div>
                  )}
                  {extractedData.insurance && (
                    <div className="p-3 rounded-xl bg-muted/50 animate-fade-in" style={{ animationDelay: "200ms" }}>
                      <span className="text-xs text-muted-foreground">Versicherung</span>
                      <p className="text-sm font-medium">{extractedData.insurance}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <Card className="backdrop-blur-xl bg-card/60 border-border/50 rounded-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Anleitung</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div className="flex gap-3 animate-fade-in" style={{ animationDelay: "100ms" }}>
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-xs font-medium text-violet-400">1</span>
                  <span>Klicken Sie auf "Testanruf starten"</span>
                </div>
                <div className="flex gap-3 animate-fade-in" style={{ animationDelay: "150ms" }}>
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-xs font-medium text-violet-400">2</span>
                  <span>Geben Sie ein, was der Patient sagt</span>
                </div>
                <div className="flex gap-3 animate-fade-in" style={{ animationDelay: "200ms" }}>
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-xs font-medium text-violet-400">3</span>
                  <span>Die AI antwortet automatisch</span>
                </div>
                <div className="flex gap-3 animate-fade-in" style={{ animationDelay: "250ms" }}>
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-xs font-medium text-violet-400">4</span>
                  <span>Klicken Sie auf 🔊 für Audio</span>
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-xl bg-card/60 border-border/50 rounded-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Beispiel-Szenarien</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-3 px-4 rounded-xl border-border/50 hover:bg-violet-500/10 hover:border-violet-500/30 transition-all"
                  onClick={() => isCallActive && setInputValue("Guten Tag, ich habe starke Zahnschmerzen")}
                  disabled={!isCallActive}
                >
                  <span className="truncate">"Ich habe starke Zahnschmerzen"</span>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-3 px-4 rounded-xl border-border/50 hover:bg-violet-500/10 hover:border-violet-500/30 transition-all"
                  onClick={() => isCallActive && setInputValue("Ich möchte einen Termin für eine Kontrolle")}
                  disabled={!isCallActive}
                >
                  <span className="truncate">"Termin für Kontrolle"</span>
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-3 px-4 rounded-xl border-border/50 hover:bg-violet-500/10 hover:border-violet-500/30 transition-all"
                  onClick={() => isCallActive && setInputValue("Mein Name ist Max Mustermann")}
                  disabled={!isCallActive}
                >
                  <span className="truncate">"Mein Name ist Max Mustermann"</span>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
