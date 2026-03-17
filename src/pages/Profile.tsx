import { useEffect, useState, memo } from "react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Edit3, BarChart3, Bookmark, CreditCard, FolderLock, Sparkles, Store, ExternalLink, Download, Share2 } from "lucide-react";
import { PostCard } from "@/components/feed/PostCard";
import { PostCardSkeleton } from "@/components/feed/PostCardSkeleton";
import { useConnectionActions } from "@/hooks/useConnectionActions";
import AppLayout from "@/components/AppLayout";
import { FindooLoader } from "@/components/FindooLoader";
import { ProfileHeader, type ProfileData, type RoleData, type ProfileStats } from "@/components/profile/ProfileHeader";
import { ProfileAbout } from "@/components/profile/ProfileAbout";
import { ProfileNetwork } from "@/components/profile/ProfileNetwork";
import { ProfileSidebar } from "@/components/profile/ProfileSidebar";
import { EditProfileDialog } from "@/components/profile/EditProfileDialog";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useRole } from "@/contexts/RoleContext";
import { DigitalCardManager } from "@/components/profile/DigitalCardManager";
import { VaultProfileTab } from "@/components/vault/VaultProfileTab";
import { ProfileListingsTab } from "@/components/profile/ProfileListingsTab";
import { ActivityTimeline } from "@/components/profile/ActivityTimeline";
import { FeaturedContent } from "@/components/profile/FeaturedContent";
import { ProfileCompletenessRing } from "@/components/profile/ProfileCompletenessRing";
import { MutualConnections } from "@/components/profile/MutualConnections";
import { TrustScoreBadge } from "@/components/profile/TrustScoreBadge";
import { useQuery } from "@tanstack/react-query";
import { GamificationProfileCard } from "@/components/gamification/GamificationProfileCard";
import type { FeedPost } from "@/hooks/useFeedPosts";

const MemoizedPostCard = memo(PostCard);
const MemoizedProfileSidebar = memo(ProfileSidebar);

// Hook to fetch user's posts directly from DB instead of loading all feed posts
function useUserPosts(profileId: string | undefined) {
  return useQuery({
    queryKey: ["user-posts", profileId],
    enabled: !!profileId,
    queryFn: async (): Promise<FeedPost[]> => {
      if (!profileId) return [];
      const { data: posts, error } = await supabase
        .from("posts")
        .select("*")
        .eq("author_id", profileId)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      
      // Fetch profile for this author
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, full_name, display_name, avatar_url, verification_status")
        .eq("id", profileId)
        .single();
      
      // Fetch interaction counts in parallel
      const postIds = posts?.map((p) => p.id) || [];
      const [likesRes, commentsRes, bookmarksRes, rolesRes] = await Promise.all([
        postIds.length > 0
          ? supabase.from("post_interactions").select("post_id").in("post_id", postIds).eq("interaction_type", "like")
          : Promise.resolve({ data: [] }),
        postIds.length > 0
          ? supabase.from("comments").select("post_id").in("post_id", postIds)
          : Promise.resolve({ data: [] }),
        postIds.length > 0
          ? supabase.from("post_interactions").select("post_id").in("post_id", postIds).eq("interaction_type", "bookmark")
          : Promise.resolve({ data: [] }),
        supabase.from("user_roles").select("role, sub_type").eq("user_id", profileId),
      ]);

      const likeCounts = new Map<string, number>();
      const commentCounts = new Map<string, number>();
      const bookmarkCounts = new Map<string, number>();
      (likesRes.data || []).forEach((r: any) => likeCounts.set(r.post_id, (likeCounts.get(r.post_id) || 0) + 1));
      (commentsRes.data || []).forEach((r: any) => commentCounts.set(r.post_id, (commentCounts.get(r.post_id) || 0) + 1));
      (bookmarksRes.data || []).forEach((r: any) => bookmarkCounts.set(r.post_id, (bookmarkCounts.get(r.post_id) || 0) + 1));

      return (posts || []).map((p) => ({
        id: p.id,
        content: p.content,
        post_type: p.post_type,
        post_kind: p.post_kind,
        query_category: p.query_category || null,
        hashtags: p.hashtags,
        attachment_url: p.attachment_url,
        attachment_name: p.attachment_name,
        attachment_type: p.attachment_type,
        created_at: p.created_at,
        author: {
          id: profile?.id || profileId,
          full_name: profile?.full_name || "Unknown",
          display_name: profile?.display_name || null,
          avatar_url: profile?.avatar_url || null,
          verification_status: profile?.verification_status || "unverified",
        },
        roles: rolesRes.data?.map((r) => ({ role: r.role, sub_type: r.sub_type })) || [],
        like_count: likeCounts.get(p.id) || 0,
        comment_count: commentCounts.get(p.id) || 0,
        bookmark_count: bookmarkCounts.get(p.id) || 0,
      }));
    },
    staleTime: 60_000,
  });
}

