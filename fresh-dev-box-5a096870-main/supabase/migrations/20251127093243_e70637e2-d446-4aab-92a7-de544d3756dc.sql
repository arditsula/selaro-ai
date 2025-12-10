-- Create clinics table
CREATE TABLE public.clinics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone_number TEXT,
  address TEXT,
  instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create leads table
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  call_sid TEXT,
  name TEXT NOT NULL,
  phone TEXT,
  concern TEXT,
  urgency TEXT DEFAULT 'normal',
  insurance TEXT,
  preferred_slots JSONB,
  notes TEXT,
  status TEXT DEFAULT 'new',
  source TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create messages_log table for debugging
CREATE TABLE public.messages_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  call_sid TEXT NOT NULL,
  role TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create appointments table
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES public.leads(id),
  patient_name TEXT NOT NULL,
  phone TEXT,
  reason TEXT,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  notes TEXT,
  status TEXT DEFAULT 'scheduled',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Clinics - public read for now (will restrict later)
CREATE POLICY "Clinics are publicly readable" ON public.clinics FOR SELECT USING (true);
CREATE POLICY "Clinics can be updated" ON public.clinics FOR UPDATE USING (true);

-- Leads - public for now (will restrict later)
CREATE POLICY "Leads are publicly readable" ON public.leads FOR SELECT USING (true);
CREATE POLICY "Anyone can insert leads" ON public.leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Leads can be updated" ON public.leads FOR UPDATE USING (true);

-- Messages log - public for now
CREATE POLICY "Messages log is publicly readable" ON public.messages_log FOR SELECT USING (true);
CREATE POLICY "Anyone can insert to messages log" ON public.messages_log FOR INSERT WITH CHECK (true);

-- Appointments - public for now
CREATE POLICY "Appointments are publicly readable" ON public.appointments FOR SELECT USING (true);
CREATE POLICY "Anyone can insert appointments" ON public.appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "Appointments can be updated" ON public.appointments FOR UPDATE USING (true);

-- Create function for automatic timestamp updates
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for timestamp updates
CREATE TRIGGER update_clinics_updated_at
  BEFORE UPDATE ON public.clinics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create RPC function for logging messages (used by edge functions)
CREATE OR REPLACE FUNCTION public.log_twilio_message(
  p_call_sid TEXT,
  p_role TEXT,
  p_message TEXT
) RETURNS void AS $$
BEGIN
  INSERT INTO public.messages_log (call_sid, role, message)
  VALUES (p_call_sid, p_role, p_message);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default clinic
INSERT INTO public.clinics (id, name, phone_number, address, instructions)
VALUES (
  'bc91d95c-a05c-4004-b932-bc393f0391b6',
  'Zahnarztpraxis Stela Xhelili',
  '+49 30 555 9999',
  'Karl-Liebknecht-Straße 1, Leipzig',
  'Sie sind eine freundliche Rezeptionistin für eine Zahnarztpraxis in Leipzig. Öffnungszeiten: Montag bis Freitag 9:00 bis 18:00 Uhr. Wir bieten Zahnreinigung, Kontrollen, Wurzelbehandlungen und Notfallversorgung. Wir akzeptieren die meisten Versicherungen.'
);