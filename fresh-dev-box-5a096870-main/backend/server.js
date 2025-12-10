// =========================
// Selaro Backend – Simulator Only
// =========================

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =========================
// OpenAI + Supabase Clients
// =========================

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// =========================
// Helpers
// =========================

// System Prompt Builder
function buildSystemPrompt(clinic) {
  return `
Du bist die virtuelle medizinische Empfangsdame der Zahnarztpraxis ${clinic?.name || "Selaro Demo"}.

Deine Aufgaben:
- Begrüße freundlich
- Frage nach dem Anliegen
- Sammle notwendige Daten (Name, Telefonnummer, Geburtsdatum, Versicherungsart, Beschwerdegrund)
- Prüfe Terminmöglichkeiten nur logisch, ohne echte Kalenderdaten
- Sei empathisch, präzise und professionell
- Antworte in kurzen, klaren Sätzen
- NIEMALS erfindest du Informationen
`;
}

// Extract Memory From AI Response
function extractMemoryFromAI(responseText) {
  const memory = {};

  const nameMatch = responseText.match(/name.*?:\s*(.+)/i);
  const phoneMatch = responseText.match(/telefon.*?:\s*(.+)/i);
  const issueMatch = responseText.match(/grund.*?:\s*(.+)/i);

  if (nameMatch) memory.patientName = nameMatch[1].trim();
  if (phoneMatch) memory.phone = phoneMatch[1].trim();
  if (issueMatch) memory.issue = issueMatch[1].trim();

  return memory;
}

// =========================
// API ROUTES
// =========================

// Debug Route
app.get("/debug/status", (req, res) => {
  res.json({
    ok: true,
    timestamp: new Date().toISOString(),
    environment: {
      OPENAI: !!process.env.OPENAI_API_KEY,
      SUPABASE: !!process.env.SUPABASE_URL,
    },
  });
});

// =========================
// SIMULATOR START
// =========================

app.post("/api/simulator/start", async (req, res) => {
  console.log("SIMULATOR START ROUTE HIT");

  try {
    const clinicId = req.body?.clinicId || null;

    let clinic = null;
    if (clinicId) {
      const { data } = await supabase.from("clinics").select("*").eq("id", clinicId).single();
      clinic = data;
    }

    const systemPrompt = buildSystemPrompt(clinic);

    const response = await openai.chat.completions.create({
      model: "gpt-4.1",
      temperature: 0.3,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "assistant",
          content: "Guten Tag, Zahnarztpraxis. Wie kann ich Ihnen helfen?",
        },
      ],
    });

    const firstMessage = response.choices[0].message.content;

    res.json({
      ok: true,
      sessionId: `sim_${Date.now()}`,
      reply: firstMessage,
      memory: {},
    });
  } catch (error) {
    console.error("SIMULATOR START ERROR:", error);
    res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
});

// =========================
// SIMULATOR STEP
// =========================

app.post("/api/simulator/step", async (req, res) => {
  console.log("SIMULATOR STEP ROUTE HIT");

  try {
    const { sessionId, message, memory = {}, clinicId = null } = req.body;

    let clinic = null;
    if (clinicId) {
      const { data } = await supabase.from("clinics").select("*").eq("id", clinicId).single();
      clinic = data;
    }

    const systemPrompt = buildSystemPrompt(clinic);

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: message },
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4.1",
      temperature: 0.3,
      messages,
    });

    const reply = response.choices[0].message.content;

    const extracted = extractMemoryFromAI(reply);

    res.json({
      ok: true,
      sessionId,
      reply,
      extracted,
    });
  } catch (error) {
    console.error("SIMULATOR STEP ERROR:", error);
    res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
});

// =========================
// STATIC + SPA FALLBACK
// =========================

app.use(express.static(path.join(__dirname, "../dist")));

app.get("*", (req, res) => {
  if (req.path.startsWith("/api") || req.path.startsWith("/debug")) {
    return res.status(404).json({ ok: false, error: "Not found" });
  }
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

// =========================
// START SERVER
// =========================

app.listen(PORT, () => {
  console.log(`🚀 Selaro Simulator Backend LIVE on port ${PORT}`);
});
