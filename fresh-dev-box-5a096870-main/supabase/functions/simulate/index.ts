import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// In-memory simulator sessions
const simulatorSessions = new Map<string, {
  messages: { role: string; content: string }[];
  leadSaved: boolean;
  memory: {
    name: string | null;
    phone: string | null;
    reason: string | null;
    urgency: string | null;
    preferred_time: string | null;
    patient_type: string | null;
    insurance_status: string | null;
  };
}>();

const CLINIC_ID = Deno.env.get('CLINIC_ID') || 'bc91d95c-a05c-4004-b932-bc393f0391b6';

function getSupabaseClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  return createClient(supabaseUrl, supabaseKey);
}

async function getClinic() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('clinics')
    .select('*')
    .eq('id', CLINIC_ID)
    .maybeSingle();

  if (error) {
    console.error('Error fetching clinic:', error);
    throw error;
  }

  return data || {
    name: 'Zahnarztpraxis',
    instructions: 'Sie sind eine freundliche Rezeptionistin für eine Zahnarztpraxis.'
  };
}

function extractMemoryFromConversation(messages: { role: string; content: string }[], lastUserMessage: string) {
  const allText = messages.map(m => m.content).join(' ') + ' ' + (lastUserMessage || '');
  const lowerText = allText.toLowerCase();
  
  const memory = {
    name: null as string | null,
    phone: null as string | null,
    reason: null as string | null,
    urgency: null as string | null,
    preferred_time: null as string | null,
    patient_type: null as string | null,
    insurance_status: null as string | null
  };
  
  // Extract name
  const namePatterns = [
    /ich (?:bin|heiße|bin der|bin die)\s+([A-ZÄÖÜa-zäöü\s\-]+?)(?:\.|,|\n|das ist|mein|meine|telefon|die nummer)/i,
    /name[:\s]+([A-ZÄÖÜa-zäöü\s\-]+?)(?:\.|,|\n)/i
  ];
  for (const pattern of namePatterns) {
    const match = allText.match(pattern);
    if (match) {
      memory.name = match[1].trim();
      break;
    }
  }
  
  // Extract phone
  const phonePattern = /(\d{3,4}\s*\d{3,8}|\d{1,4}\s*\d{1,4}\s*\d{1,4}|\+49[\d\s]{8,})/g;
  const phoneMatches = allText.match(phonePattern);
  if (phoneMatches) {
    memory.phone = phoneMatches[0].trim();
  }
  
  // Extract reason and urgency
  const painKeywords = ['schmerzen', 'zahnschmerzen', 'weh', 'tut weh', 'schwellung', 'entzündung', 'notfall', 'akut'];
  
  for (const keyword of painKeywords) {
    if (lowerText.includes(keyword)) {
      const match = allText.match(new RegExp(`(?:ich habe|wegen|grund|weil|das problem ist)[^.]*${keyword}[^.]*`, 'i'));
      if (match) {
        memory.reason = match[0].trim();
        memory.urgency = 'akut';
        break;
      }
    }
  }
  
  // Set urgency
  const urgentKeywords = ['schmerzen', 'pochend', 'schwellung', 'entzündung', 'notfall', 'akut', 'schnell', 'dringend'];
  if (urgentKeywords.some(kw => lowerText.includes(kw))) {
    memory.urgency = 'akut';
  } else {
    memory.urgency = 'normal';
  }
  
  // Extract preferred time
  const timePatterns = [
    /(heute|morgen|übermorgen|nächste woche|in \d+\s*tagen)/i
  ];
  for (const pattern of timePatterns) {
    const match = allText.match(pattern);
    if (match) {
      memory.preferred_time = match[match.length - 1].trim();
      break;
    }
  }
  
  return memory;
}

function getMissingFields(memory: any) {
  const missing: string[] = [];
  const fieldOrder = ['name', 'phone', 'reason', 'preferred_time'];
  
  for (const field of fieldOrder) {
    if (!memory[field]) {
      missing.push(field);
    }
  }
  
  return missing;
}

