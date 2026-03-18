import { useEffect, useState } from "react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FindooLoader } from "@/components/FindooLoader";
import { generateVCard, downloadVCard } from "@/lib/vcard";
import { toast } from "sonner";
import {
  MapPin, Globe, Download, ExternalLink, Award, Briefcase,
  CheckCircle, Building2, User, UserPlus, ShieldCheck, FileText,
  Loader2
} from "lucide-react";
import findooLogo from "@/assets/findoo-logo-white.png";

interface CardProfile {
  id: string;
  full_name: string;
  display_name: string | null;
  designation: string | null;
  organization: string | null;
  headline: string | null;
  location: string | null;
  website: string | null;
  avatar_url: string | null;
  verification_status: string;
  user_type: string;
  social_links: Record<string, string> | null;
  specializations: string[] | null;
  certifications: string[] | null;
  regulatory_ids: Record<string, string> | null;
  digital_card_fields: Record<string, boolean> | null;
}

const DEFAULT_FIELDS: Record<string, boolean> = {
  full_name: true, designation: true, organization: true, headline: true,
  location: true, website: true, social_links: true, certifications: true,
  specializations: true, email: false, phone: false,
};

const REGULATOR_LABELS: Record<string, string> = {
  sebi: "SEBI", rbi: "RBI", irdai: "IRDAI", amfi: "AMFI", pfrda: "PFRDA",
  nism: "NISM", bse: "BSE", nse: "NSE",
};

