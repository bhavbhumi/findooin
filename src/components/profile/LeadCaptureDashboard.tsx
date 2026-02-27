import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FindooLoader } from "@/components/FindooLoader";
import {
  Users, Eye, Download, UserPlus, TrendingUp, Calendar,
  ExternalLink
} from "lucide-react";
import { format, subDays, isAfter } from "date-fns";
import { Link } from "react-router-dom";

interface CardExchange {
  id: string;
  viewer_id: string | null;
  viewer_name: string | null;
  context: string;
  event_id: string | null;
  action: string;
  created_at: string;
  viewer_profile?: {
    full_name: string;
    display_name: string | null;
    avatar_url: string | null;
    designation: string | null;
    organization: string | null;
  } | null;
}

interface LeadCaptureDashboardProps {
  profileId: string;
}

const ACTION_LABELS: Record<string, { label: string; icon: typeof Eye; color: string }> = {
  view: { label: "Viewed", icon: Eye, color: "text-muted-foreground" },
  save_contact: { label: "Saved Contact", icon: Download, color: "text-[hsl(var(--gold))]" },
  connect: { label: "Connected", icon: UserPlus, color: "text-emerald-500" },
};

export function LeadCaptureDashboard({ profileId }: LeadCaptureDashboardProps) {
  const [exchanges, setExchanges] = useState<CardExchange[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "all">("30d");

  useEffect(() => {
    loadExchanges();
  }, [profileId]);

  const loadExchanges = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("card_exchanges")
      .select("*")
      .eq("card_owner_id", profileId)
      .order("created_at", { ascending: false })
      .limit(200);

    if (data) {
      // Fetch viewer profiles for authenticated viewers
      const viewerIds = [...new Set((data as any[]).filter(d => d.viewer_id).map(d => d.viewer_id))];
      let profileMap: Record<string, any> = {};

      if (viewerIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, display_name, avatar_url, designation, organization")
          .in("id", viewerIds);
        if (profiles) {
          profileMap = Object.fromEntries(profiles.map(p => [p.id, p]));
        }
      }

      setExchanges((data as any[]).map(ex => ({
        ...ex,
        viewer_profile: ex.viewer_id ? profileMap[ex.viewer_id] || null : null,
      })));
    }
    setLoading(false);
  };

  const filteredExchanges = exchanges.filter(ex => {
    if (timeRange === "all") return true;
    const days = timeRange === "7d" ? 7 : 30;
    return isAfter(new Date(ex.created_at), subDays(new Date(), days));
  });

  const stats = {
    totalViews: filteredExchanges.filter(e => e.action === "view").length,
    totalSaves: filteredExchanges.filter(e => e.action === "save_contact").length,
    totalConnects: filteredExchanges.filter(e => e.action === "connect").length,
    eventLeads: filteredExchanges.filter(e => e.context === "event").length,
    uniqueViewers: new Set(filteredExchanges.filter(e => e.viewer_id).map(e => e.viewer_id)).size,
  };

  if (loading) return <FindooLoader size="sm" text="Loading leads..." />;

  return (
    <div className="space-y-5">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Card Views", value: stats.totalViews, icon: Eye, color: "text-muted-foreground" },
          { label: "Contact Saves", value: stats.totalSaves, icon: Download, color: "text-[hsl(var(--gold))]" },
          { label: "Connections", value: stats.totalConnects, icon: UserPlus, color: "text-emerald-500" },
          { label: "Event Leads", value: stats.eventLeads, icon: Calendar, color: "text-accent" },
          { label: "Unique Viewers", value: stats.uniqueViewers, icon: Users, color: "text-accent" },
        ].map(stat => (
          <Card key={stat.label} className="border-border">
            <CardContent className="p-3 text-center">
              <stat.icon className={`h-4 w-4 mx-auto mb-1 ${stat.color}`} />
              <p className="text-xl font-bold font-heading">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Time range filter */}
      <div className="flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">Period:</span>
        {(["7d", "30d", "all"] as const).map(range => (
          <Button
            key={range}
            variant={timeRange === range ? "default" : "outline"}
            size="sm"
            className="h-7 text-xs"
            onClick={() => setTimeRange(range)}
          >
            {range === "7d" ? "7 Days" : range === "30d" ? "30 Days" : "All Time"}
          </Button>
        ))}
      </div>

      {/* Exchange List */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Recent Card Interactions</CardTitle>
          <CardDescription>{filteredExchanges.length} interactions in selected period</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredExchanges.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2" />
              <p className="text-sm text-muted-foreground">No card interactions yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Share your digital card to start capturing leads
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {filteredExchanges.map(ex => {
                const actionInfo = ACTION_LABELS[ex.action] || ACTION_LABELS.view;
                const ActionIcon = actionInfo.icon;
                const vp = ex.viewer_profile;
                const viewerName = vp?.display_name || vp?.full_name || ex.viewer_name || "Anonymous";
                const initials = viewerName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

                return (
                  <div key={ex.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={vp?.avatar_url || undefined} />
                      <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-medium truncate">{viewerName}</p>
                        {ex.viewer_id && (
                          <Link to={`/profile/${ex.viewer_id}`}>
                            <ExternalLink className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                          </Link>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        {vp?.designation && <span>{vp.designation}</span>}
                        {vp?.designation && vp?.organization && <span>•</span>}
                        {vp?.organization && <span>{vp.organization}</span>}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1">
                        <ActionIcon className={`h-3.5 w-3.5 ${actionInfo.color}`} />
                        <span className="text-xs font-medium">{actionInfo.label}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        {format(new Date(ex.created_at), "MMM d, h:mm a")}
                      </p>
                      {ex.context === "event" && (
                        <Badge variant="outline" className="text-[9px] mt-0.5">Event</Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
