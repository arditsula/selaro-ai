import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// In-memory conversation state (per call)
const conversationStates = new Map<string, {
  messages: { role: string; content: string }[];
  leadSaved: boolean;
  fromNumber: string;
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

// Default clinic ID
const CLINIC_ID = Deno.env.get('CLINIC_ID') || 'bc91d95c-a05c-4004-b932-bc393f0391b6';

// Get Supabase client
function getSupabaseClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  return createClient(supabaseUrl, supabaseKey);
}

// Fetch clinic data from Supabase
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

// Extract memory from conversation
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
  const procedureKeywords = ['kontrolle', 'untersuchung', 'zahnreinigung', 'putzen', 'prophylaxe', 'bleaching'];
  
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
  
  if (!memory.reason) {
    for (const keyword of procedureKeywords) {
      if (lowerText.includes(keyword)) {
        const match = allText.match(new RegExp(`(?:ich möchte|ich brauche|grund|wegen|weil)[^.]*${keyword}[^.]*`, 'i'));
        if (match) {
          memory.reason = match[0].trim();
          break;
        }
      }
    }
  }
  
  // Set urgency if not already set
  const urgentKeywords = ['schmerzen', 'pochend', 'schwellung', 'entzündung', 'notfall', 'akut', 'schnell', 'dringend'];
  if (urgentKeywords.some(kw => lowerText.includes(kw))) {
    memory.urgency = 'akut';
  } else {
    memory.urgency = 'normal';
  }
  
  // Extract preferred time
  const timePatterns = [
    /(?:wunsch|möchte|lieber|gerne).*?(?:termin|zeit|kommen|besuch).*?(heute|morgen|übermorgen|nächste woche|nächsten montag|nächsten dienstag|nächsten mittwoch|nächsten donnerstag|nächsten freitag|nächsten samstag|nächsten sonntag|in \d+\s*tagen|am \d{1,2}\.\d{1,2}\.|\d{1,2}\.\d{1,2}\.)/i,
    /(heute|morgen|übermorgen|nächste woche|in \d+\s*tagen)/i
  ];
  for (const pattern of timePatterns) {
    const match = allText.match(pattern);
    if (match) {
      memory.preferred_time = match[match.length - 1].trim();
      break;
    }
  }
  
  // Extract patient type
  if (lowerText.includes('bin zum ersten mal') || lowerText.includes('bin neu')) {
    memory.patient_type = 'neu';
  } else if (lowerText.includes('bin schon patient') || lowerText.includes('bin bereits')) {
    memory.patient_type = 'bestehend';
  }
  
  return memory;
}

// Get missing fields
function getMissingFields(memory: typeof conversationStates extends Map<string, { memory: infer T }> ? T : never) {
  const missing: string[] = [];
  const fieldOrder = ['name', 'phone', 'reason', 'preferred_time'];
  
  for (const field of fieldOrder) {
    if (!memory[field as keyof typeof memory]) {
      missing.push(field);
    }
  }
  
  return missing;
}

// Format memory instructions for system prompt
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

// Build system prompt
function buildSystemPrompt(clinicName: string, clinicInstructions: string, memory: any, missingFields: string[]) {
  const memoryContext = formatMemoryInstructions(memory, missingFields);
  
  return `You are a professional German dental receptionist for ${clinicName}.
${clinicInstructions}

====================================================
INTELLIGENT RECEPTIONIST - MEMORY-BASED FLOW
====================================================

Your job is to collect these 4 fields (in this order):
1) Full Name
2) Phone Number  
3) Reason for visit / dental concern
4) Preferred appointment time

${memoryContext}

MEMORY RULES (MANDATORY):
- NEVER ask for a field the user already provided
- NEVER ask for multiple fields in one question
- ONLY ask for the NEXT missing field
- If user provides multiple fields at once, acknowledge ALL
- Be human-like and conversational

====================================================
LANGUAGE HANDLING (CRITICAL)
====================================================

- SPEAK ONLY GERMAN, ALWAYS.
- If user speaks English, Albanian, French, or any non-German language:
  Reply ONLY: "Ich kann Ihnen nur auf Deutsch weiterhelfen. Wir können gern in einfachem Deutsch sprechen."
- NEVER respond in any other language.

====================================================
INTERACTION STYLE
====================================================

- Keep responses SHORT (max 2 sentences)
- Always acknowledge what patient said
- Vary your phrasing to sound natural

URGENCY DETECTION:
If patient mentions: "Schmerzen", "starke Schmerzen", "pochend", "Schwellung", "Entzündung", "Notfall"
→ Say: "Das klingt nach einem akuten Fall. Damit wir schnell helfen können, nehme ich kurz Ihre Daten auf."
→ Mark urgency as AKUT

====================================================
WHEN ALL 4 FIELDS ARE KNOWN
====================================================

Output this EXACT block and NOTHING ELSE:

LEAD SUMMARY
Name: <full name>
Telefon: <phone>
Grund: <reason>
Wunschtermin: <time>

Vielen Dank! Ich habe alle Daten notiert. Das Praxisteam meldet sich zur Bestätigung bei Ihnen. Einen schönen Tag!

====================================================
NEVER
====================================================

- Ask for a field twice with identical wording
- Give prices or medical advice
- Make up appointment slots
- Continue after LEAD SUMMARY
- Ask multiple questions at once
- Explain that you are an AI or a program
- Respond in any language except German`;
}

