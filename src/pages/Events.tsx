import { useState, useMemo, memo } from "react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, CalendarDays, Sparkles, FolderOpen } from "lucide-react";
import { useEvents, useMyRegistrations, useRegisterForEvent, useCancelRegistration, EVENT_CATEGORY_LABELS } from "@/hooks/useEvents";
import { useRole } from "@/contexts/RoleContext";
import { EventCard } from "@/components/events/EventCard";
import { EventCardSkeleton } from "@/components/skeletons/EventCardSkeleton";
import { EventDetailSheet } from "@/components/events/EventDetailSheet";
import { CreateEventDialog } from "@/components/events/CreateEventDialog";
import { OrganizerDashboard } from "@/components/events/OrganizerDashboard";
import { EventsSidebar } from "@/components/events/EventsSidebar";
import AppLayout from "@/components/AppLayout";
import { MobileFilterDrawer } from "@/components/MobileFilterDrawer";
import { EmptyState } from "@/components/ui/empty-state";
import { EmptyEventsIllustration } from "@/components/illustrations/EmptyStateIllustrations";
import type { EventData } from "@/hooks/useEvents";
import { isSameDay, isPast, format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const MemoizedEventsSidebar = memo(EventsSidebar);

const Events = () => {
  usePageMeta({ title: "Events", description: "Discover and host investor meets, webinars, AGMs, and industry events." });
  const { activeRole, userId } = useRole();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [mode, setMode] = useState("all");
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();

  const { data: events, isLoading } = useEvents({
    search: search || undefined,
    category: category !== "all" ? category : undefined,
    mode: mode !== "all" ? mode : undefined,
  });

  const { data: myRegistrations, isLoading: regsLoading } = useMyRegistrations();

  const registerMutation = useRegisterForEvent();
  const cancelMutation = useCancelRegistration();

  const canCreateEvents = activeRole === "issuer" || activeRole === "intermediary" || activeRole === "admin";

  // User profile for suggestions
  const { data: userProfile } = useQuery({
    queryKey: ["profile-events-suggest", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("user_type, certifications, specializations, location").eq("id", userId!).maybeSingle();
      return data;
    },
  });

  const filteredEvents = useMemo(() => {
    if (!events) return [];
    if (!selectedDate) return events;
    return events.filter((e) => isSameDay(new Date(e.start_time), selectedDate));
  }, [events, selectedDate]);

  const eventDates = useMemo(() => {
    return events?.map((e) => new Date(e.start_time)) || [];
  }, [events]);

  // Suggested events: match by category relevance, tags overlap with user certs/specializations
  const suggestedEvents = useMemo(() => {
    if (!events || !userProfile) return [];
    const userTags = new Set([
      ...(userProfile.certifications || []),
      ...(userProfile.specializations || []),
    ].map((s: string) => s.toLowerCase()));

    if (userTags.size === 0 && !userProfile.location) return [];

    const registeredIds = new Set(myRegistrations?.map((r) => r.event_id) || []);

    return events
      .filter((e) => !isPast(new Date(e.end_time)) && !registeredIds.has(e.id))
      .map((event) => {
        let score = 0;
        // Tag/cert overlap
        const eventTags = (event.tags || []).map((t: string) => t.toLowerCase());
        if (eventTags.length > 0 && userTags.size > 0) {
          const matched = eventTags.filter((t: string) => userTags.has(t)).length;
          score += matched * 20;
        }
        // Location match
        if (event.venue_address && userProfile.location) {
          if (event.venue_address.toLowerCase().includes(userProfile.location.toLowerCase())) score += 15;
        }
        // Virtual events get a small boost (accessible to all)
        if (event.event_mode === "virtual") score += 5;
        return { event, score };
      })
      .filter((e) => e.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((e) => e.event);
  }, [events, userProfile, myRegistrations]);

  // My Events: registered events split into upcoming/past
  const myUpcomingEvents = useMemo(() => {
    if (!myRegistrations || !events) return [];
    const eventMap = new Map(events.map((e) => [e.id, e]));
    return myRegistrations
      .filter((r) => r.status === "registered" && eventMap.has(r.event_id))
      .map((r) => eventMap.get(r.event_id)!)
      .filter((e) => !isPast(new Date(e.end_time)));
  }, [myRegistrations, events]);

  const myPastEvents = useMemo(() => {
    if (!myRegistrations || !events) return [];
    const eventMap = new Map(events.map((e) => [e.id, e]));
    return myRegistrations
      .filter((r) => eventMap.has(r.event_id))
      .map((r) => eventMap.get(r.event_id)!)
      .filter((e) => isPast(new Date(e.end_time)));
  }, [myRegistrations, events]);

  const handleCategoryClick = (cat: string) => setCategory(cat);

  return (
    <AppLayout maxWidth="max-w-6xl">
      <MobileFilterDrawer title="Events Filters & Calendar">
        <EventsSidebar onCategoryClick={handleCategoryClick} selectedDate={selectedDate} onDateSelect={setSelectedDate} eventDates={eventDates} />
      </MobileFilterDrawer>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        <div className="min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-heading font-bold text-foreground">Events</h1>
              <p className="text-sm text-muted-foreground">Webinars, investor meets & industry events</p>
            </div>
            {canCreateEvents && (
              <Button onClick={() => setShowCreate(true)} className="gap-1.5">
                <Plus className="h-4 w-4" /> Create Event
              </Button>
            )}
          </div>

          <Tabs defaultValue="browse" className="space-y-4">
            <div className="overflow-x-auto -mx-1 px-1 scrollbar-hide">
              <TabsList className="inline-flex w-max sm:w-auto bg-muted/50">
                <TabsTrigger value="browse" className="gap-1.5 whitespace-nowrap">
                  <CalendarDays className="h-3.5 w-3.5" /> Browse
                </TabsTrigger>
                <TabsTrigger value="suggested" className="gap-1.5 whitespace-nowrap">
                  <Sparkles className="h-3.5 w-3.5" /> Suggested
                </TabsTrigger>
                <TabsTrigger value="my-events" className="gap-1.5 whitespace-nowrap">
                  <FolderOpen className="h-3.5 w-3.5" /> My Events
                </TabsTrigger>
              </TabsList>
            </div>

            {/* ─── Browse Tab ─── */}
            <TabsContent value="browse" className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 min-w-0">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search events..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <div className="flex gap-2">
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Category" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {Object.entries(EVENT_CATEGORY_LABELS).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={mode} onValueChange={setMode}>
                    <SelectTrigger className="w-full sm:w-[130px]"><SelectValue placeholder="Mode" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Modes</SelectItem>
                      <SelectItem value="virtual">Virtual</SelectItem>
                      <SelectItem value="physical">In-Person</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {selectedDate && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Showing events on {selectedDate.toLocaleDateString()}</span>
                  <Button variant="ghost" size="sm" className="text-xs h-6" onClick={() => setSelectedDate(undefined)}>Clear</Button>
                </div>
              )}

              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => <EventCardSkeleton key={i} />)}
                </div>
              ) : !filteredEvents.length ? (
                <EmptyState
                  illustration={<EmptyEventsIllustration />}
                  icon={CalendarDays}
                  title={selectedDate ? "No events on this date" : "No upcoming events"}
                  description={selectedDate ? "Try selecting a different date or clear the filter." : "Check back later — webinars, investor meets, and conferences are added regularly."}
                  actionLabel={canCreateEvents ? "Create Event" : undefined}
                  onAction={canCreateEvents ? () => setShowCreate(true) : undefined}
                />
              ) : (
                <div className="space-y-3">
                  {filteredEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onClick={() => setSelectedEvent(event)}
                      onRegister={() => registerMutation.mutate({ eventId: event.id })}
                      onCancelRegistration={() => cancelMutation.mutate({ eventId: event.id })}
                      isRegistering={registerMutation.isPending}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* ─── Suggested Tab ─── */}
            <TabsContent value="suggested" className="space-y-4">
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => <EventCardSkeleton key={i} />)}
                </div>
              ) : suggestedEvents.length === 0 ? (
                <EmptyState
                  illustration={<EmptyEventsIllustration />}
                  icon={Sparkles}
                  title="No suggested events yet"
                  description="Complete your profile with certifications, specializations, and location to get personalized event recommendations."
                />
              ) : (
                <div className="space-y-3">
                  {suggestedEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onClick={() => setSelectedEvent(event)}
                      onRegister={() => registerMutation.mutate({ eventId: event.id })}
                      onCancelRegistration={() => cancelMutation.mutate({ eventId: event.id })}
                      isRegistering={registerMutation.isPending}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* ─── My Events Tab ─── */}
            <TabsContent value="my-events" className="space-y-6">
              {/* Organizer section */}
              {canCreateEvents && (
                <div>
                  <h3 className="font-heading font-semibold text-sm mb-3 text-foreground">Organized by Me</h3>
                  <OrganizerDashboard />
                </div>
              )}

              {/* Attendee section: upcoming registrations */}
              <div>
                {canCreateEvents && <div className="border-t border-border my-4" />}
                <h3 className="font-heading font-semibold text-sm mb-3 text-foreground">
                  Upcoming Registrations
                  {myUpcomingEvents.length > 0 && (
                    <Badge variant="secondary" className="ml-2 text-[10px]">{myUpcomingEvents.length}</Badge>
                  )}
                </h3>
                {regsLoading ? (
                  <div className="space-y-3">
                    {[1, 2].map((i) => <EventCardSkeleton key={i} />)}
                  </div>
                ) : myUpcomingEvents.length === 0 ? (
                  <EmptyState
                    icon={CalendarDays}
                    title="No upcoming registrations"
                    description="Browse events and register to see them here."
                  />
                ) : (
                  <div className="space-y-3">
                    {myUpcomingEvents.map((event) => (
                      <EventCard
                        key={event.id}
                        event={event}
                        onClick={() => setSelectedEvent(event)}
                        onRegister={() => registerMutation.mutate({ eventId: event.id })}
                        onCancelRegistration={() => cancelMutation.mutate({ eventId: event.id })}
                        isRegistering={registerMutation.isPending}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Past events */}
              {myPastEvents.length > 0 && (
                <div>
                  <div className="border-t border-border my-4" />
                  <h3 className="font-heading font-semibold text-sm mb-3 text-muted-foreground">
                    Past Events
                    <Badge variant="outline" className="ml-2 text-[10px]">{myPastEvents.length}</Badge>
                  </h3>
                  <div className="space-y-3 opacity-70">
                    {myPastEvents.map((event) => (
                      <EventCard
                        key={event.id}
                        event={event}
                        onClick={() => setSelectedEvent(event)}
                        onRegister={() => {}}
                        onCancelRegistration={() => {}}
                        isRegistering={false}
                      />
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-20">
            <MemoizedEventsSidebar onCategoryClick={handleCategoryClick} selectedDate={selectedDate} onDateSelect={setSelectedDate} eventDates={eventDates} />
          </div>
        </aside>
      </div>

      <EventDetailSheet
        event={selectedEvent}
        open={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onRegister={() => selectedEvent && registerMutation.mutate({ eventId: selectedEvent.id })}
        onCancelRegistration={() => selectedEvent && cancelMutation.mutate({ eventId: selectedEvent.id })}
        isRegistering={registerMutation.isPending}
      />

      <CreateEventDialog open={showCreate} onClose={() => setShowCreate(false)} />
    </AppLayout>
  );
};

export default Events;
