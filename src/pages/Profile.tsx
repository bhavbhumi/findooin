import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle2, ArrowLeft, UserPlus, UserCheck, Users, BarChart3, Building2, Clock,
} from "lucide-react";
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

function getInitials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

const Profile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [roles, setRoles] = useState<RoleData[]>([]);
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
    const [profileRes, rolesRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", targetId).single(),
      supabase.from("user_roles").select("role, sub_type").eq("user_id", targetId),
    ]);
    if (profileRes.data) setProfile(profileRes.data as ProfileData);
    if (rolesRes.data) setRoles(rolesRes.data);
    setLoading(false);
  };

  const userPosts = allPosts?.filter((p) => p.author.id === profile?.id) ?? [];

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <AppNavbar />

      <div className="container py-6 max-w-3xl mx-auto">
        {!isOwnProfile && (
          <Button variant="ghost" size="sm" className="mb-4 text-muted-foreground" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back
          </Button>
        )}

        {loading ? (
          <div className="rounded-xl border border-border bg-card p-8 space-y-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2"><Skeleton className="h-5 w-40" /><Skeleton className="h-4 w-24" /></div>
            </div>
            <Skeleton className="h-12 w-full" />
          </div>
        ) : profile ? (
          <>
            {/* Profile card */}
            <div className="rounded-xl border border-border bg-card p-6 mb-6">
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-lg font-bold text-muted-foreground shrink-0 overflow-hidden">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile.full_name} className="h-full w-full object-cover" />
                  ) : (
                    getInitials(profile.full_name)
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl font-bold font-heading text-card-foreground">
                      {profile.display_name || profile.full_name}
                    </h1>
                    {profile.verification_status === "verified" && (
                      <CheckCircle2 className="h-5 w-5 text-accent" />
                    )}
                    {profile.verification_status === "pending" && (
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  {profile.display_name && profile.display_name !== profile.full_name && (
                    <p className="text-sm text-muted-foreground">{profile.full_name}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <Badge variant="outline" className="text-xs capitalize">{profile.user_type}</Badge>
                    {roles.map((r, i) => {
                      const Icon = roleIcon[r.role];
                      return (
                        <span key={i} className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${roleColor[r.role] || ""}`}>
                          {Icon && <Icon className="h-3 w-3" />}
                          {r.sub_type || r.role}
                        </span>
                      );
                    })}
                  </div>
                  {profile.bio && <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{profile.bio}</p>}
                </div>
              </div>

              {/* Actions */}
              {!isOwnProfile && currentUserId && (
                <div className="flex items-center gap-2 mt-5 pt-4 border-t border-border">
                  {connectionStatus.following ? (
                    <Button variant="secondary" size="sm" disabled>
                      <UserCheck className="h-4 w-4 mr-1.5" /> Following
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" onClick={follow} disabled={connLoading}>
                      <UserPlus className="h-4 w-4 mr-1.5" /> Follow
                    </Button>
                  )}
                  {connectionStatus.connected === "accepted" ? (
                    <Button variant="secondary" size="sm" disabled>
                      <Users className="h-4 w-4 mr-1.5" /> Connected
                    </Button>
                  ) : connectionStatus.connected === "pending" ? (
                    <Button variant="secondary" size="sm" disabled>
                      <Clock className="h-4 w-4 mr-1.5" /> Pending
                    </Button>
                  ) : (
                    <Button variant="default" size="sm" onClick={connect} disabled={connLoading}>
                      <Users className="h-4 w-4 mr-1.5" /> Connect
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Posts by this user */}
            <h2 className="font-heading font-semibold text-card-foreground text-sm mb-3">
              Posts ({userPosts.length})
            </h2>
            <div className="space-y-4">
              {userPosts.length === 0 ? (
                <div className="rounded-xl border border-border bg-card p-8 text-center">
                  <p className="text-muted-foreground text-sm">No posts yet.</p>
                </div>
              ) : (
                userPosts.map((post) => <PostCard key={post.id} post={post} />)
              )}
            </div>
          </>
        ) : (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <p className="text-muted-foreground">Profile not found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