function formatMemoryInstructions(memory: any, missingFields: string[]) {
  const collected: string[] = [];
  if (memory.name) collected.push(`- Name: ${memory.name}`);
  if (memory.phone) collected.push(`- Telefon: ${memory.phone}`);
  if (memory.reason) collected.push(`- Grund: ${memory.reason}`);
  if (memory.urgency) collected.push(`- Dringlichkeit: ${memory.urgency}`);
  if (memory.preferred_time) collected.push(`- Wunschtermin: ${memory.preferred_time}`);
  
  let memoryText = '';
  if (collected.length > 0) {
    memoryText = `\nALREADY COLLECTED:\n${collected.join('\n')}`;
  }
  
  let nextField = '';
  if (missingFields.length > 0) {
    const fieldNames: Record<string, string> = {
      'name': 'the patient\'s full name',
      'phone': 'the patient\'s phone number',
      'reason': 'why they are calling (what dental issue)',
      'preferred_time': 'when they would like to come'
    };
    nextField = `\nASK FOR: ${fieldNames[missingFields[0]]} ONLY.\nDO NOT ask for anything else.`;
  } else {
    nextField = '\nALL FIELDS COMPLETE - Output LEAD SUMMARY.';
  }
  
  return memoryText + nextField;
}

function buildSystemPrompt(clinicName: string, clinicInstructions: string, memory: any, missingFields: string[]) {
  const memoryContext = formatMemoryInstructions(memory, missingFields);
  
  return `You are an AI dental receptionist for the clinic "${clinicName}". 
You behave exactly like a trained German dental assistant (ZMF / ZFA).
You follow real-world dental practice rules in Germany.

${clinicInstructions ? `Clinic Instructions: ${clinicInstructions}` : ''}

Your goals:
1. Understand the patient's request clearly.
2. Ask ONLY the relevant questions for appointment booking.
3. Never repeat the same questions unless the patient did not answer.
4. Keep the conversation concise, warm, and highly professional.
5. Always remember patient details (name, pain symptoms, new/existing patient status, requested treatment).
6. Guide the patient through a structured appointment flow.

Appointment Flow:
1) Greeting → warm and short.
2) Ask for the patient's name (only if not already collected).
3) Understand the reason for the visit (pain, cleaning, control, emergency).
4) If pain → triage:
   - Where is the pain?
   - Since when?
   - Pain level 1–10?
5) Ask if the patient is new or existing.
6) Only THEN ask for the phone number (not earlier).
7) Offer 2 possible appointment slots.
8) Confirm appointment.
9) Close politely.

Rules:
- DO NOT ask for birthdate unless explicitly needed (rare).
- DO NOT repeat greetings or standard phrases.
- DO NOT ask for insurance too early.
- DO NOT request name again if already given.
- DO NOT ask for multiple details in one message.
- DO NOT behave like a chatbot.
- Answer as a real human receptionist.

${memoryContext}

Memory Rules:
- Always include remembered details in your responses.
- Use the patient's name naturally.
- Don't introduce new topics unless needed.

Your tone:
- warm, structured, professional, human-like.

====================================================
LANGUAGE HANDLING (CRITICAL)
====================================================

- SPEAK ONLY GERMAN, ALWAYS.
- If user speaks English, Albanian, French, or any non-German language:
  Reply ONLY: "Ich kann Ihnen nur auf Deutsch weiterhelfen. Wir können gern in einfachem Deutsch sprechen."

====================================================
WHEN ALL FIELDS ARE KNOWN
====================================================

Output this EXACT block and NOTHING ELSE:

LEAD SUMMARY
Name: <full name>
Telefon: <phone>
Grund: <reason>
Wunschtermin: <time>

Vielen Dank! Ich habe alle Daten notiert. Das Praxisteam meldet sich zur Bestätigung bei Ihnen. Einen schönen Tag!`;
}

function classifyUrgency(reason: string | null, fullText: string) {
  const textToCheck = `${reason || ''} ${fullText || ''}`.toLowerCase();
  const urgentIndicators = [
    'starke zahnschmerzen', 'sehr starke schmerzen', 'akut', 'notfall',
    'schmerzen seit gestern', 'schmerzen seit heute', 'unerträglich'
  ];
  return urgentIndicators.some(indicator => textToCheck.includes(indicator)) ? 'akut' : 'normal';
}

