import { useState } from "react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AppLayout from "@/components/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bookmark, FileText, Briefcase, Calendar, Package } from "lucide-react";
import { PostCard } from "@/components/feed/PostCard";
import { PostCardSkeleton } from "@/components/feed/PostCardSkeleton";
import { JobCard } from "@/components/jobs/JobCard";
import { JobCardSkeleton } from "@/components/skeletons/JobCardSkeleton";
import { EventCard } from "@/components/events/EventCard";
import { EventCardSkeleton } from "@/components/skeletons/EventCardSkeleton";
import { memo } from "react";

const MemoizedPostCard = memo(PostCard);

import type { FeedPost } from "@/hooks/useFeedPosts";

const Bookmarks = () => {
  usePageMeta({ title: "Bookmarks" });
  const [activeTab, setActiveTab] = useState("posts");

  // Bookmarked posts
  const { data: bookmarkedPosts, isLoading: postsLoading } = useQuery({
    queryKey: ["bookmarked-posts-page"],
    queryFn: async (): Promise<FeedPost[]> => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return [];
      const { data: interactions } = await supabase
        .from("post_interactions")
        .select("post_id")
        .eq("user_id", session.user.id)
        .eq("interaction_type", "bookmark");

      const postIds = interactions?.map((i) => i.post_id) || [];
      if (!postIds.length) return [];

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
          posted_as_role: (p as any).posted_as_role || null,
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

  // Saved jobs
  const { data: savedJobs, isLoading: jobsLoading } = useQuery({
    queryKey: ["bookmarked-jobs-page"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return [];
      const { data: saved } = await supabase
        .from("saved_jobs")
        .select("job_id")
        .eq("user_id", session.user.id);

      const jobIds = saved?.map((s) => s.job_id) || [];
      if (!jobIds.length) return [];

      const { data: jobs } = await supabase
        .from("jobs")
        .select("*")
        .in("id", jobIds)
        .order("created_at", { ascending: false });

      return jobs || [];
    },
    staleTime: 30_000,
  });

  // Registered events (as bookmarked)
  const { data: savedEvents, isLoading: eventsLoading } = useQuery({
    queryKey: ["bookmarked-events-page"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return [];
      const { data: registrations } = await supabase
        .from("event_registrations")
        .select("event_id")
        .eq("user_id", session.user.id)
        .eq("status", "registered");

      const eventIds = registrations?.map((r) => r.event_id) || [];
      if (!eventIds.length) return [];

      const { data: events } = await supabase
        .from("events")
        .select("*")
        .in("id", eventIds)
        .order("start_time", { ascending: false });

      return events || [];
    },
    staleTime: 30_000,
  });

  const renderEmpty = (icon: React.ReactNode, label: string) => (
    <div className="rounded-xl border border-border bg-card p-10 text-center">
      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
        {icon}
      </div>
      <p className="text-muted-foreground text-sm font-medium">No {label} bookmarked</p>
      <p className="text-muted-foreground text-xs mt-1">Items you save will appear here for easy access.</p>
    </div>
  );

  return (
    <AppLayout maxWidth="max-w-4xl">
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-bold font-heading text-foreground flex items-center gap-2">
            <Bookmark className="h-5 w-5 text-primary" />
            Bookmarks
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            All your saved items in one place
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start bg-card border border-border rounded-xl h-11 p-1">
            <TabsTrigger value="posts" className="gap-1.5 text-xs rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <FileText className="h-3.5 w-3.5" /> Posts
              {bookmarkedPosts?.length ? (
                <span className="ml-1 text-[10px] bg-muted text-muted-foreground rounded-full px-1.5 py-0.5">{bookmarkedPosts.length}</span>
              ) : null}
            </TabsTrigger>
            <TabsTrigger value="jobs" className="gap-1.5 text-xs rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Briefcase className="h-3.5 w-3.5" /> Jobs
              {savedJobs?.length ? (
                <span className="ml-1 text-[10px] bg-muted text-muted-foreground rounded-full px-1.5 py-0.5">{savedJobs.length}</span>
              ) : null}
            </TabsTrigger>
            <TabsTrigger value="events" className="gap-1.5 text-xs rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Calendar className="h-3.5 w-3.5" /> Events
              {savedEvents?.length ? (
                <span className="ml-1 text-[10px] bg-muted text-muted-foreground rounded-full px-1.5 py-0.5">{savedEvents.length}</span>
              ) : null}
            </TabsTrigger>
          </TabsList>

          {/* Posts */}
          <TabsContent value="posts" className="mt-4 space-y-4">
            {postsLoading ? (
              <div className="space-y-4">{[1, 2, 3].map((i) => <PostCardSkeleton key={i} />)}</div>
            ) : bookmarkedPosts?.length ? (
              bookmarkedPosts.map((post) => <MemoizedPostCard key={post.id} post={post} />)
            ) : (
              renderEmpty(<FileText className="h-5 w-5 text-muted-foreground" />, "posts")
            )}
          </TabsContent>

          {/* Jobs */}
          <TabsContent value="jobs" className="mt-4 space-y-4">
            {jobsLoading ? (
              <div className="space-y-4">{[1, 2, 3].map((i) => <JobCardSkeleton key={i} />)}</div>
            ) : savedJobs?.length ? (
              savedJobs.map((job: any) => <JobCard key={job.id} job={job} />)
            ) : (
              renderEmpty(<Briefcase className="h-5 w-5 text-muted-foreground" />, "jobs")
            )}
          </TabsContent>

          {/* Events */}
          <TabsContent value="events" className="mt-4 space-y-4">
            {eventsLoading ? (
              <div className="space-y-4">{[1, 2, 3].map((i) => <EventCardSkeleton key={i} />)}</div>
            ) : savedEvents?.length ? (
              savedEvents.map((event: any) => <EventCard key={event.id} event={event} />)
            ) : (
              renderEmpty(<Calendar className="h-5 w-5 text-muted-foreground" />, "events")
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Bookmarks;
