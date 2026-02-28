import { memo } from "react";
import { Calendar, Clock, MapPin, Monitor, Users, BadgeCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format, isPast, isToday, isTomorrow } from "date-fns";
import type { EventData } from "@/hooks/useEvents";
import { EVENT_CATEGORY_LABELS, EVENT_MODE_LABELS } from "@/hooks/useEvents";

interface EventCardProps {
  event: EventData;
  onClick?: () => void;
  onRegister?: () => void;
  onCancelRegistration?: () => void;
  isRegistering?: boolean;
}

const MODE_ICONS: Record<string, React.ReactNode> = {
  virtual: <Monitor className="h-3 w-3" />,
  physical: <MapPin className="h-3 w-3" />,
  hybrid: <><Monitor className="h-3 w-3" /><MapPin className="h-3 w-3" /></>,
};

function getDateLabel(dateStr: string) {
  const d = new Date(dateStr);
  if (isToday(d)) return "Today";
  if (isTomorrow(d)) return "Tomorrow";
  return format(d, "MMM d, yyyy");
}

export const EventCard = memo(function EventCard({ event, onClick, onRegister, onCancelRegistration, isRegistering }: EventCardProps) {
  const isVerified = event.organizer_profile?.verification_status === "verified";
  const eventEnded = isPast(new Date(event.end_time));
  const isFull = event.capacity != null && event.registration_count >= event.capacity;

  return (
    <Card
      className="group cursor-pointer hover:shadow-md transition-all border-border hover:border-primary/20"
      onClick={onClick}
    >
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start gap-4">
          {/* Date column */}
          <div className="shrink-0 w-14 text-center rounded-lg bg-primary/5 py-2 px-1">
            <p className="text-[10px] uppercase font-semibold text-primary tracking-wide">
              {format(new Date(event.start_time), "MMM")}
            </p>
            <p className="text-xl font-bold text-foreground leading-none mt-0.5">
              {format(new Date(event.start_time), "d")}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {format(new Date(event.start_time), "EEE")}
            </p>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-heading font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                  {event.title}
                </h3>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
                  <span className="font-medium text-foreground/80 truncate">
                    {event.organizer_profile?.display_name || event.organizer_profile?.full_name || "Organizer"}
                  </span>
                  {isVerified && <BadgeCheck className="h-3.5 w-3.5 text-primary shrink-0" />}
                </div>
              </div>

              {/* Register CTA */}
              <div className="shrink-0">
                {eventEnded ? (
                  <Badge variant="secondary" className="text-[10px]">Ended</Badge>
                ) : event.is_registered ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-7"
                    onClick={(e) => { e.stopPropagation(); onCancelRegistration?.(); }}
                  >
                    Registered ✓
                  </Button>
                ) : isFull ? (
                  <Badge variant="secondary" className="text-[10px]">Full</Badge>
                ) : (
                  <Button
                    size="sm"
                    className="text-xs h-7"
                    disabled={isRegistering}
                    onClick={(e) => { e.stopPropagation(); onRegister?.(); }}
                  >
                    Register
                  </Button>
                )}
              </div>
            </div>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-2">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {format(new Date(event.start_time), "h:mm a")} – {format(new Date(event.end_time), "h:mm a")}
              </span>
              <span className="flex items-center gap-1">
                {MODE_ICONS[event.event_mode]}
                {EVENT_MODE_LABELS[event.event_mode] || event.event_mode}
              </span>
              {event.event_mode !== "virtual" && event.venue_name && (
                <span className="flex items-center gap-1 truncate">
                  <MapPin className="h-3 w-3" />
                  {event.venue_name}
                </span>
              )}
              {event.capacity && (
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {event.registration_count}/{event.capacity}
                </span>
              )}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              <Badge variant="secondary" className="text-[10px]">
                {EVENT_CATEGORY_LABELS[event.category] || event.category}
              </Badge>
              {event.is_free && (
              <Badge variant="outline" className="text-[10px] text-accent border-accent/30">
                  Free
                </Badge>
              )}
              {event.tags?.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="outline" className="text-[10px]">{tag}</Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
