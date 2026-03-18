import { useEffect, useState } from "react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FindooLoader } from "@/components/FindooLoader";
import { toast } from "sonner";
import { CheckCircle, CalendarDays, MapPin, LogIn, AlertCircle } from "lucide-react";
import findooLogo from "@/assets/findoo-logo-white.png";
import { format } from "date-fns";

const EventCheckin = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<any>(null);
  const [status, setStatus] = useState<"checking" | "success" | "already" | "not_registered" | "no_auth" | "error">("checking");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) return;
    init();
  }, [eventId]);

  const init = async () => {
    // Load event
    const { data: eventData } = await supabase
      .from("events")
      .select("id, title, start_time, end_time, venue_name, event_mode")
      .eq("id", eventId!)
      .single();

    if (!eventData) {
      setLoading(false);
      setStatus("error");
      return;
    }
    setEvent(eventData);

    // Check auth
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setLoading(false);
      setStatus("no_auth");
      return;
    }
    setUserId(session.user.id);

    // Check registration
    const { data: reg } = await supabase
      .from("event_registrations")
      .select("id, status")
      .eq("event_id", eventId!)
      .eq("user_id", session.user.id)
      .maybeSingle();

    if (!reg) {
      // Auto-register + mark attended
      const { error: regError } = await supabase
        .from("event_registrations")
        .insert({
          event_id: eventId!,
          user_id: session.user.id,
          status: "attended",
        });

      if (regError) {
        setStatus("error");
      } else {
        setStatus("success");
        toast.success("Checked in successfully!");
      }
    } else if (reg.status === "attended") {
      setStatus("already");
    } else {
      // Update to attended
      await supabase
        .from("event_registrations")
        .update({ status: "attended" } as any)
        .eq("id", reg.id);
      setStatus("success");
      toast.success("Checked in successfully!");
    }

    // Log card exchange for lead capture context
    await supabase.from("card_exchanges").insert({
      card_owner_id: session.user.id,
      viewer_id: session.user.id,
      context: "event_checkin",
      event_id: eventId,
      action: "checkin",
    } as any);

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[hsl(224,55%,12%)] to-[hsl(240,100%,15%)]">
        <FindooLoader text="Checking in..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(224,55%,12%)] via-[hsl(240,100%,15%)] to-[hsl(224,55%,12%)] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <img src={findooLogo} alt="FindOO" className="h-8 mx-auto opacity-80" />
        </div>

        <Card className="overflow-hidden border-0 shadow-2xl bg-card/95 backdrop-blur-sm">
          <div className="h-1.5 bg-gradient-to-r from-[hsl(var(--gold))] via-[hsl(46,80%,60%)] to-[hsl(var(--gold))]" />
          <CardContent className="p-6 text-center space-y-4">
            {event && (
              <div className="space-y-1">
                <h2 className="text-lg font-bold font-heading text-foreground">{event.title}</h2>
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <CalendarDays className="h-3.5 w-3.5" />
                  <span>{format(new Date(event.start_time), "MMM d, yyyy · h:mm a")}</span>
                </div>
                {event.venue_name && (
                  <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{event.venue_name}</span>
                  </div>
                )}
              </div>
            )}

            {status === "success" && (
              <div className="space-y-2">
                <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto" />
                <p className="text-lg font-semibold font-heading text-foreground">Checked In!</p>
                <p className="text-sm text-muted-foreground">Your attendance has been recorded.</p>
              </div>
            )}

            {status === "already" && (
              <div className="space-y-2">
                <CheckCircle className="h-16 w-16 text-[hsl(var(--gold))] mx-auto" />
                <p className="text-lg font-semibold font-heading text-foreground">Already Checked In</p>
                <p className="text-sm text-muted-foreground">You've already checked in to this event.</p>
              </div>
            )}

            {status === "no_auth" && (
              <div className="space-y-3">
                <LogIn className="h-12 w-12 text-muted-foreground mx-auto" />
                <p className="text-sm text-muted-foreground">Sign in to check in to this event.</p>
                <Link to={`/auth?redirect=${encodeURIComponent(`/event-checkin/${eventId}`)}`}>
                  <Button size="sm" className="w-full">Sign In to Check In</Button>
                </Link>
              </div>
            )}

            {status === "error" && (
              <div className="space-y-2">
                <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
                <p className="text-sm text-muted-foreground">Something went wrong. Please try again.</p>
              </div>
            )}

            <Link to="/events">
              <Button variant="outline" size="sm" className="w-full mt-2">
                Browse Events
              </Button>
            </Link>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-white/40 mt-6">
          NFC Event Check-in • Powered by FindOO
        </p>
      </div>
    </div>
  );
};

export default EventCheckin;
