/**
 * ProfessionalProfile — Public SEO-optimized page for registry entities.
 * Shows basic professional info with claim CTA for unclaimed profiles.
 */
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useProfileFlair } from "@/hooks/useProfileFlair";
import { useUserXP } from "@/hooks/useGamification";
import { resolveProfileFlair } from "@/lib/profile-flair";
import { PublicPageLayout } from "@/components/PublicPageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AvatarWithFallback } from "@/components/ui/avatar-with-fallback";
import { FlairAvatarWrapper, FlairName } from "@/components/gamification/ProfileFlair";
import { LevelBadge } from "@/components/gamification/LevelBadge";
import {
  Shield, MapPin, Building2, Hash, UserCheck, Users,
  ArrowRight, CheckCircle2, Clock, Eye, Briefcase
} from "lucide-react";

export default function ProfessionalProfile() {
  const { registrationNumber } = useParams<{ registrationNumber: string }>();

  const { data: entity, isLoading, error } = useQuery({
    queryKey: ["public-professional", registrationNumber],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("registry_entities")
        .select("*")
        .eq("registration_number", registrationNumber!)
        .eq("is_public", true)
        .eq("status", "active")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!registrationNumber,
  });

  // Fetch claimed profile data if matched
  const { data: profile } = useQuery({
    queryKey: ["public-professional-profile", entity?.matched_user_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, display_name, avatar_url, headline, organization, experience_years, verification_status, location")
        .eq("id", entity!.matched_user_id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!entity?.matched_user_id,
  });

  // Get connection count for claimed profiles
  const { data: connectionCount } = useQuery({
    queryKey: ["public-professional-connections", entity?.matched_user_id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("connections")
        .select("*", { count: "exact", head: true })
        .eq("status", "accepted")
        .or(`from_user_id.eq.${entity!.matched_user_id},to_user_id.eq.${entity!.matched_user_id}`);
      if (error) throw error;
      return count || 0;
    },
    enabled: !!entity?.matched_user_id,
  });

  const { data: flair } = useProfileFlair(entity?.matched_user_id || undefined);
  const { data: userXP } = useUserXP(entity?.matched_user_id || undefined);

  const isClaimed = !!entity?.matched_user_id;
  const displayName = profile?.display_name || profile?.full_name || entity?.entity_name || "";
  const sourceLabel = entity?.source?.toUpperCase() || "Registry";

  usePageMeta({
    title: entity ? `${displayName} — ${sourceLabel} Registered Professional` : "Professional Profile",
    description: entity
      ? `${displayName} is a ${entity.registration_category || "financial professional"} registered with ${sourceLabel}${entity.city ? ` in ${entity.city}` : ""}. View credentials on FindOO.`
      : "View professional credentials on FindOO.",
  });

  if (isLoading) {
    return (
      <PublicPageLayout>
        <div className="container max-w-2xl py-12">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-48 w-full" />
        </div>
      </PublicPageLayout>
    );
  }

  if (!entity || error) {
    return (
      <PublicPageLayout>
        <div className="container max-w-2xl py-16 text-center">
          <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold font-heading mb-2">Profile Not Found</h1>
          <p className="text-muted-foreground mb-6">
            This professional profile doesn't exist or is not publicly available.
          </p>
          <Button asChild>
            <Link to="/explore">Browse Professionals</Link>
          </Button>
        </div>
      </PublicPageLayout>
    );
  }

  return (
    <PublicPageLayout>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            name: displayName,
            jobTitle: entity.registration_category || "Financial Professional",
            ...(entity.city && {
              address: {
                "@type": "PostalAddress",
                addressLocality: entity.city,
                addressRegion: entity.state,
                addressCountry: "IN",
              },
            }),
            memberOf: {
              "@type": "Organization",
              name: sourceLabel,
            },
          }),
        }}
      />

      <div className="container max-w-2xl py-8 md:py-12">
        {/* Breadcrumb */}
        <nav className="text-xs text-muted-foreground mb-6 flex items-center gap-1.5">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <span>/</span>
          <Link to="/professionals" className="hover:text-foreground transition-colors">Professionals</Link>
          <span>/</span>
          <span className="text-foreground">{displayName}</span>
        </nav>

        {/* Main Card */}
        <Card className="overflow-hidden">
          {/* Animated banner like full profile */}
          <div className="h-28 sm:h-36 relative overflow-hidden">
            <div className="absolute inset-0" style={{
              background: `linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--gold)) 50%, hsl(var(--accent)) 100%)`,
              backgroundSize: "300% 300%",
              animation: "gradientShift 8s ease infinite",
              opacity: 0.25,
            }} />
            <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
            <div className="absolute inset-0 opacity-[0.04]" style={{
              backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, currentColor 10px, currentColor 10.5px),
                repeating-linear-gradient(-45deg, transparent, transparent 10px, currentColor 10px, currentColor 10.5px)`,
            }} />
            {/* Floating dots */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="absolute rounded-full opacity-20"
                  style={{
                    width: `${18 + i * 7}px`,
                    height: `${18 + i * 7}px`,
                    background: 'hsl(var(--primary))',
                    left: `${10 + i * 18}%`,
                    top: `${20 + (i % 3) * 25}%`,
                    animation: `float ${3 + i * 0.5}s ease-in-out infinite alternate`,
                    animationDelay: `${i * 0.3}s`,
                  }}
                />
              ))}
            </div>
          </div>

          <CardContent className="-mt-12 px-6 pb-8">
            {/* Avatar / Initials */}
            <div className="flex items-end gap-4 mb-6">
              <FlairAvatarWrapper avatarBorder={flair?.avatar_border || "none"} className="shrink-0 relative z-10">
                <AvatarWithFallback
                  src={profile?.avatar_url}
                  initials={displayName.charAt(0).toUpperCase()}
                  className="h-20 w-20 rounded-full overflow-hidden border-[3px] border-card shadow-lg"
                  textClassName="text-2xl"
                />
              </FlairAvatarWrapper>
              <div className="min-w-0 pb-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl md:text-2xl font-bold font-heading truncate">
                    <FlairName nameEffect={flair?.name_effect || "none"}>
                      {displayName}
                    </FlairName>
                  </h1>
                  {userXP && userXP.level > 0 && (
                    <LevelBadge level={userXP.level} size="sm" showLabel />
                  )}
                </div>
                {(profile?.headline || entity.registration_category) && (
                  <p className="text-sm text-muted-foreground truncate">
                    {profile?.headline || entity.registration_category}
                  </p>
                )}
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-6">
              <Badge className="gap-1.5 bg-primary/10 text-primary border-primary/20 hover:bg-primary/15">
                <Shield className="h-3 w-3" />
                {sourceLabel} Registered
              </Badge>
              {isClaimed && (
                <Badge variant="default" className="gap-1.5">
                  <CheckCircle2 className="h-3 w-3" />
                  Claimed & Verified
                </Badge>
              )}
              {!isClaimed && (
                <Badge variant="outline" className="gap-1.5 text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  Unclaimed
                </Badge>
              )}
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {entity.registration_number && (
                <div className="flex items-center gap-2.5 text-sm">
                  <Hash className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Registration</p>
                    <p className="font-mono text-xs">{entity.registration_number}</p>
                  </div>
                </div>
              )}
              {(entity.city || entity.state || profile?.location) && (
                <div className="flex items-center gap-2.5 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Location</p>
                    <p className="text-xs">{profile?.location || [entity.city, entity.state].filter(Boolean).join(", ")}</p>
                  </div>
                </div>
              )}
              {entity.entity_type && (
                <div className="flex items-center gap-2.5 text-sm">
                  <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Type</p>
                    <p className="text-xs capitalize">{entity.entity_type}</p>
                  </div>
                </div>
              )}
              {profile?.experience_years && (
                <div className="flex items-center gap-2.5 text-sm">
                  <Briefcase className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Experience</p>
                    <p className="text-xs">{profile.experience_years} years</p>
                  </div>
                </div>
              )}
              {profile?.organization && (
                <div className="flex items-center gap-2.5 text-sm">
                  <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Organization</p>
                    <p className="text-xs">{profile.organization}</p>
                  </div>
                </div>
              )}
              {isClaimed && connectionCount !== undefined && connectionCount > 0 && (
                <div className="flex items-center gap-2.5 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Connections</p>
                    <p className="text-xs">{connectionCount} professionals</p>
                  </div>
                </div>
              )}
            </div>

            {/* CTA Section */}
            <div className="border-t border-border pt-6">
              {isClaimed ? (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-3">
                    Sign up to view the full profile, connect, and message {displayName.split(" ")[0]}.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 justify-center">
                    <Button asChild size="lg">
                      <Link to="/auth" className="gap-2">
                        View Full Profile <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 bg-status-warning/10 text-status-warning px-4 py-2 rounded-lg mb-4">
                    <UserCheck className="h-4 w-4" />
                    <span className="text-sm font-medium">Is this you?</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Claim this profile to control what people see, connect with peers,
                    and showcase your expertise on India's trusted financial network.
                  </p>
                  <Button asChild size="lg">
                    <Link
                      to={`/auth?claim=${entity.id}&ref=${encodeURIComponent(entity.registration_number || "")}`}
                      className="gap-2"
                    >
                      Claim This Profile <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Trust footer */}
        <div className="mt-6 text-center text-xs text-muted-foreground space-y-1">
          <p>
            This information is sourced from {sourceLabel}'s public registry.
            FindOO does not verify the accuracy of third-party data.
          </p>
          <p>
            <Link to="/about" className="text-primary hover:underline">About FindOO</Link>
            {" · "}
            <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </PublicPageLayout>
  );
}
