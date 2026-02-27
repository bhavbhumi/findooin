import { useState } from "react";
import { useMyEvents, useEventRegistrations, useUpdateEvent, EVENT_CATEGORY_LABELS, EVENT_MODE_LABELS } from "@/hooks/useEvents";
import type { EventData } from "@/hooks/useEvents";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { CalendarDays, Users, Eye, MoreHorizontal, Play, Pause, XCircle, CheckCircle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { format, isPast } from "date-fns";

export function OrganizerDashboard() {
  const { data: myEvents, isLoading } = useMyEvents();
  const updateEvent = useUpdateEvent();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => <div key={i} className="h-24 rounded-lg bg-muted/30 animate-pulse" />)}
      </div>
    );
  }

  if (!myEvents?.length) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-30" />
        <p className="font-heading font-semibold">No events created yet</p>
        <p className="text-sm mt-1">Create your first event to get started</p>
      </div>
    );
  }

  const STATUS_COLORS: Record<string, string> = {
    draft: "bg-muted text-muted-foreground",
    published: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    cancelled: "bg-destructive/10 text-destructive",
    completed: "bg-primary/10 text-primary",
  };

  return (
    <div className="space-y-3">
      {myEvents.map((event) => (
        <Card key={event.id} className="border-border">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-heading font-semibold text-foreground truncate">{event.title}</h3>
                  <Badge className={`text-[10px] ${STATUS_COLORS[event.status] || ""}`}>
                    {event.status}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span>{format(new Date(event.start_time), "MMM d, yyyy · h:mm a")}</span>
                  <span>·</span>
                  <span>{EVENT_CATEGORY_LABELS[event.category]}</span>
                  <span>·</span>
                  <span>{EVENT_MODE_LABELS[event.event_mode]}</span>
                </div>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {event.registration_count} registered
                    {event.capacity && ` / ${event.capacity}`}
                  </span>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {event.status === "draft" && (
                    <DropdownMenuItem onClick={() => updateEvent.mutate({ id: event.id, status: "published" } as any)}>
                      <Play className="h-3.5 w-3.5 mr-2" /> Publish
                    </DropdownMenuItem>
                  )}
                  {event.status === "published" && !isPast(new Date(event.end_time)) && (
                    <DropdownMenuItem onClick={() => updateEvent.mutate({ id: event.id, status: "cancelled" } as any)}>
                      <XCircle className="h-3.5 w-3.5 mr-2" /> Cancel Event
                    </DropdownMenuItem>
                  )}
                  {event.status === "published" && isPast(new Date(event.end_time)) && (
                    <DropdownMenuItem onClick={() => updateEvent.mutate({ id: event.id, status: "completed" } as any)}>
                      <CheckCircle className="h-3.5 w-3.5 mr-2" /> Mark Completed
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => setExpandedId(expandedId === event.id ? null : event.id)}>
                    <Users className="h-3.5 w-3.5 mr-2" /> View Registrations
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Expandable registrations */}
            {expandedId === event.id && <RegistrationList eventId={event.id} />}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function RegistrationList({ eventId }: { eventId: string }) {
  const { data: registrations, isLoading } = useEventRegistrations(eventId);

  if (isLoading) return <div className="mt-3 h-16 bg-muted/20 animate-pulse rounded" />;
  if (!registrations?.length) return <p className="mt-3 text-xs text-muted-foreground">No registrations yet</p>;

  return (
    <div className="mt-3 pt-3 border-t border-border space-y-2">
      <p className="text-xs font-medium text-muted-foreground">{registrations.length} Registered</p>
      {registrations.map((reg) => (
        <div key={reg.id} className="flex items-center gap-2.5">
          <Avatar className="h-7 w-7">
            <AvatarImage src={reg.user_profile?.avatar_url || ""} />
            <AvatarFallback className="text-[10px]">
              {(reg.user_profile?.full_name || "U")[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">
              {reg.user_profile?.display_name || reg.user_profile?.full_name || "User"}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {format(new Date(reg.registered_at), "MMM d, h:mm a")}
            </p>
          </div>
          <Badge variant="outline" className="text-[9px]">{reg.status}</Badge>
        </div>
      ))}
    </div>
  );
}
