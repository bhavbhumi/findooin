/**
 * AdminEventsManagement — Admin view for managing all platform events.
 * Provides stats, filtering, and moderation (publish, cancel, delete).
 */
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FindooLoader } from "@/components/FindooLoader";
import { toast } from "sonner";
import {
  Calendar, Search, ChevronLeft, ChevronRight, Eye, Users,
  Trash2, MapPin, Clock, Globe, Monitor, Play, XCircle, CheckCircle2
} from "lucide-react";
import { formatDistanceToNow, format, isPast } from "date-fns";

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground border-border",
  published: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
  completed: "bg-accent/10 text-accent border-accent/20",
};

const modeIcons: Record<string, typeof Globe> = {
  virtual: Monitor,
  physical: MapPin,
  hybrid: Globe,
};

const PAGE_SIZE = 15;

export function AdminEventsManagement() {

function EventsTab() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modeFilter, setModeFilter] = useState("all");
  const [page, setPage] = useState(1);

  const { data: events, isLoading } = useQuery({
    queryKey: ["admin-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("start_time", { ascending: false });
      if (error) throw error;
      const orgIds = [...new Set((data || []).map((e) => e.organizer_id))];
      const { data: profiles } = orgIds.length > 0
        ? await supabase.from("profiles").select("id, full_name, display_name, avatar_url").in("id", orgIds)
        : { data: [] };
      const profileMap = Object.fromEntries((profiles || []).map((p) => [p.id, p]));
      return (data || []).map((e) => ({ ...e, organizer_profile: profileMap[e.organizer_id] || null }));
    },
  });

  const updateEvent = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "draft" | "published" | "cancelled" | "completed" }) => {
      const { error } = await supabase.from("events").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      toast.success("Event status updated");
    },
  });

  const deleteEvent = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      toast.success("Event deleted");
    },
  });

  const filtered = useMemo(() => {
    if (!events) return [];
    return events.filter((e) => {
      if (statusFilter !== "all" && e.status !== statusFilter) return false;
      if (modeFilter !== "all" && e.event_mode !== modeFilter) return false;
      if (search) {
        return e.title.toLowerCase().includes(search.toLowerCase());
      }
      return true;
    });
  }, [events, search, statusFilter, modeFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const stats = useMemo(() => {
    if (!events) return { total: 0, published: 0, draft: 0, upcoming: 0, totalRegs: 0 };
    const now = new Date();
    return {
      total: events.length,
      published: events.filter((e) => e.status === "published").length,
      draft: events.filter((e) => e.status === "draft").length,
      upcoming: events.filter((e) => e.status === "published" && new Date(e.start_time) > now).length,
      totalRegs: events.reduce((s, e) => s + (e.registration_count || 0), 0),
    };
  }, [events]);

  if (isLoading) return <FindooLoader text="Loading events..." />;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Total Events", value: stats.total, icon: Calendar },
          { label: "Published", value: stats.published, icon: CheckCircle2 },
          { label: "Drafts", value: stats.draft, icon: Clock },
          { label: "Upcoming", value: stats.upcoming, icon: Play },
          { label: "Registrations", value: stats.totalRegs, icon: Users },
        ].map((s) => (
          <Card key={s.label} className="border-border/50">
            <CardContent className="p-3 flex items-center gap-2">
              <s.icon className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-lg font-bold leading-none">{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search events..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9 h-9" />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[130px] h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={modeFilter} onValueChange={(v) => { setModeFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[130px] h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Modes</SelectItem>
            <SelectItem value="virtual">Virtual</SelectItem>
            <SelectItem value="physical">Physical</SelectItem>
            <SelectItem value="hybrid">Hybrid</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <p className="text-xs text-muted-foreground">{filtered.length} event{filtered.length !== 1 ? "s" : ""}</p>

      {/* Event list */}
      <div className="space-y-2">
        {paged.map((event) => {
          const organizer = event.organizer_profile as any;
          const ModeIcon = modeIcons[event.event_mode] || Globe;
          const isUpcoming = !isPast(new Date(event.start_time));

          return (
            <Card key={event.id} className="border-border/50">
              <CardContent className="p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold truncate">{event.title}</h3>
                      <Badge variant="outline" className={`text-[9px] ${statusColors[event.status] || ""}`}>
                        {event.status}
                      </Badge>
                      <Badge variant="outline" className="text-[9px] gap-0.5">
                        <ModeIcon className="h-2.5 w-2.5" /> {event.event_mode}
                      </Badge>
                      {isUpcoming && event.status === "published" && (
                        <Badge variant="outline" className="text-[9px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Upcoming</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{format(new Date(event.start_time), "MMM d, yyyy h:mm a")}</span>
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" />{event.registration_count}{event.capacity ? `/${event.capacity}` : ""} regs</span>
                      <span className="flex items-center gap-1">{event.category.replace(/_/g, " ")}</span>
                    </div>
                    {organizer && (
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Organizer: {organizer.display_name || organizer.full_name}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {event.status === "draft" && (
                      <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => updateEvent.mutate({ id: event.id, status: "published" })}>
                        <CheckCircle2 className="h-3 w-3" /> Publish
                      </Button>
                    )}
                    {event.status === "published" && (
                      <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => updateEvent.mutate({ id: event.id, status: "cancelled" })}>
                        <XCircle className="h-3 w-3" /> Cancel
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive hover:text-destructive" onClick={() => deleteEvent.mutate(event.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {paged.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Calendar className="h-8 w-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No events found</p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}><ChevronLeft className="h-4 w-4" /></Button>
          <span className="text-xs text-muted-foreground">Page {page} of {totalPages}</span>
          <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage(page + 1)}><ChevronRight className="h-4 w-4" /></Button>
        </div>
      )}
    </div>
  );
}
