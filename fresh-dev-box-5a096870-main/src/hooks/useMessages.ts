import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Message {
  id: string;
  call_sid: string;
  role: string;
  message: string;
  created_at: string;
}

export function useMessages(callSid: string | null) {
  return useQuery({
    queryKey: ["messages", callSid],
    queryFn: async () => {
      if (!callSid) return [];
      
      const { data, error } = await supabase
        .from("messages_log")
        .select("*")
        .eq("call_sid", callSid)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as Message[];
    },
    enabled: !!callSid,
  });
}

export function useCreateMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (message: Omit<Message, "id" | "created_at">) => {
      const { data, error } = await supabase
        .from("messages_log")
        .insert([message])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["messages", variables.call_sid] });
    },
  });
}
