import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useRole } from "@/contexts/RoleContext";
import { toast } from "sonner";

export interface EventData {
  id: string;
  organizer_id: string;
  title: string;
  description: string;
  category: string;
  event_mode: string;
  banner_url: string | null;
  venue_name: string | null;
  venue_address: string | null;
  virtual_link: string | null;
  start_time: string;
  end_time: string;
  capacity: number | null;
  registration_count: number;
  is_free: boolean;
  status: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  // joined
  organizer_profile?: {
    full_name: string;
    display_name: string | null;
    avatar_url: string | null;
    verification_status: string;
  };
  speakers?: EventSpeaker[];
  is_registered?: boolean;
}

export interface EventSpeaker {
  id: string;
  event_id: string;
  speaker_profile_id: string | null;
  speaker_name: string;
  speaker_title: string | null;
  speaker_avatar_url: string | null;
  topic: string | null;
  position: number;
}

export interface EventRegistration {
  id: string;
  event_id: string;
  user_id: string;
  status: string;
  registered_at: string;
  cancelled_at: string | null;
  user_profile?: {
    full_name: string;
    display_name: string | null;
    avatar_url: string | null;
  };
}

export const EVENT_CATEGORY_LABELS: Record<string, string> = {
  webinar: "Webinar",
  investor_meet: "Investor Meet",
  agm_egm: "AGM / EGM",
  nfo_ipo_launch: "NFO / IPO Launch",
  earnings_call: "Earnings Call",
  regulatory_update: "Regulatory Update",
  training_certification: "Training & Certification",
  industry_conference: "Industry Conference",
  other: "Other",
};

export const EVENT_MODE_LABELS: Record<string, string> = {
  virtual: "Virtual",
  physical: "In-Person",
  hybrid: "Hybrid",
};

export function useEvents(filters?: { category?: string; mode?: string; search?: string; upcoming?: boolean }) {
  const { userId } = useRole();
  return useQuery({
    queryKey: ["events", filters],
    queryFn: async () => {
      let query = supabase
        .from("events")
        .select("*")
        .eq("status", "published" as any)
        .order("start_time", { ascending: true });

      if (filters?.category && filters.category !== "all") {
        query = query.eq("category", filters.category as any);
      }
      if (filters?.mode && filters.mode !== "all") {
        query = query.eq("event_mode", filters.mode as any);
      }
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }
      if (filters?.upcoming !== false) {
        query = query.gte("start_time", new Date().toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;
      const events = (data || []) as unknown as EventData[];

      // Fetch organizer profiles
      const orgIds = [...new Set(events.map((e) => e.organizer_id))];
      if (orgIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, display_name, avatar_url, verification_status")
          .in("id", orgIds);
        const profileMap = new Map((profiles || []).map((p) => [p.id, p]));
        events.forEach((e) => {
          const p = profileMap.get(e.organizer_id);
          if (p) e.organizer_profile = p as any;
        });
      }

      // Fetch user registrations
      if (userId) {
        const eventIds = events.map((e) => e.id);
        if (eventIds.length > 0) {
          const { data: regs } = await supabase
            .from("event_registrations")
            .select("event_id, status")
            .eq("user_id", userId)
            .in("event_id", eventIds);
          const regMap = new Set((regs || []).filter((r: any) => r.status !== "cancelled").map((r: any) => r.event_id));
          events.forEach((e) => {
            e.is_registered = regMap.has(e.id);
          });
        }
      }

      return events;
    },
  });
}

export function useMyEvents() {
  const { userId } = useRole();
  return useQuery({
    queryKey: ["my-events", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("organizer_id", userId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as EventData[];
    },
  });
}

export function useMyRegistrations() {
  const { userId } = useRole();
  return useQuery({
    queryKey: ["my-registrations", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_registrations")
        .select("*")
        .eq("user_id", userId!)
        .neq("status", "cancelled" as any)
        .order("registered_at", { ascending: false });
      if (error) throw error;
      const regs = (data || []) as unknown as EventRegistration[];
      // Fetch event details
      const eventIds = [...new Set(regs.map((r) => r.event_id))];
      if (eventIds.length > 0) {
        const { data: events } = await supabase
          .from("events")
          .select("*")
          .in("id", eventIds);
        return { registrations: regs, events: (events || []) as unknown as EventData[] };
      }
      return { registrations: regs, events: [] as EventData[] };
    },
  });
}

export function useEventSpeakers(eventId: string | undefined) {
  return useQuery({
    queryKey: ["event-speakers", eventId],
    enabled: !!eventId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_speakers")
        .select("*")
        .eq("event_id", eventId!)
        .order("position", { ascending: true });
      if (error) throw error;
      return (data || []) as unknown as EventSpeaker[];
    },
  });
}

export function useEventRegistrations(eventId: string | undefined) {
  return useQuery({
    queryKey: ["event-registrations", eventId],
    enabled: !!eventId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_registrations")
        .select("*")
        .eq("event_id", eventId!)
        .neq("status", "cancelled" as any)
        .order("registered_at", { ascending: true });
      if (error) throw error;
      const regs = (data || []) as unknown as EventRegistration[];
      const userIds = [...new Set(regs.map((r) => r.user_id))];
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, display_name, avatar_url")
          .in("id", userIds);
        const profileMap = new Map((profiles || []).map((p) => [p.id, p]));
        regs.forEach((r) => {
          const p = profileMap.get(r.user_id);
          if (p) r.user_profile = p as any;
        });
      }
      return regs;
    },
  });
}

export function useCreateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (event: Partial<EventData>) => {
      const { data, error } = await supabase.from("events").insert(event as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["events"] });
      qc.invalidateQueries({ queryKey: ["my-events"] });
      toast.success("Event created successfully!");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useUpdateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<EventData> & { id: string }) => {
      const { error } = await supabase.from("events").update(updates as any).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["events"] });
      qc.invalidateQueries({ queryKey: ["my-events"] });
      toast.success("Event updated");
    },
    onError: (e: any) => toast.error(e.message),
  });
}

export function useRegisterForEvent() {
  const qc = useQueryClient();
  const { userId } = useRole();
  return useMutation({
    mutationFn: async ({ eventId }: { eventId: string }) => {
      const { error } = await supabase
        .from("event_registrations")
        .insert({ event_id: eventId, user_id: userId! } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["events"] });
      qc.invalidateQueries({ queryKey: ["my-registrations"] });
      qc.invalidateQueries({ queryKey: ["event-registrations"] });
      toast.success("Registered successfully!");
    },
    onError: (e: any) => {
      if (e.message?.includes("duplicate")) toast.error("You're already registered");
      else toast.error(e.message);
    },
  });
}

export function useCancelRegistration() {
  const qc = useQueryClient();
  const { userId } = useRole();
  return useMutation({
    mutationFn: async ({ eventId }: { eventId: string }) => {
      const { error } = await supabase
        .from("event_registrations")
        .update({ status: "cancelled" as any, cancelled_at: new Date().toISOString() })
        .eq("event_id", eventId)
        .eq("user_id", userId!);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["events"] });
      qc.invalidateQueries({ queryKey: ["my-registrations"] });
      qc.invalidateQueries({ queryKey: ["event-registrations"] });
      toast.success("Registration cancelled");
    },
    onError: (e: any) => toast.error(e.message),
  });
}
