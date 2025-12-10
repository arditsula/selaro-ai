-- Fix search_path for update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Fix search_path for log_twilio_message function
CREATE OR REPLACE FUNCTION public.log_twilio_message(
  p_call_sid TEXT,
  p_role TEXT,
  p_message TEXT
) RETURNS void AS $$
BEGIN
  INSERT INTO public.messages_log (call_sid, role, message)
  VALUES (p_call_sid, p_role, p_message);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;