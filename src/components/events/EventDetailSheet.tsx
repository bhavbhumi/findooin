/**
 * EventDetailSheet — Slide-over panel showing full event details.
 */
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Clock, MapPin, Monitor, Users, BadgeCheck, ExternalLink, User, Flag } from "lucide-react";
import { ReportDialog } from "@/components/feed/ReportDialog";
import { format, isPast, differenceInHours } from "date-fns";
import type { EventData } from "@/hooks/useEvents";
import { EVENT_CATEGORY_LABELS, EVENT_MODE_LABELS, useEventSpeakers } from "@/hooks/useEvents";

interface EventDetailSheetProps {
  event: EventData | null;
  open: boolean;
  onClose: () => void;
  onRegister?: () => void;
  onCancelRegistration?: () => void;
  isRegistering?: boolean;
}

export function EventDetailSheet({ event, open, onClose, onRegister, onCancelRegistration, isRegistering }: EventDetailSheetProps) {
  const { data: speakers } = useEventSpeakers(event?.id);
  const [showReport, setShowReport] = useState(false);

  if (!event) return null;

  const eventEnded = isPast(new Date(event.end_time));
  const isFull = event.capacity != null && event.registration_count >= event.capacity;
  const isVerified = event.organizer_profile?.verification_status === "verified";

  // Show virtual link only if registered and within 1 hour of start
  const hoursUntilStart = differenceInHours(new Date(event.start_time), new Date());
  const showVirtualLink = event.is_registered && event.virtual_link && hoursUntilStart <= 1 && !eventEnded;

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="text-left">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="secondary" className="text-[10px]">
              {EVENT_CATEGORY_LABELS[event.category] || event.category}
            </Badge>
            <Badge variant="outline" className="text-[10px]">
              {EVENT_MODE_LABELS[event.event_mode] || event.event_mode}
            </Badge>
            {event.is_free && (
              <Badge variant="outline" className="text-[10px] text-accent border-accent/30">Free</Badge>
            )}
          </div>
          <SheetTitle className="text-xl font-heading">{event.title}</SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-5">
          {/* Organizer */}
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={event.organizer_profile?.avatar_url || undefined} />
              <AvatarFallback>{(event.organizer_profile?.full_name || "O")[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium flex items-center gap-1">
                {event.organizer_profile?.display_name || event.organizer_profile?.full_name}
                {isVerified && <BadgeCheck className="h-3.5 w-3.5 text-primary" />}
              </p>
              <p className="text-xs text-muted-foreground">Organizer</p>
            </div>
          </div>

          <Separator />

          {/* Date & Time */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-primary" />
              <span>{format(new Date(event.start_time), "EEEE, MMMM d, yyyy")}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-primary" />
              <span>{format(new Date(event.start_time), "h:mm a")} – {format(new Date(event.end_time), "h:mm a")}</span>
            </div>
            {event.event_mode !== "virtual" && event.venue_name && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-primary" />
                <span>{event.venue_name}{event.venue_address ? `, ${event.venue_address}` : ""}</span>
              </div>
            )}
            {(event.event_mode === "virtual" || event.event_mode === "hybrid") && (
              <div className="flex items-center gap-2 text-sm">
                <Monitor className="h-4 w-4 text-primary" />
                {showVirtualLink ? (
                  <a
                    href={event.virtual_link!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Join Event <ExternalLink className="h-3 w-3" />
                  </a>
                ) : event.is_registered ? (
                  <span className="text-muted-foreground">Link available 1 hour before start</span>
                ) : (
                  <span className="text-muted-foreground">Register to get joining link</span>
                )}
              </div>
            )}
            {event.capacity && (
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-primary" />
                <span>{event.registration_count} / {event.capacity} registered</span>
              </div>
            )}
          </div>

          <Separator />

          {/* Description */}
          <div>
            <h4 className="text-sm font-semibold mb-2">About this event</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{event.description}</p>
          </div>

          {/* Speakers */}
          {speakers && speakers.length > 0 && (
            <>
              <Separator />
              <div>
                <h4 className="text-sm font-semibold mb-3">Speakers</h4>
                <div className="space-y-3">
                  {speakers.map((s) => (
                    <div key={s.id} className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={s.speaker_avatar_url || undefined} />
                        <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{s.speaker_name}</p>
                        {s.speaker_title && (
                          <p className="text-xs text-muted-foreground">{s.speaker_title}</p>
                        )}
                        {s.topic && (
                          <p className="text-xs text-primary/80 mt-0.5">{s.topic}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Tags */}
          {event.tags && event.tags.length > 0 && (
            <>
              <Separator />
              <div className="flex flex-wrap gap-1.5">
                {event.tags.map((t) => (
                  <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>
                ))}
              </div>
            </>
          )}

          {/* Action */}
          <div className="pt-2">
            {eventEnded ? (
              <Button disabled className="w-full">Event has ended</Button>
            ) : event.is_registered ? (
              <Button variant="outline" className="w-full" onClick={onCancelRegistration}>
                Cancel Registration
              </Button>
            ) : isFull ? (
              <Button disabled className="w-full">Event is full</Button>
            ) : (
              <Button className="w-full" onClick={onRegister} disabled={isRegistering}>
                {isRegistering ? "Registering..." : "Register for this Event"}
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
