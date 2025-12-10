import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Lead {
  id: string;
  call_sid: string | null;
  name: string;
  phone: string | null;
  concern: string | null;
  urgency: string | null;
  insurance: string | null;
  preferred_slots: { raw?: string } | null;
  notes: string | null;
  status: string | null;
  source: string | null;
  created_at: string;
  updated_at: string;
}

export function useLeads() {
  return useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Lead[];
    },
  });
}

export function useLead(id: string) {
  return useQuery({
    queryKey: ["leads", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return data as Lead | null;
    },
    enabled: !!id,
  });
}

export function useUpdateLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Lead>;
    }) => {
      const { data, error } = await supabase
        .from("leads")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
}

export function useRecentLeads(limit = 5) {
  return useQuery({
    queryKey: ["leads", "recent", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as Lead[];
    },
  });
}

export function useLeadStats() {
  return useQuery({
    queryKey: ["leads", "stats"],
    queryFn: async () => {
      const { data, error } = await supabase.from("leads").select("*");

      if (error) throw error;

      const leads = data as Lead[];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return {
        total: leads.length,
        new: leads.filter((l) => l.status === "new").length,
        urgent: leads.filter((l) => l.urgency === "akut").length,
        todayCount: leads.filter((l) => new Date(l.created_at) >= today).length,
      };
    },
  });
}
