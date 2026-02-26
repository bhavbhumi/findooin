import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Edit3, BarChart3, Bookmark } from "lucide-react";
import { useFeedPosts, type FeedPost } from "@/hooks/useFeedPosts";
import { PostCard } from "@/components/feed/PostCard";
import { useConnectionActions } from "@/hooks/useConnectionActions";
import AppNavbar from "@/components/AppNavbar";
import { ProfileHeader, type ProfileData, type RoleData, type ProfileStats } from "@/components/profile/ProfileHeader";
import { ProfileAbout } from "@/components/profile/ProfileAbout";
import { ProfileNetwork } from "@/components/profile/ProfileNetwork";
import { EditProfileDialog } from "@/components/profile/EditProfileDialog";

const Profile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [roles, setRoles] = useState<RoleData[]>([]);
  const [stats, setStats] = useState<ProfileStats>({ followers: 0, following: 0, connections: 0, posts: 0 });
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("about");
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
    if (profileRes.data) {
      const d = profileRes.data as any;
      setProfile({
        id: d.id,
        full_name: d.full_name,
        display_name: d.display_name,
        user_type: d.user_type,
        bio: d.bio,
        avatar_url: d.avatar_url,
        banner_url: d.banner_url ?? null,
        verification_status: d.verification_status,
        created_at: d.created_at,
        headline: d.headline ?? null,
        location: d.location ?? null,
        organization: d.organization ?? null,
        designation: d.designation ?? null,
        website: d.website ?? null,
        experience_years: d.experience_years ?? null,
        specializations: d.specializations ?? null,
        regulatory_ids: d.regulatory_ids ?? null,
        social_links: d.social_links ?? null,
        languages: d.languages ?? null,
        certifications: d.certifications ?? null,
      });
    }
    if (rolesRes.data) setRoles(rolesRes.data);
    setStats({
      followers: followersRes.count ?? 0,
      following: followingRes.count ?? 0,
      connections: connectionsRes.count ?? 0,
      posts: postsRes.count ?? 0,
    });
    setLoading(false);
  };

  const handleProfileSaved = () => {
    const targetId = id || currentUserId;
    if (targetId) loadProfile(targetId);
  };

  const userPosts = allPosts?.filter((p) => p.author.id === profile?.id) ?? [];

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <AppNavbar />

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
            <Skeleton className="h-40 w-full" />
            <div className="px-6 pb-6">
              <div className="-mt-14 flex items-end gap-4 mb-4">
                <Skeleton className="h-28 w-28 rounded-full border-4 border-card" />
                <div className="space-y-2 pb-1">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-56" />
                </div>
              </div>
              <Skeleton className="h-12 w-full mb-3" />
              <Skeleton className="h-8 w-64" />
            </div>
          </div>
        </div>
      ) : profile ? (
        <div className="container max-w-3xl mx-auto pt-4">
          <ProfileHeader
            profile={profile}
            roles={roles}
            stats={stats}
            isOwnProfile={isOwnProfile}
            connectionStatus={connectionStatus}
            follow={follow}
            connect={connect}
            connLoading={connLoading}
            onEditProfile={() => setEditOpen(true)}
            onNavigateToNetwork={() => setActiveTab("network")}
          />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="overflow-x-auto -mx-1 px-1 mb-4">
              <TabsList className="inline-flex w-max sm:w-full justify-start bg-card border border-border rounded-xl h-11 p-1">
                <TabsTrigger value="about" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:hover:bg-gold data-[state=active]:hover:text-gold-foreground text-sm font-medium whitespace-nowrap px-4 sm:px-6">
                  About
                </TabsTrigger>
                <TabsTrigger value="network" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:hover:bg-gold data-[state=active]:hover:text-gold-foreground text-sm font-medium whitespace-nowrap px-4 sm:px-6">
                  Network
                </TabsTrigger>
                <TabsTrigger value="activity" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:hover:bg-gold data-[state=active]:hover:text-gold-foreground text-sm font-medium whitespace-nowrap px-4 sm:px-6">
                  Activity
                </TabsTrigger>
                <TabsTrigger value="posts" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:hover:bg-gold data-[state=active]:hover:text-gold-foreground text-sm font-medium whitespace-nowrap px-4 sm:px-6">
                  Posts
                </TabsTrigger>
                {isOwnProfile && (
                  <TabsTrigger value="bookmarks" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:hover:bg-gold data-[state=active]:hover:text-gold-foreground text-sm font-medium whitespace-nowrap px-4 sm:px-6">
                    Bookmarks
                  </TabsTrigger>
                )}
              </TabsList>
            </div>

            <TabsContent value="about" className="mt-0">
              <ProfileAbout profile={profile} roles={roles} isOwnProfile={isOwnProfile} />
            </TabsContent>

            <TabsContent value="network" className="mt-0">
              <ProfileNetwork
                profileId={profile.id}
                isOwnProfile={isOwnProfile}
                currentUserId={currentUserId}
              />
            </TabsContent>

            <TabsContent value="activity" className="mt-0">
              <div className="rounded-xl border border-border bg-card p-10 text-center">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                  <BarChart3 className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-sm font-medium">Activity insights coming soon</p>
                <p className="text-muted-foreground text-xs mt-1">
                  Track engagement metrics, post frequency, and network growth over time.
                </p>
              </div>
            </TabsContent>

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

            {isOwnProfile && (
              <TabsContent value="bookmarks" className="space-y-4 mt-0">
                <BookmarkedPosts allPosts={allPosts} currentUserId={currentUserId} />
              </TabsContent>
            )}
          </Tabs>

          {/* Edit Profile Dialog */}
          {isOwnProfile && profile && (
            <EditProfileDialog
              open={editOpen}
              onOpenChange={setEditOpen}
              profile={profile}
              onSaved={handleProfileSaved}
            />
          )}
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

// Bookmarked posts sub-component
function BookmarkedPosts({ allPosts, currentUserId }: { allPosts: FeedPost[] | undefined; currentUserId: string | null }) {
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUserId) return;
    supabase
      .from("post_interactions")
      .select("post_id")
      .eq("user_id", currentUserId)
      .eq("interaction_type", "bookmark")
      .then(({ data }) => {
        setBookmarkedIds(new Set(data?.map((d: any) => d.post_id) || []));
        setLoading(false);
      });
  }, [currentUserId]);

  if (loading) {
    return <div className="rounded-xl border border-border bg-card p-10 text-center"><p className="text-muted-foreground text-sm">Loading...</p></div>;
  }

  const bookmarkedPosts = allPosts?.filter((p) => bookmarkedIds.has(p.id)) || [];

  if (bookmarkedPosts.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-10 text-center">
        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
          <Bookmark className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground text-sm font-medium">No bookmarks yet</p>
        <p className="text-muted-foreground text-xs mt-1">Posts you bookmark will appear here for easy access.</p>
      </div>
    );
  }

  return <>{bookmarkedPosts.map((post) => <PostCard key={post.id} post={post} />)}</>;
}

export default Profile;
