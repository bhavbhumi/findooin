import { useState, useMemo, memo } from "react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, CalendarDays, LayoutDashboard } from "lucide-react";
import { useEvents, useRegisterForEvent, useCancelRegistration, EVENT_CATEGORY_LABELS } from "@/hooks/useEvents";
import { useRole } from "@/contexts/RoleContext";
import { EventCard } from "@/components/events/EventCard";
import { EventCardSkeleton } from "@/components/skeletons/EventCardSkeleton";
import { EventDetailSheet } from "@/components/events/EventDetailSheet";
import { CreateEventDialog } from "@/components/events/CreateEventDialog";
import { OrganizerDashboard } from "@/components/events/OrganizerDashboard";
import { EventsSidebar } from "@/components/events/EventsSidebar";
import AppLayout from "@/components/AppLayout";
import { EmptyState } from "@/components/ui/empty-state";
import type { EventData } from "@/hooks/useEvents";
import { isSameDay } from "date-fns";

const MemoizedEventsSidebar = memo(EventsSidebar);

const Events = () => {
  usePageMeta({ title: "Events", description: "Discover and host investor meets, webinars, AGMs, and industry events." });
  const { activeRole } = useRole();
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

  const registerMutation = useRegisterForEvent();
  const cancelMutation = useCancelRegistration();

  const canCreateEvents = activeRole === "issuer" || activeRole === "intermediary" || activeRole === "admin";

  const filteredEvents = useMemo(() => {
    if (!events) return [];
    if (!selectedDate) return events;
    return events.filter((e) => isSameDay(new Date(e.start_time), selectedDate));
  }, [events, selectedDate]);

  const eventDates = useMemo(() => {
    return events?.map((e) => new Date(e.start_time)) || [];
  }, [events]);

  const handleCategoryClick = (cat: string) => setCategory(cat);

  return (
    <AppLayout maxWidth="max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        {/* Main Column */}
        <div className="min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-heading font-bold text-foreground">Events</h1>
              <p className="text-sm text-muted-foreground">Webinars, investor meets & industry events</p>
            </div>
            {canCreateEvents && (
              <Button onClick={() => setShowCreate(true)} className="gap-1.5">
                <Plus className="h-4 w-4" />
                Create Event
              </Button>
            )}
          </div>

          <Tabs defaultValue="browse" className="space-y-4">
            <TabsList className="bg-muted/50">
              <TabsTrigger value="browse" className="gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" />
                Browse Events
              </TabsTrigger>
              {canCreateEvents && (
                <TabsTrigger value="dashboard" className="gap-1.5">
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  Organizer Dashboard
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="browse" className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search events..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-[180px]"><SelectValue placeholder="Category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {Object.entries(EVENT_CATEGORY_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={mode} onValueChange={setMode}>
                  <SelectTrigger className="w-[130px]"><SelectValue placeholder="Mode" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Modes</SelectItem>
                    <SelectItem value="virtual">Virtual</SelectItem>
                    <SelectItem value="physical">In-Person</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
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

            {canCreateEvents && (
              <TabsContent value="dashboard">
                <OrganizerDashboard />
              </TabsContent>
            )}
          </Tabs>
        </div>

        {/* Sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-20">
            <MemoizedEventsSidebar
              onCategoryClick={handleCategoryClick}
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              eventDates={eventDates}
            />
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