const Profile = () => {
  usePageMeta({ title: "Profile" });
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [roles, setRoles] = useState<RoleData[]>([]);
  const [stats, setStats] = useState<ProfileStats>({ followers: 0, following: 0, connections: 0, posts: 0 });
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "about");
  const [endorsementCount, setEndorsementCount] = useState(0);
  const { connectionStatus, follow, unfollow, connect, disconnect, loading: connLoading } = useConnectionActions(currentUserId, profile?.id ?? null);
  const { refreshRoles } = useRole();

  const isOwnProfile = !id || id === currentUserId;
  
  // Query user posts directly instead of loading all feed posts
  const { data: userPosts, isLoading: postsLoading } = useUserPosts(profile?.id);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return;
      setCurrentUserId(session.user.id);
      const targetId = id || session.user.id;
      loadProfile(targetId);

      if (id && id !== session.user.id) {
        supabase.from("profile_views").insert(
          { profile_id: id, viewer_id: session.user.id }
        ).then(() => {});
      }
    });
  }, [id]);

  const loadProfile = async (targetId: string) => {
    setLoading(true);
    const [profileRes, rolesRes, followersRes, followingRes, connectionsRes, postsRes, endorseRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", targetId).single(),
      supabase.from("user_roles").select("role, sub_type").eq("user_id", targetId),
      supabase.from("connections").select("id", { count: "exact", head: true }).eq("to_user_id", targetId).eq("connection_type", "follow"),
      supabase.from("connections").select("id", { count: "exact", head: true }).eq("from_user_id", targetId).eq("connection_type", "follow"),
      supabase.from("connections").select("id", { count: "exact", head: true }).or(`from_user_id.eq.${targetId},to_user_id.eq.${targetId}`).eq("connection_type", "connect").eq("status", "accepted"),
      supabase.from("posts").select("id", { count: "exact", head: true }).eq("author_id", targetId),
      supabase.from("endorsements").select("id", { count: "exact", head: true }).eq("endorsed_user_id", targetId),
    ]);
    if (profileRes.data) {
      const d = profileRes.data as any;
      setProfile({
        id: d.id, full_name: d.full_name, display_name: d.display_name,
        user_type: d.user_type, bio: d.bio, avatar_url: d.avatar_url,
        banner_url: d.banner_url ?? null, verification_status: d.verification_status,
        created_at: d.created_at, headline: d.headline ?? null, location: d.location ?? null,
        organization: d.organization ?? null, designation: d.designation ?? null,
        website: d.website ?? null, experience_years: d.experience_years ?? null,
        specializations: d.specializations ?? null, regulatory_ids: d.regulatory_ids ?? null,
        social_links: d.social_links ?? null, languages: d.languages ?? null,
        certifications: d.certifications ?? null,
      });
    }
    if (rolesRes.data) setRoles(rolesRes.data);
    setStats({
      followers: followersRes.count ?? 0, following: followingRes.count ?? 0,
      connections: connectionsRes.count ?? 0, posts: postsRes.count ?? 0,
    });
    setEndorsementCount(endorseRes.count ?? 0);
    setLoading(false);
  };

  const handleProfileSaved = () => {
    const targetId = id || currentUserId;
    if (targetId) loadProfile(targetId);
  };

  const handleRolesChanged = () => {
    const targetId = id || currentUserId;
    if (targetId) loadProfile(targetId);
    refreshRoles();
  };

  const tabTriggerClass = "rounded-lg text-sm font-medium whitespace-nowrap px-4 sm:px-6 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground";

  return (
    <AppLayout maxWidth="max-w-6xl">
      {!isOwnProfile && !loading && (
        <Button variant="ghost" size="sm" className="text-muted-foreground mb-3" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Back
        </Button>
      )}

      {loading ? (
        <FindooLoader text="Loading profile..." />
      ) : profile ? (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
          {/* Main Content */}
          <div className="min-w-0">
            <ErrorBoundary fallbackTitle="Error loading profile header">
              <ProfileHeader
                profile={profile}
                roles={roles}
                stats={stats}
                isOwnProfile={isOwnProfile}
                connectionStatus={connectionStatus}
                follow={follow}
                unfollow={unfollow}
                connect={connect}
                disconnect={disconnect}
                connLoading={connLoading}
                onEditProfile={() => setEditOpen(true)}
                onNavigateToNetwork={() => setActiveTab("network")}
              />
            </ErrorBoundary>

            {/* Featured Content — below header, above tabs */}
            <FeaturedContent profileId={profile.id} isOwnProfile={isOwnProfile} />

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-4">
              <div className="overflow-x-auto -mx-1 px-1 mb-4 scrollbar-hide">
                <TabsList className="inline-flex w-max sm:w-full justify-start bg-card border border-border rounded-xl h-11 p-1">
                  <TabsTrigger value="about" className={tabTriggerClass}>About</TabsTrigger>
                  <TabsTrigger value="network" className={tabTriggerClass}>Network</TabsTrigger>
                  <TabsTrigger value="activity" className={tabTriggerClass}>Activity</TabsTrigger>
                  <TabsTrigger value="posts" className={tabTriggerClass}>Posts</TabsTrigger>
                  <TabsTrigger value="directory" className={tabTriggerClass}>
                    <Store className="h-3.5 w-3.5 mr-1" /> Directory
                  </TabsTrigger>
                  {isOwnProfile && (
                    <TabsTrigger value="vault" className={tabTriggerClass}>
                      <FolderLock className="h-3.5 w-3.5 mr-1" /> Vault
                    </TabsTrigger>
                  )}
                  <TabsTrigger value="digital-card" className={tabTriggerClass}>
                    <CreditCard className="h-3.5 w-3.5 mr-1" /> Digital Card
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="about" className="mt-0">
                <ProfileAbout
                  profile={profile}
                  roles={roles}
                  isOwnProfile={isOwnProfile}
                  onRolesChanged={handleRolesChanged}
                  currentUserId={currentUserId}
                />
              </TabsContent>

              <TabsContent value="network" className="mt-0">
                <ProfileNetwork profileId={profile.id} isOwnProfile={isOwnProfile} currentUserId={currentUserId} />
              </TabsContent>

              <TabsContent value="activity" className="mt-0">
                <ActivityTimeline profileId={profile.id} isOwnProfile={isOwnProfile} />
              </TabsContent>

              <TabsContent value="posts" className="space-y-4 mt-0">
                {postsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => <PostCardSkeleton key={i} />)}
                  </div>
                ) : !userPosts?.length ? (
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
                  userPosts.map((post) => <MemoizedPostCard key={post.id} post={post} />)
                )}
              </TabsContent>

              <TabsContent value="directory" className="mt-0">
                <ProfileListingsTab profileId={profile.id} isOwnProfile={isOwnProfile} roles={roles} />
              </TabsContent>

              {isOwnProfile && (
                <TabsContent value="bookmarks" className="space-y-4 mt-0">
                  <BookmarkedPosts currentUserId={currentUserId} />
                </TabsContent>
              )}

              {isOwnProfile && profile && (
                <TabsContent value="vault" className="mt-0">
                  <VaultProfileTab profileId={profile.id} />
                </TabsContent>
              )}

              {isOwnProfile && profile && (
                <TabsContent value="digital-card" className="mt-0">
                  <DigitalCardManager
                    profileId={profile.id}
                    digitalCardFields={(profile as any).digital_card_fields ?? null}
                    onFieldsUpdated={handleProfileSaved}
                  />
                </TabsContent>
              )}

              {!isOwnProfile && profile && (
                <TabsContent value="digital-card" className="mt-0">
                  <DigitalCardPreview profileId={profile.id} />
                </TabsContent>
              )}
            </Tabs>

            {/* Mobile Sidebar Widgets — visible only on smaller screens */}
            <div className="lg:hidden space-y-4 mt-6">
              <ProfileCompletenessRing
                profile={profile}
                roles={roles}
                isOwnProfile={isOwnProfile}
                onEditProfile={isOwnProfile ? () => setEditOpen(true) : undefined}
              />
              <TrustScoreBadge
                profile={profile}
                stats={stats}
                endorsementCount={endorsementCount}
              />
              <MutualConnections
                profileId={profile.id}
                currentUserId={currentUserId}
                isOwnProfile={isOwnProfile}
              />
              <GamificationProfileCard userId={profile.id} />
              <MemoizedProfileSidebar
                profile={profile}
                roles={roles}
                stats={stats}
                isOwnProfile={isOwnProfile}
                onNavigateToNetwork={() => setActiveTab("network")}
              />
            </div>
          </div>

          {/* Right Sidebar — desktop only */}
          <aside className="hidden lg:block">
            <div className="sticky top-20 space-y-4">
              <ProfileCompletenessRing
                profile={profile}
                roles={roles}
                isOwnProfile={isOwnProfile}
                onEditProfile={isOwnProfile ? () => setEditOpen(true) : undefined}
              />
              <TrustScoreBadge
                profile={profile}
                stats={stats}
                endorsementCount={endorsementCount}
              />
              <MutualConnections
                profileId={profile.id}
                currentUserId={currentUserId}
                isOwnProfile={isOwnProfile}
              />
              <GamificationProfileCard userId={profile.id} />
              <MemoizedProfileSidebar
                profile={profile}
                roles={roles}
                stats={stats}
                isOwnProfile={isOwnProfile}
                onNavigateToNetwork={() => setActiveTab("network")}
              />
            </div>
          </aside>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <p className="text-muted-foreground">Profile not found.</p>
        </div>
      )}

      {profile && isOwnProfile && (
        <EditProfileDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          profile={profile}
          onSaved={handleProfileSaved}
        />
      )}
    </AppLayout>
  );
};

