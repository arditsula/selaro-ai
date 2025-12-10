import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Clinic {
  id: string;
  name: string;
  phone_number: string | null;
  address: string | null;
  instructions: string | null;
  created_at: string;
  updated_at: string;
}

const CLINIC_ID = "bc91d95c-a05c-4004-b932-bc393f0391b6";

export function useClinic() {
  return useQuery({
    queryKey: ["clinic"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clinics")
        .select("*")
        .eq("id", CLINIC_ID)
        .maybeSingle();

      if (error) throw error;
      return data as Clinic | null;
    },
  });
}

export function useUpdateClinic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<Clinic>) => {
      const { data, error } = await supabase
        .from("clinics")
        .update(updates)
        .eq("id", CLINIC_ID)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clinic"] });
    },
  });
}
