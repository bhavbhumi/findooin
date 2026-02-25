import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle2, ArrowLeft, UserPlus, UserCheck, Users, BarChart3, Building2, Clock,
  Calendar, Edit3, MapPin, Briefcase, MessageSquare,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { useFeedPosts } from "@/hooks/useFeedPosts";
import { PostCard } from "@/components/feed/PostCard";
import { useConnectionActions } from "@/hooks/useConnectionActions";
import AppNavbar from "@/components/AppNavbar";

interface ProfileData {
  id: string;
  full_name: string;
  display_name: string | null;
  user_type: string;
  bio: string | null;
  avatar_url: string | null;
  verification_status: string;
  created_at: string;
}

interface RoleData {
  role: string;
  sub_type: string | null;
}

interface ProfileStats {
  followers: number;
  following: number;
  connections: number;
  posts: number;
}

const roleIcon: Record<string, typeof BarChart3> = {
  investor: BarChart3,
  intermediary: UserCheck,
  issuer: Building2,
};

const roleColor: Record<string, string> = {
  investor: "bg-investor/10 text-investor border-investor/20",
  intermediary: "bg-intermediary/10 text-intermediary border-intermediary/20",
  issuer: "bg-issuer/10 text-issuer border-issuer/20",
};

const roleBannerGradient: Record<string, string> = {
  investor: "from-investor/20 via-investor/10 to-transparent",
  intermediary: "from-intermediary/20 via-intermediary/10 to-transparent",
  issuer: "from-issuer/20 via-issuer/10 to-transparent",
};

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