function BookmarkedPosts({ currentUserId }: { currentUserId: string | null }) {
  const { data: bookmarks, isLoading } = useQuery({
    queryKey: ["bookmarked-posts", currentUserId],
    enabled: !!currentUserId,
    queryFn: async (): Promise<FeedPost[]> => {
      if (!currentUserId) return [];
      const { data: interactions } = await supabase
        .from("post_interactions")
        .select("post_id")
        .eq("user_id", currentUserId)
        .eq("interaction_type", "bookmark");
      
      const postIds = interactions?.map((i) => i.post_id) || [];
      if (postIds.length === 0) return [];

      const { data: posts } = await supabase
        .from("posts")
        .select("*")
        .in("id", postIds)
        .order("created_at", { ascending: false });
      
      if (!posts?.length) return [];

      const authorIds = [...new Set(posts.map((p) => p.author_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, display_name, avatar_url, verification_status")
        .in("id", authorIds);
      
      const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);
      
      return posts.map((p) => {
        const author = profileMap.get(p.author_id);
        return {
          id: p.id,
          content: p.content,
          post_type: p.post_type,
          post_kind: p.post_kind,
          query_category: p.query_category || null,
          hashtags: p.hashtags,
          attachment_url: p.attachment_url,
          attachment_name: p.attachment_name,
          attachment_type: p.attachment_type,
          created_at: p.created_at,
          author: {
            id: author?.id || p.author_id,
            full_name: author?.full_name || "Unknown",
            display_name: author?.display_name || null,
            avatar_url: author?.avatar_url || null,
            verification_status: author?.verification_status || "unverified",
          },
          roles: [],
          like_count: 0,
          comment_count: 0,
          bookmark_count: 0,
        };
      });
    },
    staleTime: 30_000,
  });

  if (isLoading) return (
    <div className="space-y-4">
      {[1, 2].map((i) => <PostCardSkeleton key={i} />)}
    </div>
  );

  if (!bookmarks?.length) {
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

  return <>{bookmarks.map((post) => <MemoizedPostCard key={post.id} post={post} />)}</>;
}

function DigitalCardPreview({ profileId }: { profileId: string }) {
  const cardUrl = `${window.location.origin}/card/${profileId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(cardUrl);
    import("sonner").then(({ toast }) => toast.success("Card link copied!"));
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: "Digital Card", url: cardUrl });
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <h3 className="text-sm font-semibold font-heading text-card-foreground flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-muted-foreground" />
          Digital Business Card
        </h3>
        <p className="text-xs text-muted-foreground mt-1">View or save this person's professional card.</p>
      </div>
      <div className="p-5 flex flex-col items-center gap-4">
        <a
          href={cardUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <ExternalLink className="h-4 w-4" /> View Full Card
        </a>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleCopyLink}>
            Copy Link
          </Button>
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="h-3.5 w-3.5 mr-1" /> Share
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Profile;