async function extractLeadFieldsFromText(text: string) {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiApiKey) {
    return { name: null, phone: null, reason: null, preferred_time: null };
  }

  try {
    const extractionPrompt = `Extract from this German receptionist message:
- full name
- phone number
- reason for visit
- preferred time/date

Return JSON: { "name": "string or null", "phone": "string or null", "reason": "string or null", "preferred_time": "string or null" }

Message: ${text}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Extract info from German text. Return valid JSON only.' },
          { role: 'user', content: extractionPrompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1,
        max_tokens: 200
      }),
    });

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (error) {
    console.error('Error extracting lead fields:', error);
    return { name: null, phone: null, reason: null, preferred_time: null };
  }
}

async function saveLead(leadData: any) {
  const { name, phone, reason, preferredTime, urgency, source, rawText, callSid } = leadData;

  if (!name || !phone || !reason || !preferredTime) {
    console.log('⚠️ Skipping lead save - missing required fields');
    return null;
  }

  try {
    const supabase = getSupabaseClient();

    const lead = {
      call_sid: callSid || `${source}-${Date.now()}`,
      name,
      phone,
      concern: reason,
      urgency: urgency || 'normal',
      preferred_slots: { raw: preferredTime },
      notes: rawText || null,
      status: 'new',
      source
    };

    const { data, error } = await supabase
      .from('leads')
      .insert([lead])
      .select();

    if (error) {
      console.error('Supabase lead insert error:', error);
      return null;
    }

    console.log('✅ Lead saved! ID:', data[0]?.id);
    return data[0];
  } catch (error) {
    console.error('Error saving lead:', error);
    return null;
  }
}

serve(async (req) => {
  console.log("=== SIMULATE FUNCTION CALLED ===");
  console.log("Method:", req.method);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log("SIM REQUEST BODY:", JSON.stringify(body));
    
    const { message, sessionId } = body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Message is required.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const sanitizedMessage = message.trim().substring(0, 5000);
    const sid = sessionId || `sim-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Get or create session
    let state = simulatorSessions.get(sid);
    if (!state) {
      state = {
        messages: [],
        leadSaved: false,
        memory: {
          name: null, phone: null, reason: null, urgency: null,
          preferred_time: null, patient_type: null, insurance_status: null
        }
      };
      simulatorSessions.set(sid, state);
    }

    // Add user message
    state.messages.push({ role: 'user', content: sanitizedMessage });

    // Extract memory
    state.memory = extractMemoryFromConversation(state.messages, sanitizedMessage);
    const missingFields = getMissingFields(state.memory);
    console.log('🧠 Memory update:', state.memory, '| Missing:', missingFields);

    // Get clinic
    const clinic = await getClinic();
    console.log('💬 [Simulator] Using clinic:', clinic.name);

    // Build system prompt
    const systemPrompt = buildSystemPrompt(clinic.name, clinic.instructions || '', state.memory, missingFields);

    // Call OpenAI
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    console.log("OPENAI_API_KEY exists:", !!openaiApiKey);
    
    if (!openaiApiKey) {
      console.error("OPENAI_API_KEY is missing!");
      return new Response(
        JSON.stringify({ ok: false, error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const openaiPayload = {
      model: 'gpt-4.1',
      messages: [
        { role: 'system', content: systemPrompt },
        ...state.messages
      ],
      temperature: 0.3,
      max_tokens: 200
    };
    console.log("OPENAI REQUEST:", JSON.stringify(openaiPayload, null, 2));

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(openaiPayload),
    });

    console.log("OPENAI RESPONSE STATUS:", response.status);
    const completion = await response.json();
    console.log("OPENAI RESPONSE:", JSON.stringify(completion));
    
    if (!completion.choices || !completion.choices[0]) {
      console.error("Invalid OpenAI response:", completion);
      throw new Error("Invalid response from OpenAI");
    }
    
    const reply = completion.choices[0].message.content;

    // Add AI response
    state.messages.push({ role: 'assistant', content: reply });

    // Try to extract and save lead
    if (!state.leadSaved) {
      try {
        const extractedLead = await extractLeadFieldsFromText(reply);
        const userMessages = state.messages.filter(msg => msg.role === 'user').map(msg => msg.content).join(' ');
        const urgency = classifyUrgency(extractedLead.reason, userMessages);

        const savedLead = await saveLead({
          name: extractedLead.name,
          phone: extractedLead.phone,
          reason: extractedLead.reason,
          preferredTime: extractedLead.preferred_time,
          urgency,
          source: 'simulate',
          rawText: reply,
          callSid: sid
        });

        if (savedLead) {
          state.leadSaved = true;
        }
      } catch (leadError) {
        console.error('Error extracting/saving lead:', leadError);
      }
    }

    return new Response(
      JSON.stringify({ reply, sessionId: sid, ok: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('=== SIMULATOR ERROR ===');
    console.error('Error type:', error?.constructor?.name);
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    console.error('Error stack:', error instanceof Error ? error.stack : 'N/A');
    
    return new Response(
      JSON.stringify({ 
        ok: false, 
        reply: 'Es tut mir leid, es ist ein technischer Fehler aufgetreten.',
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error?.constructor?.name
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