const DigitalCard = () => {
  const { userId } = useParams<{ userId: string }>();
  const [searchParams] = useSearchParams();
  const eventContext = searchParams.get("event");
  const [profile, setProfile] = useState<CardProfile | null>(null);
  const [roles, setRoles] = useState<{ role: string; sub_type: string | null }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [connectingStatus, setConnectingStatus] = useState<"idle" | "loading" | "sent" | "already">("idle");
  const [exchangeLogged, setExchangeLogged] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUserId(session?.user?.id ?? null);
    });
  }, []);

  useEffect(() => {
    if (!userId) return;
    Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).single(),
      supabase.from("user_roles").select("role, sub_type").eq("user_id", userId),
    ]).then(([profileRes, rolesRes]) => {
      if (profileRes.data) {
        const d = profileRes.data as any;
        setProfile({
          id: d.id, full_name: d.full_name, display_name: d.display_name,
          designation: d.designation, organization: d.organization,
          headline: d.headline, location: d.location, website: d.website,
          avatar_url: d.avatar_url, verification_status: d.verification_status,
          user_type: d.user_type, social_links: d.social_links,
          specializations: d.specializations, certifications: d.certifications,
          regulatory_ids: d.regulatory_ids,
          digital_card_fields: d.digital_card_fields,
        });
        setRoles(rolesRes.data || []);
      } else {
        setError(true);
      }
      setLoading(false);
    });
  }, [userId]);

  // Log card view exchange
  useEffect(() => {
    if (!profile || exchangeLogged) return;
    if (profile.id === currentUserId) return; // Don't log self-views
    setExchangeLogged(true);
    supabase.from("card_exchanges").insert({
      card_owner_id: profile.id,
      viewer_id: currentUserId,
      context: eventContext ? "event" : "direct",
      event_id: eventContext || null,
      action: "view",
    } as any).then(() => {});
  }, [profile, currentUserId, exchangeLogged, eventContext]);

  const fields = profile?.digital_card_fields ?? DEFAULT_FIELDS;
  const show = (field: string) => fields[field] !== false;

  // Smart Connect
  const handleConnect = async () => {
    if (!currentUserId || !profile) {
      // Redirect to auth with ref for referral attribution + return URL
      window.location.href = `/auth?mode=signup&ref=${profile?.id}&redirect=${encodeURIComponent(window.location.pathname)}`;
      return;
    }
    if (currentUserId === profile.id) return;

    setConnectingStatus("loading");

    // Check existing connection
    const { data: existing } = await supabase
      .from("connections")
      .select("id, status")
      .or(`and(from_user_id.eq.${currentUserId},to_user_id.eq.${profile.id}),and(from_user_id.eq.${profile.id},to_user_id.eq.${currentUserId})`)
      .eq("connection_type", "connect")
      .maybeSingle();

    if (existing) {
      setConnectingStatus("already");
      toast.info(existing.status === "accepted" ? "You're already connected!" : "Connection request already sent");
      return;
    }

    const { error } = await supabase.from("connections").insert({
      from_user_id: currentUserId,
      to_user_id: profile.id,
      connection_type: "connect",
      status: "pending",
    });

    if (error) {
      toast.error("Failed to send connection request");
      setConnectingStatus("idle");
    } else {
      setConnectingStatus("sent");
      toast.success("Connection request sent!");
      // Log exchange as connect action
      await supabase.from("card_exchanges").insert({
        card_owner_id: profile.id,
        viewer_id: currentUserId,
        context: eventContext ? "event" : "direct",
        event_id: eventContext || null,
        action: "connect",
      } as any);
    }
  };

  const handleDownloadVCard = async () => {
    if (!profile) return;
    const profileUrl = `${window.location.origin}/card/${profile.id}`;
    const vcard = generateVCard({
      fullName: profile.display_name || profile.full_name,
      displayName: profile.display_name,
      designation: show("designation") ? profile.designation : null,
      organization: show("organization") ? profile.organization : null,
      headline: show("headline") ? profile.headline : null,
      location: show("location") ? profile.location : null,
      website: show("website") ? profile.website : null,
      socialLinks: show("social_links") ? profile.social_links : null,
      profileUrl,
    });
    downloadVCard(vcard, (profile.display_name || profile.full_name).replace(/\s+/g, "_"));
    // Log save action
    if (profile.id !== currentUserId) {
      await supabase.from("card_exchanges").insert({
        card_owner_id: profile.id,
        viewer_id: currentUserId,
        context: eventContext ? "event" : "direct",
        event_id: eventContext || null,
        action: "save_contact",
      } as any);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[hsl(224,55%,12%)] to-[hsl(240,100%,15%)]">
        <FindooLoader text="Loading card..." />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[hsl(224,55%,12%)] to-[hsl(240,100%,15%)]">
        <Card className="max-w-sm mx-auto text-center">
          <CardContent className="p-8">
            <p className="text-muted-foreground">This digital card doesn't exist.</p>
            <Link to="/">
              <Button className="mt-4" size="sm">Go to FindOO</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const displayName = profile.display_name || profile.full_name;
  const initials = displayName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  const isVerified = profile.verification_status === "verified";
  const roleLabels = roles.map(r => r.role.replace(/_/g, " ")).map(r => r.charAt(0).toUpperCase() + r.slice(1));
  const isOwnCard = currentUserId === profile.id;
  const hasRegulatoryIds = profile.regulatory_ids && Object.values(profile.regulatory_ids).some(v => v);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(224,55%,12%)] via-[hsl(240,100%,15%)] to-[hsl(224,55%,12%)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* FindOO branding */}
        <div className="text-center mb-6">
          <img src={findooLogo} alt="FindOO" className="h-8 mx-auto opacity-80" />
        </div>

        {/* Card */}
        <Card className="overflow-hidden border-0 shadow-2xl bg-card/95 backdrop-blur-sm">
          {/* Gold accent bar */}
          <div className="h-1.5 bg-gradient-to-r from-[hsl(var(--gold))] via-[hsl(46,80%,60%)] to-[hsl(var(--gold))]" />

          <CardContent className="p-6 space-y-5">
            {/* Avatar + Name */}
            <div className="flex items-start gap-4">
              <Avatar className="h-20 w-20 border-2 border-[hsl(var(--gold))] shadow-lg">
                <AvatarImage src={profile.avatar_url || undefined} alt={displayName} />
                <AvatarFallback className="bg-accent text-accent-foreground text-xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-xl font-bold font-heading text-foreground truncate">{displayName}</h1>
                  {isVerified && <CheckCircle className="h-5 w-5 text-[hsl(var(--gold))] shrink-0" />}
                </div>
                {show("designation") && profile.designation && (
                  <p className="text-sm text-muted-foreground mt-0.5">{profile.designation}</p>
                )}
                {show("organization") && profile.organization && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
                    <Building2 className="h-3.5 w-3.5" />
                    <span>{profile.organization}</span>
                  </div>
                )}
              </div>
            </div>

            {/* ── Verification Proof Section ── */}
            {isVerified && (
              <div className="rounded-lg border border-[hsl(var(--gold)/0.3)] bg-[hsl(var(--gold)/0.05)] p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4.5 w-4.5 text-[hsl(var(--gold))]" />
                  <span className="text-sm font-semibold font-heading text-foreground">Verified Professional</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Identity and credentials verified by FindOO's compliance team.
                </p>
                {hasRegulatoryIds && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {Object.entries(profile.regulatory_ids!).map(([key, val]) =>
                      val ? (
                        <Badge key={key} variant="outline" className="text-[10px] border-[hsl(var(--gold)/0.4)] bg-[hsl(var(--gold)/0.08)]">
                          <FileText className="h-3 w-3 mr-1" />
                          {REGULATOR_LABELS[key] || key.toUpperCase()}: {String(val).slice(0, 4)}••••
                        </Badge>
                      ) : null
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Roles */}
            {roleLabels.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {roleLabels.map(role => (
                  <Badge key={role} variant="secondary" className="text-xs">
                    {role}
                  </Badge>
                ))}
                <Badge variant="secondary" className="text-xs">
                  <User className="h-3 w-3 mr-1" />
                  {profile.user_type === "entity" ? "Entity" : "Individual"}
                </Badge>
              </div>
            )}

            {/* Headline */}
            {show("headline") && profile.headline && (
              <p className="text-sm text-muted-foreground leading-relaxed">{profile.headline}</p>
            )}

            {/* Details */}
            <div className="space-y-2">
              {show("location") && profile.location && (
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>{profile.location}</span>
                </div>
              )}
              {show("website") && profile.website && (
                <a href={profile.website} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-accent hover:underline">
                  <Globe className="h-4 w-4 shrink-0" />
                  <span className="truncate">{profile.website.replace(/^https?:\/\//, "")}</span>
                </a>
              )}
            </div>

            {/* Specializations */}
            {show("specializations") && profile.specializations && profile.specializations.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Briefcase className="h-3.5 w-3.5" /> Specializations
                </p>
                <div className="flex flex-wrap gap-1">
                  {profile.specializations.map(s => (
                    <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications */}
            {show("certifications") && profile.certifications && profile.certifications.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Award className="h-3.5 w-3.5" /> Certifications
                </p>
                <div className="flex flex-wrap gap-1">
                  {profile.certifications.map(c => (
                    <Badge key={c} variant="outline" className="text-xs">{c}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Social Links */}
            {show("social_links") && profile.social_links && Object.keys(profile.social_links).length > 0 && (
              <div className="flex flex-wrap gap-2">
                {Object.entries(profile.social_links).map(([key, url]) =>
                  url ? (
                    <a key={key} href={url as string} target="_blank" rel="noopener noreferrer"
                      className="text-xs bg-secondary text-secondary-foreground px-2.5 py-1 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors capitalize">
                      {key}
                    </a>
                  ) : null
                )}
              </div>
            )}

            {/* Action buttons */}
            <div className="space-y-2 pt-2">
              {/* Smart Connect — only show for non-self */}
              {!isOwnCard && (
                <Button
                  onClick={handleConnect}
                  className="w-full"
                  size="sm"
                  variant={connectingStatus === "sent" || connectingStatus === "already" ? "outline" : "default"}
                  disabled={connectingStatus === "loading" || connectingStatus === "sent" || connectingStatus === "already"}
                >
                  {connectingStatus === "loading" ? (
                    <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> Connecting...</>
                  ) : connectingStatus === "sent" ? (
                    <><CheckCircle className="h-4 w-4 mr-1.5" /> Request Sent</>
                  ) : connectingStatus === "already" ? (
                    <><CheckCircle className="h-4 w-4 mr-1.5" /> Already Connected</>
                  ) : (
                    <><UserPlus className="h-4 w-4 mr-1.5" /> Connect on FindOO</>
                  )}
                </Button>
              )}

              <div className="flex gap-2">
                <Button onClick={handleDownloadVCard} variant="outline" className="flex-1" size="sm">
                  <Download className="h-4 w-4 mr-1.5" /> Save Contact
                </Button>
                <Link to={`/profile/${profile.id}`} className="flex-1">
                  <Button variant="outline" className="w-full" size="sm">
                    <ExternalLink className="h-4 w-4 mr-1.5" /> View Profile
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Event context banner */}
        {eventContext && (
          <div className="text-center mt-4 text-xs text-white/50">
            📍 Card shared at event
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-white/40 mt-4">
          Paperless professional identity • Powered by FindOO
        </p>
      </div>
    </div>
  );
};

export default DigitalCard;