// Classify urgency
function classifyUrgency(reason: string | null, fullText: string) {
  const textToCheck = `${reason || ''} ${fullText || ''}`.toLowerCase();
  
  const urgentIndicators = [
    'starke zahnschmerzen', 'starken zahnschmerzen', 'starker zahnschmerz',
    'sehr starke schmerzen', 'sehr starken schmerzen', 'starke schmerzen',
    'starken schmerzen', 'sehr weh', 'akut', 'notfall', 'schmerzen seit gestern',
    'schmerzen seit heute', 'unerträglich', 'kaum aushalten', 'schlimme schmerzen',
    'schlimmen schmerzen'
  ];
  
  const isUrgent = urgentIndicators.some(indicator => textToCheck.includes(indicator));
  return isUrgent ? 'akut' : 'normal';
}

// Extract lead fields from AI response using OpenAI
async function extractLeadFieldsFromText(text: string) {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiApiKey) {
    console.warn('OpenAI API key not configured');
    return { name: null, phone: null, reason: null, preferred_time: null };
  }

  try {
    console.log('🔍 Extracting lead fields from text...');
    
    const extractionPrompt = `You are an information extractor. From the following German receptionist message, extract these fields:
- full name (patient's complete name)
- phone number (with country code if present)
- reason for visit (brief description of dental issue)
- preferred time/date (when patient wants appointment)

If a field is not mentioned or unclear, return null for that field.

Return ONLY a valid JSON object with this exact structure:
{
  "name": "string or null",
  "phone": "string or null",
  "reason": "string or null",
  "preferred_time": "string or null"
}

Receptionist message:
${text}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You extract structured information from German text. Always return valid JSON.' },
          { role: 'user', content: extractionPrompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1,
        max_tokens: 300
      }),
    });

    const data = await response.json();
    const extracted = JSON.parse(data.choices[0].message.content);
    console.log('✅ Extracted lead fields:', extracted);
    
    return {
      name: extracted.name || null,
      phone: extracted.phone || null,
      reason: extracted.reason || null,
      preferred_time: extracted.preferred_time || null
    };
  } catch (error) {
    console.error('❌ Error extracting lead fields:', error);
    return { name: null, phone: null, reason: null, preferred_time: null };
  }
}

// Save lead to Supabase
async function saveLead(leadData: {
  name: string | null;
  phone: string | null;
  reason: string | null;
  preferredTime: string | null;
  urgency: string;
  source: string;
  rawText: string;
  callSid: string;
}) {
  const { name, phone, reason, preferredTime, urgency, source, rawText, callSid } = leadData;

  // Only save when all required fields are present
  if (!name || !phone || !reason || !preferredTime) {
    console.log('⚠️ Skipping lead save - missing required fields:', {
      hasName: !!name, hasPhone: !!phone, hasReason: !!reason, hasPreferredTime: !!preferredTime
    });
    return null;
  }

  try {
    console.log('💾 Saving lead to Supabase...');
    const supabase = getSupabaseClient();

    const lead = {
      call_sid: callSid || `${source}-${Date.now()}`,
      name,
      phone,
      concern: reason,
      urgency: urgency || 'normal',
      insurance: null,
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
      console.error('❌ Supabase lead insert error:', error);
      throw error;
    }

    console.log('✅ Lead saved successfully! ID:', data[0]?.id);
    return data[0];
  } catch (error) {
    console.error('❌ Error saving lead:', error);
    return null;
  }
}

// Generate TwiML response
function generateTwiML(text: string, actionUrl: string, isEnd = false): string {
  if (isEnd) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say language="de-DE">${escapeXml(text)}</Say>
  <Hangup/>
</Response>`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Gather input="speech" action="${actionUrl}" method="POST" timeout="4">
    <Say language="de-DE">${escapeXml(text)}</Say>
  </Gather>
</Response>`;
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Twilio signature validation
async function validateTwilioSignature(req: Request, formData: FormData): Promise<boolean> {
  const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
  if (!twilioAuthToken) {
    console.error('TWILIO_AUTH_TOKEN not configured - skipping signature validation');
    return false;
  }

  const signature = req.headers.get('X-Twilio-Signature');
  if (!signature) {
    console.error('Missing X-Twilio-Signature header');
    return false;
  }

  // Build the validation URL (the full URL that Twilio called)
  const baseUrl = Deno.env.get('SUPABASE_URL')!;
  const validationUrl = `${baseUrl}/functions/v1/twilio-voice`;

  // Sort form params alphabetically and append to URL
  const params: Record<string, string> = {};
  formData.forEach((value, key) => {
    params[key] = value.toString();
  });
  
  const sortedKeys = Object.keys(params).sort();
  let dataToSign = validationUrl;
  for (const key of sortedKeys) {
    dataToSign += key + params[key];
  }

  // Compute HMAC-SHA1
  const encoder = new TextEncoder();
  const keyData = encoder.encode(twilioAuthToken);
  const messageData = encoder.encode(dataToSign);
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );
  
  const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
  const computedSignature = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)));

  const isValid = computedSignature === signature;
  if (!isValid) {
    console.error('Invalid Twilio signature', { expected: computedSignature, received: signature });
  }
  return isValid;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse form data from Twilio
    const formData = await req.formData();

    // Validate Twilio signature to prevent forged requests
    const isValidSignature = await validateTwilioSignature(req, formData);
    if (!isValidSignature) {
      console.error('🚫 Rejected request with invalid Twilio signature');
      return new Response('Forbidden: Invalid signature', { 
        status: 403, 
        headers: corsHeaders 
      });
    }
    const speechResult = formData.get('SpeechResult') as string | null;
    const fromNumber = formData.get('From') as string || '';
    const callSid = formData.get('CallSid') as string || `call-${Date.now()}`;

    console.log('📞 Twilio voice request:', { callSid, speechResult: speechResult?.substring(0, 50), fromNumber });

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      console.error('OPENAI_API_KEY not configured');
      return new Response(
        generateTwiML('Es tut mir leid, der Service ist momentan nicht verfügbar.', '', true),
        { headers: { ...corsHeaders, 'Content-Type': 'text/xml' } }
      );
    }

    // Get base URL for action
    const baseUrl = Deno.env.get('SUPABASE_URL')!;
    const actionUrl = `${baseUrl}/functions/v1/twilio-voice`;

    // FIRST REQUEST (no SpeechResult) - Initialize conversation
    if (!speechResult) {
      conversationStates.set(callSid, {
        messages: [],
        leadSaved: false,
        fromNumber: fromNumber,
        memory: {
          name: null, phone: null, reason: null, urgency: null,
          preferred_time: null, patient_type: null, insurance_status: null
        }
      });

      const greeting = 'Guten Tag, Sie sind mit der Zahnarztpraxis Stela Xhelili in der Karl-Liebknecht-Straße 1 in Leipzig verbunden. Wie kann ich Ihnen helfen?';
      
      return new Response(
        generateTwiML(greeting, actionUrl),
        { headers: { ...corsHeaders, 'Content-Type': 'text/xml' } }
      );
    }

    // SUBSEQUENT REQUESTS
    let state = conversationStates.get(callSid);
    if (!state) {
      state = {
        messages: [],
        leadSaved: false,
        fromNumber: fromNumber,
        memory: {
          name: null, phone: null, reason: null, urgency: null,
          preferred_time: null, patient_type: null, insurance_status: null
        }
      };
      conversationStates.set(callSid, state);
    }

    // Add user message
    state.messages.push({ role: 'user', content: speechResult });

    // Extract memory
    state.memory = extractMemoryFromConversation(state.messages, speechResult);
    const missingFields = getMissingFields(state.memory);
    console.log('🧠 Memory update:', state.memory, '| Missing:', missingFields);

    // Get clinic data
    const clinic = await getClinic();
    console.log('📞 Using clinic:', clinic.name);

    // Build system prompt
    const systemPrompt = buildSystemPrompt(clinic.name, clinic.instructions || '', state.memory, missingFields);

    // Call OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...state.messages
        ],
        temperature: 0.7,
        max_tokens: 200
      }),
    });

    const completion = await response.json();
    const aiReply = completion.choices[0].message.content;

    // Add AI response to history
    state.messages.push({ role: 'assistant', content: aiReply });

    // Try to extract and save lead
    if (!state.leadSaved) {
      try {
        console.log('🔎 Attempting to extract lead...');
        const extractedLead = await extractLeadFieldsFromText(aiReply);
        
        const userMessages = state.messages
          .filter(msg => msg.role === 'user')
          .map(msg => msg.content)
          .join(' ');
        
        const urgency = classifyUrgency(extractedLead.reason, userMessages);

        const savedLead = await saveLead({
          name: extractedLead.name,
          phone: extractedLead.phone,
          reason: extractedLead.reason,
          preferredTime: extractedLead.preferred_time,
          urgency,
          source: 'twilio',
          rawText: aiReply,
          callSid
        });

        if (savedLead) {
          state.leadSaved = true;
          console.log('✅ Lead saved! ID:', savedLead.id);
        }
      } catch (leadError) {
        console.error('⚠️ Error extracting/saving lead:', leadError);
      }
    }

    // Check if conversation should end
    const shouldEnd = aiReply.includes('LEAD SUMMARY') || 
                      aiReply.includes('Einen schönen Tag') ||
                      state.messages.length >= 12;

    return new Response(
      generateTwiML(aiReply, actionUrl, shouldEnd),
      { headers: { ...corsHeaders, 'Content-Type': 'text/xml' } }
    );

  } catch (error) {
    console.error('Error in twilio-voice:', error);
    return new Response(
      generateTwiML('Es ist ein technischer Fehler aufgetreten. Bitte rufen Sie später noch einmal an.', '', true),
      { headers: { ...corsHeaders, 'Content-Type': 'text/xml' } }
    );
  }
});
