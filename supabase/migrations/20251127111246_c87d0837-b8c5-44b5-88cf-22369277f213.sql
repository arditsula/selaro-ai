-- 1. Create app_role enum and user_roles table
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 2. Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
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
      AND role = _role
  )
$$;

-- 3. RLS policy for user_roles table itself
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Service role can manage all roles"
ON public.user_roles FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 4. Drop existing permissive policies on leads
DROP POLICY IF EXISTS "Anyone can insert leads" ON public.leads;
DROP POLICY IF EXISTS "Leads are publicly readable" ON public.leads;
DROP POLICY IF EXISTS "Leads can be updated" ON public.leads;

-- 5. Create new secure policies for leads
CREATE POLICY "Authenticated users can select leads"
ON public.leads FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Service role can insert leads"
ON public.leads FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Admins or service role can update leads"
ON public.leads FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role can update leads"
ON public.leads FOR UPDATE
TO service_role
USING (true);

CREATE POLICY "Admins can delete leads"
ON public.leads FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role can delete leads"
ON public.leads FOR DELETE
TO service_role
USING (true);

-- 6. Drop existing permissive policies on messages_log
DROP POLICY IF EXISTS "Anyone can insert to messages log" ON public.messages_log;
DROP POLICY IF EXISTS "Messages log is publicly readable" ON public.messages_log;

-- 7. Create new secure policies for messages_log
CREATE POLICY "Authenticated users can select messages"
ON public.messages_log FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Service role can insert messages"
ON public.messages_log FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Admins can update messages"
ON public.messages_log FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete messages"
ON public.messages_log FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role can manage messages"
ON public.messages_log FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 8. Drop existing permissive policies on appointments
DROP POLICY IF EXISTS "Anyone can insert appointments" ON public.appointments;
DROP POLICY IF EXISTS "Appointments are publicly readable" ON public.appointments;
DROP POLICY IF EXISTS "Appointments can be updated" ON public.appointments;

-- 9. Create new secure policies for appointments
CREATE POLICY "Authenticated users can select appointments"
ON public.appointments FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Service role can insert appointments"
ON public.appointments FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Admins can update appointments"
ON public.appointments FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role can update appointments"
ON public.appointments FOR UPDATE
TO service_role
USING (true);

CREATE POLICY "Admins can delete appointments"
ON public.appointments FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role can delete appointments"
ON public.appointments FOR DELETE
TO service_role
USING (true);

-- 10. Drop existing permissive policies on clinics
DROP POLICY IF EXISTS "Clinics are publicly readable" ON public.clinics;
DROP POLICY IF EXISTS "Clinics can be updated" ON public.clinics;

-- 11. Create new secure policies for clinics
CREATE POLICY "Authenticated users can select clinics"
ON public.clinics FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can insert clinics"
ON public.clinics FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role can insert clinics"
ON public.clinics FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Admins can update clinics"
ON public.clinics FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role can update clinics"
ON public.clinics FOR UPDATE
TO service_role
USING (true);

CREATE POLICY "Admins can delete clinics"
ON public.clinics FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role can delete clinics"
ON public.clinics FOR DELETE
TO service_role
USING (true);