const Profile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [roles, setRoles] = useState<RoleData[]>([]);
  const [stats, setStats] = useState<ProfileStats>({ followers: 0, following: 0, connections: 0, posts: 0 });
  const [loading, setLoading] = useState(true);
  const { data: allPosts } = useFeedPosts();
  const { connectionStatus, follow, connect, loading: connLoading } = useConnectionActions(currentUserId, profile?.id ?? null);

  const isOwnProfile = !id || id === currentUserId;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { navigate("/auth"); return; }
      setCurrentUserId(session.user.id);
      const targetId = id || session.user.id;
      loadProfile(targetId);
    });
  }, [id, navigate]);

  const loadProfile = async (targetId: string) => {
    setLoading(true);
    const [profileRes, rolesRes, followersRes, followingRes, connectionsRes, postsRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", targetId).single(),
      supabase.from("user_roles").select("role, sub_type").eq("user_id", targetId),
      supabase.from("connections").select("id", { count: "exact", head: true }).eq("to_user_id", targetId).eq("connection_type", "follow"),
      supabase.from("connections").select("id", { count: "exact", head: true }).eq("from_user_id", targetId).eq("connection_type", "follow"),
      supabase.from("connections").select("id", { count: "exact", head: true }).or(`from_user_id.eq.${targetId},to_user_id.eq.${targetId}`).eq("connection_type", "connect").eq("status", "accepted"),
      supabase.from("posts").select("id", { count: "exact", head: true }).eq("author_id", targetId),
    ]);
    if (profileRes.data) setProfile(profileRes.data as ProfileData);
    if (rolesRes.data) setRoles(rolesRes.data);
    setStats({
      followers: followersRes.count ?? 0,
      following: followingRes.count ?? 0,
      connections: connectionsRes.count ?? 0,
      posts: postsRes.count ?? 0,
    });
    setLoading(false);
  };

  const userPosts = allPosts?.filter((p) => p.author.id === profile?.id) ?? [];
  const primaryRole = roles[0]?.role;
  const bannerGradient = primaryRole ? roleBannerGradient[primaryRole] : "from-primary/15 via-primary/8 to-transparent";

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <AppNavbar />

      {/* Back button for other profiles */}
      {!isOwnProfile && !loading && (
        <div className="container max-w-3xl mx-auto pt-3">
          <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back
          </Button>
        </div>
      )}

      {loading ? (
        <div className="container max-w-3xl mx-auto pt-4">
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <Skeleton className="h-36 w-full" />
            <div className="px-6 pb-6">
              <div className="-mt-10 flex items-end gap-4 mb-4">
                <Skeleton className="h-20 w-20 rounded-full border-4 border-card" />
                <div className="space-y-2 pb-1">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <Skeleton className="h-12 w-full mb-3" />
              <Skeleton className="h-8 w-64" />
            </div>
          </div>
        </div>
      ) : profile ? (
        <div className="container max-w-3xl mx-auto pt-4">
          {/* Profile Header Card */}
          <div className="rounded-xl border border-border bg-card overflow-hidden mb-4">
            {/* Banner */}
            <div className={`h-32 sm:h-36 bg-gradient-to-br ${bannerGradient} relative`}>
              <div className="absolute inset-0 bg-gradient-to-t from-card/60 to-transparent" />
              {/* Subtle pattern overlay */}
              <div className="absolute inset-0 opacity-[0.03]" style={{
                backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
                backgroundSize: "24px 24px",
              }} />
            </div>

            {/* Avatar + Name Section */}
            <div className="px-5 sm:px-6">
              <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4 -mt-12 sm:-mt-14">
                {/* Avatar */}
                <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-muted flex items-center justify-center text-xl sm:text-2xl font-bold text-muted-foreground shrink-0 overflow-hidden border-4 border-card shadow-lg">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile.full_name} className="h-full w-full object-cover" />
                  ) : (
                    getInitials(profile.full_name)
                  )}
                </div>

                {/* Name + Actions row */}
                <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-xl sm:text-2xl font-bold font-heading text-card-foreground leading-tight">
                        {profile.display_name || profile.full_name}
                      </h1>
                      {profile.verification_status === "verified" && (
                        <CheckCircle2 className="h-5 w-5 text-accent shrink-0" />
                      )}
                      {profile.verification_status === "pending" && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                          <Clock className="h-3 w-3" /> Pending Verification
                        </span>
                      )}
                    </div>
                    {profile.display_name && profile.display_name !== profile.full_name && (
                      <p className="text-sm text-muted-foreground">{profile.full_name}</p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 shrink-0">
                    {isOwnProfile ? (
                      <Button variant="outline" size="sm" className="gap-1.5">
                        <Edit3 className="h-3.5 w-3.5" /> Edit Profile
                      </Button>
                    ) : (
                      <>
                        {connectionStatus.following ? (
                          <Button variant="secondary" size="sm" className="gap-1.5" disabled>
                            <UserCheck className="h-3.5 w-3.5" /> Following
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm" className="gap-1.5" onClick={follow} disabled={connLoading}>
                            <UserPlus className="h-3.5 w-3.5" /> Follow
                          </Button>
                        )}
                        {connectionStatus.connected === "accepted" ? (
                          <Button variant="secondary" size="sm" className="gap-1.5" disabled>
                            <Users className="h-3.5 w-3.5" /> Connected
                          </Button>
                        ) : connectionStatus.connected === "pending" ? (
                          <Button variant="secondary" size="sm" className="gap-1.5" disabled>
                            <Clock className="h-3.5 w-3.5" /> Pending
                          </Button>
                        ) : (
                          <Button variant="default" size="sm" className="gap-1.5" onClick={connect} disabled={connLoading}>
                            <Users className="h-3.5 w-3.5" /> Connect
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Role Badges */}
              <div className="flex items-center gap-2 flex-wrap pb-4">
                <Badge variant="outline" className="text-xs capitalize gap-1">
                  <Briefcase className="h-3 w-3" />
                  {profile.user_type}
                </Badge>
                {roles.map((r, i) => {
                  const Icon = roleIcon[r.role];
                  return (
                    <span key={i} className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${roleColor[r.role] || ""}`}>
                      {Icon && <Icon className="h-3 w-3" />}
                      <span className="capitalize">{r.sub_type || r.role}</span>
                    </span>
                  );
                })}
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground ml-auto">
                  <Calendar className="h-3 w-3" />
                  Joined {format(new Date(profile.created_at), "MMM yyyy")}
                </span>
              </div>
            </div>

            {/* Bio */}
            {profile.bio && (
              <div className="px-5 sm:px-6 pb-4">
                <p className="text-sm text-card-foreground leading-relaxed">{profile.bio}</p>
              </div>
            )}

            {/* Stats Bar */}
            <div className="border-t border-border grid grid-cols-4 divide-x divide-border">
              {[
                { label: "Posts", value: stats.posts },
                { label: "Followers", value: stats.followers },
                { label: "Following", value: stats.following },
                { label: "Connections", value: stats.connections },
              ].map((stat) => (
                <button key={stat.label} className="py-3 text-center hover:bg-muted/50 transition-colors">
                  <p className="text-lg sm:text-xl font-bold font-heading text-card-foreground leading-none">{stat.value}</p>
                  <p className="text-[11px] text-muted-foreground mt-1">{stat.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Tabs: Posts / About */}
          <Tabs defaultValue="posts" className="w-full">
            <TabsList className="w-full justify-start bg-card border border-border rounded-xl h-11 p-1 mb-4">
              <TabsTrigger value="posts" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm font-medium flex-1 sm:flex-none sm:px-6">
                Posts
              </TabsTrigger>
              <TabsTrigger value="about" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-sm font-medium flex-1 sm:flex-none sm:px-6">
                About
              </TabsTrigger>
            </TabsList>

            <TabsContent value="posts" className="space-y-4 mt-0">
              {userPosts.length === 0 ? (
                <div className="rounded-xl border border-border bg-card p-10 text-center">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                    <Edit3 className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground text-sm font-medium">No posts yet</p>
                  <p className="text-muted-foreground text-xs mt-1">
                    {isOwnProfile ? "Share your first insight with the community." : "This user hasn't posted yet."}
                  </p>
                </div>
              ) : (
                userPosts.map((post) => <PostCard key={post.id} post={post} />)
              )}
            </TabsContent>

            <TabsContent value="about" className="mt-0">
              <div className="rounded-xl border border-border bg-card p-6 space-y-5">
                {/* Info rows */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Briefcase className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Account Type</p>
                      <p className="text-sm text-card-foreground capitalize font-medium">{profile.user_type}</p>
                    </div>
                  </div>

                  {roles.length > 0 && (
                    <div className="flex items-start gap-3">
                      <Users className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">Roles</p>
                        <div className="flex items-center gap-2 flex-wrap mt-1">
                          {roles.map((r, i) => {
                            const Icon = roleIcon[r.role];
                            return (
                              <span key={i} className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${roleColor[r.role] || ""}`}>
                                {Icon && <Icon className="h-3 w-3" />}
                                <span className="capitalize">{r.sub_type || r.role}</span>
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {profile.verification_status !== "unverified" && (
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">Verification</p>
                        <p className="text-sm text-card-foreground capitalize font-medium flex items-center gap-1.5">
                          {profile.verification_status === "verified" ? (
                            <><CheckCircle2 className="h-3.5 w-3.5 text-accent" /> Verified</>
                          ) : (
                            <><Clock className="h-3.5 w-3.5 text-muted-foreground" /> Pending</>
                          )}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Member Since</p>
                      <p className="text-sm text-card-foreground font-medium">
                        {format(new Date(profile.created_at), "MMMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                </div>

                {profile.bio && (
                  <>
                    <div className="border-t border-border" />
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Bio</p>
                      <p className="text-sm text-card-foreground leading-relaxed">{profile.bio}</p>
                    </div>
                  </>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        <div className="container max-w-3xl mx-auto pt-4">
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <p className="text-muted-foreground">Profile not found.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
