-- Create a helper function to check if user has any role assigned
CREATE OR REPLACE FUNCTION public.has_any_role(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
  )
$$;

-- Drop existing SELECT policies that use 'true' condition
DROP POLICY IF EXISTS "Authenticated users can select leads" ON public.leads;
DROP POLICY IF EXISTS "Authenticated users can select messages" ON public.messages_log;
DROP POLICY IF EXISTS "Authenticated users can select appointments" ON public.appointments;
DROP POLICY IF EXISTS "Authenticated users can select clinics" ON public.clinics;

-- Create new SELECT policies that require user to have an assigned role
CREATE POLICY "Staff can select leads"
ON public.leads
FOR SELECT
TO authenticated
USING (public.has_any_role(auth.uid()));

CREATE POLICY "Staff can select messages"
ON public.messages_log
FOR SELECT
TO authenticated
USING (public.has_any_role(auth.uid()));

CREATE POLICY "Staff can select appointments"
ON public.appointments
FOR SELECT
TO authenticated
USING (public.has_any_role(auth.uid()));

CREATE POLICY "Staff can select clinics"
ON public.clinics
FOR SELECT
TO authenticated
USING (public.has_any_role(auth.uid()));