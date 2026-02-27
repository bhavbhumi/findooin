import { useEffect, useState, useMemo, useCallback } from "react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { supabase } from "@/integrations/supabase/client";
import { useRole } from "@/contexts/RoleContext";
import { useQuery } from "@tanstack/react-query";
import AppLayout from "@/components/AppLayout";
import { FindooLoader } from "@/components/FindooLoader";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area,
} from "recharts";
import {
  TrendingUp, Flame, Heart, MessageSquare, Eye, FileText, Clock,
  BarChart3, Bookmark, Download, Users, UserPlus, ArrowUpRight,
} from "lucide-react";
import { format, subDays } from "date-fns";

const COLORS = ["hsl(152,55%,42%)", "hsl(224,60%,55%)", "hsl(262,50%,55%)", "hsl(0,72%,51%)", "hsl(40,80%,55%)", "hsl(190,60%,50%)", "hsl(320,50%,55%)", "hsl(30,80%,55%)"];

type DateRange = "7" | "14" | "30" | "90";

function useAnalyticsData(userId: string | null, days: number) {
  return useQuery({
    queryKey: ["post-analytics", userId, days],
    enabled: !!userId,
    queryFn: async () => {
      const startDate = subDays(new Date(), days).toISOString();

      const [postsRes, interactionsRes, commentsRes, connectionsRes, profileViewsRes, rolesRes] = await Promise.all([
        supabase.from("posts").select("*").order("created_at", { ascending: false }),
        supabase.from("post_interactions").select("*"),
        supabase.from("comments").select("*"),
        supabase.from("connections").select("*").or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`),
        supabase.from("profile_views").select("*").eq("profile_id", userId!),
        supabase.from("user_roles").select("*"),
      ]);

      const allPosts = postsRes.data || [];
      const allInteractions = interactionsRes.data || [];
      const allComments = commentsRes.data || [];
      const allConnections = connectionsRes.data || [];
      const profileViews = profileViewsRes.data || [];
      const allRoles = rolesRes.data || [];

      // Filter by date range for time-based metrics
      const rangeFilter = (dateStr: string) => dateStr >= startDate;

      const myPosts = allPosts.filter((p) => p.author_id === userId);
      const myPostsInRange = myPosts.filter((p) => rangeFilter(p.created_at));
      const myPostIds = new Set(myPosts.map((p) => p.id));
      const myInteractions = allInteractions.filter((i) => myPostIds.has(i.post_id));
      const myInteractionsInRange = myInteractions.filter((i) => rangeFilter(i.created_at));
      const myCommentsAll = allComments.filter((c) => myPostIds.has(c.post_id));
      const myCommentsInRange = myCommentsAll.filter((c) => rangeFilter(c.created_at));
      const myLikes = myInteractionsInRange.filter((i) => i.interaction_type === "like").length;
      const myBookmarks = myInteractionsInRange.filter((i) => i.interaction_type === "bookmark").length;

      // Post type breakdown
      const myTypeBreakdown: Record<string, number> = {};
      myPostsInRange.forEach((p) => { myTypeBreakdown[p.post_type] = (myTypeBreakdown[p.post_type] || 0) + 1; });

      // Daily engagement
      const dailyEngagement: { date: string; likes: number; comments: number; total: number }[] = [];
      for (let i = days - 1; i >= 0; i--) {
        const d = subDays(new Date(), i);
        const dateStr = d.toISOString().slice(0, 10);
        const dayLikes = myInteractions.filter((x) => x.created_at.slice(0, 10) === dateStr && x.interaction_type === "like").length;
        const dayComments = allComments.filter((c) => myPostIds.has(c.post_id) && c.created_at.slice(0, 10) === dateStr).length;
        dailyEngagement.push({ date: format(d, "MM/dd"), likes: dayLikes, comments: dayComments, total: dayLikes + dayComments });
      }

      // Engagement rate
      const engagementRate = myPostsInRange.length > 0 ? ((myLikes + myCommentsInRange.length) / myPostsInRange.length).toFixed(1) : "0";

      // Best posting times
      const hourDist: Record<number, number> = {};
      myPosts.forEach((p) => {
        const hour = new Date(p.created_at).getHours();
        hourDist[hour] = (hourDist[hour] || 0) + 1;
      });
      const bestHours = Object.entries(hourDist)
        .sort((a, b) => Number(b[1]) - Number(a[1]))
        .slice(0, 3)
        .map(([h]) => {
          const hour = Number(h);
          return hour === 0 ? "12 AM" : hour < 12 ? `${hour} AM` : hour === 12 ? "12 PM" : `${hour - 12} PM`;
        });

      // Per-post performance
      const postPerformance = myPostsInRange.slice(0, 10).map((p) => {
        const likes = allInteractions.filter((i) => i.post_id === p.id && i.interaction_type === "like").length;
        const comments = allComments.filter((c) => c.post_id === p.id).length;
        const bookmarks = allInteractions.filter((i) => i.post_id === p.id && i.interaction_type === "bookmark").length;
        return { ...p, likes, comments, bookmarks, engagement: likes + comments * 2 + bookmarks };
      }).sort((a, b) => b.engagement - a.engagement);

      // --- AUDIENCE BREAKDOWN ---
      // Who engages with my posts — group by their role
      const engagerIds = new Set([
        ...myInteractions.map((i) => i.user_id),
        ...myCommentsAll.map((c) => c.author_id),
      ]);
      const audienceRoleMap: Record<string, number> = {};
      engagerIds.forEach((uid) => {
        const userRoles = allRoles.filter((r) => r.user_id === uid);
        if (userRoles.length === 0) {
          audienceRoleMap["No Role"] = (audienceRoleMap["No Role"] || 0) + 1;
        } else {
          userRoles.forEach((r) => {
            const label = r.role.charAt(0).toUpperCase() + r.role.slice(1);
            audienceRoleMap[label] = (audienceRoleMap[label] || 0) + 1;
          });
        }
      });
      const audienceBreakdown = Object.entries(audienceRoleMap).map(([role, count]) => ({ role, count }));

      // --- CONTENT TYPE ENGAGEMENT COMPARISON ---
      const typeEngagement: Record<string, { likes: number; comments: number; posts: number }> = {};
      myPosts.forEach((p) => {
        if (!typeEngagement[p.post_type]) typeEngagement[p.post_type] = { likes: 0, comments: 0, posts: 0 };
        typeEngagement[p.post_type].posts++;
        typeEngagement[p.post_type].likes += allInteractions.filter((i) => i.post_id === p.id && i.interaction_type === "like").length;
        typeEngagement[p.post_type].comments += allComments.filter((c) => c.post_id === p.id).length;
      });
      const contentComparison = Object.entries(typeEngagement).map(([type, data]) => ({
        type: type.replace(/_/g, " "),
        avgEngagement: data.posts > 0 ? +((data.likes + data.comments) / data.posts).toFixed(1) : 0,
        posts: data.posts,
      })).sort((a, b) => b.avgEngagement - a.avgEngagement);

      // --- NETWORK GROWTH ---
      const networkGrowth: { date: string; followers: number; connections: number }[] = [];
      let followersCum = 0;
      let connectionsCum = 0;
      // Pre-count connections before range
      const preRangeFollowers = allConnections.filter((c) => c.to_user_id === userId && c.connection_type === "follow" && c.created_at < startDate).length;
      const preRangeConnections = allConnections.filter((c) => (c.from_user_id === userId || c.to_user_id === userId) && c.connection_type === "connect" && c.status === "accepted" && c.created_at < startDate).length;
      followersCum = preRangeFollowers;
      connectionsCum = preRangeConnections;
      for (let i = days - 1; i >= 0; i--) {
        const d = subDays(new Date(), i);
        const dateStr = d.toISOString().slice(0, 10);
        followersCum += allConnections.filter((c) => c.to_user_id === userId && c.connection_type === "follow" && c.created_at.slice(0, 10) === dateStr).length;
        connectionsCum += allConnections.filter((c) => (c.from_user_id === userId || c.to_user_id === userId) && c.connection_type === "connect" && c.status === "accepted" && c.created_at.slice(0, 10) === dateStr).length;
        networkGrowth.push({ date: format(d, "MM/dd"), followers: followersCum, connections: connectionsCum });
      }

      // --- PROFILE VIEWS ---
      const viewsInRange = profileViews.filter((v) => rangeFilter(v.created_at));
      const dailyViews: { date: string; views: number }[] = [];
      for (let i = days - 1; i >= 0; i--) {
        const d = subDays(new Date(), i);
        const dateStr = d.toISOString().slice(0, 10);
        dailyViews.push({
          date: format(d, "MM/dd"),
          views: profileViews.filter((v) => v.created_at.slice(0, 10) === dateStr).length,
        });
      }

      // Platform analytics
      const hashtagFreq = new Map<string, number>();
      allPosts.forEach((p) => {
        (p.hashtags as string[] | null)?.forEach((t) => {
          const n = t.startsWith("#") ? t.toLowerCase() : `#${t.toLowerCase()}`;
          hashtagFreq.set(n, (hashtagFreq.get(n) || 0) + 1);
        });
      });
      const topHashtags = [...hashtagFreq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([tag, count]) => ({ tag, count }));

      const platformTypeBreakdown: Record<string, number> = {};
      allPosts.forEach((p) => { platformTypeBreakdown[p.post_type] = (platformTypeBreakdown[p.post_type] || 0) + 1; });

      const postEngagement = allPosts.map((p) => {
        const likes = allInteractions.filter((i) => i.post_id === p.id && i.interaction_type === "like").length;
        const comments = allComments.filter((c) => c.post_id === p.id).length;
        return { ...p, likes, comments, total: likes + comments * 2 };
      });
      const topPosts = postEngagement.sort((a, b) => b.total - a.total).slice(0, 5);

      const platformDaily: { date: string; posts: number; interactions: number }[] = [];
      for (let i = days - 1; i >= 0; i--) {
        const d = subDays(new Date(), i);
        const dateStr = d.toISOString().slice(0, 10);
        platformDaily.push({
          date: format(d, "MM/dd"),
          posts: allPosts.filter((p) => p.created_at.slice(0, 10) === dateStr).length,
          interactions: allInteractions.filter((x) => x.created_at.slice(0, 10) === dateStr).length,
        });
      }

      // Category insights for investors
      const categoryInsights: Record<string, { count: number; engagement: number }> = {};
      allPosts.forEach((p) => {
        const type = p.post_type;
        if (!categoryInsights[type]) categoryInsights[type] = { count: 0, engagement: 0 };
        categoryInsights[type].count++;
        categoryInsights[type].engagement += allInteractions.filter((i) => i.post_id === p.id).length;
      });
      const categoryData = Object.entries(categoryInsights)
        .map(([type, data]) => ({
          type: type.replace(/_/g, " "),
          posts: data.count,
          avgEngagement: data.count > 0 ? +(data.engagement / data.count).toFixed(1) : 0,
        }))
        .sort((a, b) => b.avgEngagement - a.avgEngagement);

      return {
        personal: {
          totalPosts: myPostsInRange.length,
          totalLikes: myLikes,
          totalComments: myCommentsInRange.length,
          totalBookmarks: myBookmarks,
          engagementRate,
          bestHours,
          typeBreakdown: Object.entries(myTypeBreakdown).map(([type, count]) => ({ type: type.replace(/_/g, " "), count })),
          dailyEngagement,
          postPerformance,
          audienceBreakdown,
          contentComparison,
          networkGrowth,
          profileViews: viewsInRange.length,
          dailyViews,
        },
        platform: {
          totalPosts: allPosts.length,
          totalInteractions: allInteractions.length,
          topHashtags,
          typeBreakdown: Object.entries(platformTypeBreakdown).map(([type, count]) => ({ type: type.replace(/_/g, " "), count })),
          topPosts,
          platformDaily,
          categoryData,
        },
      };
    },
    staleTime: 120_000,
  });
}

const StatCard = ({ icon, label, value, subtitle, trend }: {
  icon: React.ReactNode; label: string; value: string | number; subtitle?: string; trend?: string;
}) => (
  <Card className="p-4 flex items-center gap-3">
    <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">{icon}</div>
    <div className="min-w-0">
      <p className="text-2xl font-heading font-bold text-card-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
      {subtitle && <p className="text-[10px] text-accent font-medium">{subtitle}</p>}
      {trend && <p className="text-[10px] text-primary font-medium flex items-center gap-0.5"><ArrowUpRight className="h-3 w-3" />{trend}</p>}
    </div>
  </Card>
);

function exportCSV(data: any, filename: string) {
  if (!data) return;
  const personal = data.personal;
  const rows = [
    ["Metric", "Value"],
    ["Total Posts", personal.totalPosts],
    ["Total Likes", personal.totalLikes],
    ["Total Comments", personal.totalComments],
    ["Total Bookmarks", personal.totalBookmarks],
    ["Engagement Rate", personal.engagementRate],
    ["Profile Views", personal.profileViews],
    [""],
    ["Date", "Likes", "Comments"],
    ...personal.dailyEngagement.map((d: any) => [d.date, d.likes, d.comments]),
    [""],
    ["Post Type", "Avg Engagement", "Posts"],
    ...personal.contentComparison.map((d: any) => [d.type, d.avgEngagement, d.posts]),
  ];
  const csvContent = rows.map((r) => (Array.isArray(r) ? r.join(",") : r)).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const DateRangeSelector = ({ value, onChange }: { value: DateRange; onChange: (v: DateRange) => void }) => (
  <Select value={value} onValueChange={(v) => onChange(v as DateRange)}>
    <SelectTrigger className="w-[130px] h-8 text-xs">
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="7">Last 7 days</SelectItem>
      <SelectItem value="14">Last 14 days</SelectItem>
      <SelectItem value="30">Last 30 days</SelectItem>
      <SelectItem value="90">Last 90 days</SelectItem>
    </SelectContent>
  </Select>
);

const PostAnalytics = () => {
  usePageMeta({ title: "Analytics" });
  const [userId, setUserId] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>("14");
  const { activeRole } = useRole();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setUserId(session.user.id);
    });
  }, []);

  const { data, isLoading } = useAnalyticsData(userId, Number(dateRange));

  const isInvestor = activeRole === "investor";

  return (
    <AppLayout maxWidth="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-heading font-bold text-foreground">
          {isInvestor ? "Platform Insights" : "Post Analytics"}
        </h1>
        <div className="flex items-center gap-2">
          <DateRangeSelector value={dateRange} onChange={setDateRange} />
          {!isInvestor && data && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1.5"
              onClick={() => exportCSV(data, `findoo-analytics-${dateRange}d`)}
            >
              <Download className="h-3.5 w-3.5" /> Export
            </Button>
          )}
        </div>
      </div>

      {isInvestor ? (
        <div className="space-y-6">
          <Card className="p-4 border-dashed border-accent/30 bg-accent/5">
            <p className="text-sm text-muted-foreground">
              As an investor, explore platform-wide trends, content categories, and top-performing posts to stay informed.
            </p>
          </Card>

          {isLoading ? (
            <FindooLoader text="Loading platform insights..." />
          ) : data ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <StatCard icon={<FileText className="h-5 w-5 text-accent" />} label="Total Posts" value={data.platform.totalPosts} />
                <StatCard icon={<TrendingUp className="h-5 w-5 text-accent" />} label="Total Interactions" value={data.platform.totalInteractions} />
              </div>

              {/* Content Category Insights */}
              <Card className="p-5">
                <h3 className="text-sm font-heading font-semibold mb-4 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" /> Content Category Insights
                </h3>
                <p className="text-[10px] text-muted-foreground mb-3">Average engagement per post type — find what the community values most</p>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={data.platform.categoryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,90%)" />
                    <XAxis dataKey="type" tick={{ fontSize: 9 }} angle={-25} textAnchor="end" height={60} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="avgEngagement" name="Avg Engagement" fill="hsl(224,60%,55%)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="posts" name="Posts" fill="hsl(152,55%,42%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              <Card className="p-5">
                <h3 className="text-sm font-heading font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-accent" /> Trending Hashtags
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={data.platform.topHashtags}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,90%)" />
                    <XAxis dataKey="tag" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" height={60} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(152,55%,42%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              <Card className="p-5">
                <h3 className="text-sm font-heading font-semibold mb-4">Platform Activity ({dateRange} Days)</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={data.platform.platformDaily}>
                    <defs>
                      <linearGradient id="postsGradInv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(224,60%,55%)" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="hsl(224,60%,55%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,90%)" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="posts" stroke="hsl(224,60%,55%)" fill="url(#postsGradInv)" strokeWidth={2} />
                    <Line type="monotone" dataKey="interactions" stroke="hsl(152,55%,42%)" strokeWidth={2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>

              <Card className="p-5">
                <h3 className="text-sm font-heading font-semibold mb-4 flex items-center gap-2">
                  <Flame className="h-4 w-4 text-destructive" /> Top Performing Posts
                </h3>
                <div className="space-y-3">
                  {data.platform.topPosts.map((post, idx) => (
                    <div key={post.id} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
                      <span className="text-lg font-heading font-bold text-muted-foreground w-6">{idx + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-card-foreground line-clamp-2">{post.content.slice(0, 120)}</p>
                        <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{post.likes}</span>
                          <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" />{post.comments}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          ) : null}
        </div>
      ) : (
      <Tabs defaultValue="personal">
        <TabsList className="mb-6 bg-secondary/50">
          <TabsTrigger value="personal" className="text-xs font-medium">My Performance</TabsTrigger>
          <TabsTrigger value="audience" className="text-xs font-medium">Audience</TabsTrigger>
          <TabsTrigger value="platform" className="text-xs font-medium">Platform Trends</TabsTrigger>
        </TabsList>

        {/* ======================== MY PERFORMANCE TAB ======================== */}
        <TabsContent value="personal">
          {isLoading ? (
            <FindooLoader text="Crunching your analytics..." />
          ) : data ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                <StatCard icon={<FileText className="h-5 w-5 text-accent" />} label="Posts" value={data.personal.totalPosts} />
                <StatCard icon={<Heart className="h-5 w-5 text-destructive" />} label="Likes" value={data.personal.totalLikes} />
                <StatCard icon={<MessageSquare className="h-5 w-5 text-accent" />} label="Comments" value={data.personal.totalComments} />
                <StatCard icon={<Bookmark className="h-5 w-5 text-muted-foreground" />} label="Bookmarks" value={data.personal.totalBookmarks} />
                <StatCard
                  icon={<BarChart3 className="h-5 w-5 text-primary" />}
                  label="Eng. Rate"
                  value={`${data.personal.engagementRate}x`}
                  subtitle={data.personal.bestHours.length > 0 ? `Best: ${data.personal.bestHours[0]}` : undefined}
                />
                <StatCard icon={<Eye className="h-5 w-5 text-intermediary" />} label="Profile Views" value={data.personal.profileViews} />
              </div>

              {/* Best posting times */}
              {data.personal.bestHours.length > 0 && (
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-accent" />
                    <h3 className="text-sm font-heading font-semibold">Best Posting Times</h3>
                  </div>
                  <div className="flex gap-2">
                    {data.personal.bestHours.map((h, i) => (
                      <Badge key={h} variant={i === 0 ? "default" : "secondary"} className="text-xs">
                        {h}
                      </Badge>
                    ))}
                  </div>
                </Card>
              )}

              {/* Content type comparison */}
              {data.personal.contentComparison.length > 0 && (
                <Card className="p-5">
                  <h3 className="text-sm font-heading font-semibold mb-1 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-primary" /> Content Type Performance
                  </h3>
                  <p className="text-[10px] text-muted-foreground mb-4">Average engagement per post type — see what resonates with your audience</p>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={data.personal.contentComparison} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,90%)" />
                      <XAxis type="number" tick={{ fontSize: 10 }} />
                      <YAxis dataKey="type" type="category" tick={{ fontSize: 10 }} width={100} />
                      <Tooltip />
                      <Bar dataKey="avgEngagement" name="Avg Engagement" fill="hsl(152,55%,42%)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              )}

              {/* Engagement trend */}
              <Card className="p-5">
                <h3 className="text-sm font-heading font-semibold mb-4">Engagement Trend ({dateRange} Days)</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={data.personal.dailyEngagement}>
                    <defs>
                      <linearGradient id="likesGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(0,72%,51%)" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="hsl(0,72%,51%)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="commentsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(152,55%,42%)" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="hsl(152,55%,42%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,90%)" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="likes" stroke="hsl(0,72%,51%)" fill="url(#likesGrad)" strokeWidth={2} />
                    <Area type="monotone" dataKey="comments" stroke="hsl(152,55%,42%)" fill="url(#commentsGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>

              {/* Profile views trend */}
              <Card className="p-5">
                <h3 className="text-sm font-heading font-semibold mb-4 flex items-center gap-2">
                  <Eye className="h-4 w-4 text-intermediary" /> Profile Views ({dateRange} Days)
                </h3>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={data.personal.dailyViews}>
                    <defs>
                      <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(262,50%,55%)" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="hsl(262,50%,55%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,90%)" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="views" stroke="hsl(262,50%,55%)" fill="url(#viewsGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>

              {/* Per-post performance */}
              {data.personal.postPerformance.length > 0 && (
                <Card className="p-5">
                  <h3 className="text-sm font-heading font-semibold mb-4 flex items-center gap-2">
                    <Flame className="h-4 w-4 text-destructive" /> Top Posts
                  </h3>
                  <div className="space-y-3">
                    {data.personal.postPerformance.map((post, idx) => (
                      <div key={post.id} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
                        <span className="text-lg font-heading font-bold text-muted-foreground w-6">{idx + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-card-foreground line-clamp-2">{post.content.slice(0, 120)}</p>
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                              <Heart className="h-3 w-3 text-destructive" />{post.likes}
                            </span>
                            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                              <MessageSquare className="h-3 w-3 text-accent" />{post.comments}
                            </span>
                            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                              <Bookmark className="h-3 w-3" />{post.bookmarks}
                            </span>
                            <Badge variant="outline" className="text-[9px] ml-auto">{post.post_type}</Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {data.personal.typeBreakdown.length > 0 && (
                <Card className="p-5">
                  <h3 className="text-sm font-heading font-semibold mb-4">Your Post Types</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={data.personal.typeBreakdown} dataKey="count" nameKey="type" cx="50%" cy="50%" outerRadius={70} label={(e) => e.type}>
                        {data.personal.typeBreakdown.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              )}
            </div>
          ) : null}
        </TabsContent>

        {/* ======================== AUDIENCE TAB ======================== */}
        <TabsContent value="audience">
          {isLoading ? (
            <FindooLoader text="Analyzing your audience..." />
          ) : data ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <StatCard icon={<Users className="h-5 w-5 text-accent" />} label="Unique Engagers" value={data.personal.audienceBreakdown.reduce((s, a) => s + a.count, 0)} />
                <StatCard icon={<Eye className="h-5 w-5 text-intermediary" />} label="Profile Views" value={data.personal.profileViews} />
                <StatCard icon={<UserPlus className="h-5 w-5 text-primary" />} label="Network Size" value={data.personal.networkGrowth.length > 0 ? data.personal.networkGrowth[data.personal.networkGrowth.length - 1].followers + data.personal.networkGrowth[data.personal.networkGrowth.length - 1].connections : 0} />
              </div>

              {/* Audience role breakdown */}
              {data.personal.audienceBreakdown.length > 0 && (
                <Card className="p-5">
                  <h3 className="text-sm font-heading font-semibold mb-1 flex items-center gap-2">
                    <Users className="h-4 w-4 text-accent" /> Who Engages With You
                  </h3>
                  <p className="text-[10px] text-muted-foreground mb-4">Role breakdown of users who like, comment, or bookmark your posts</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie data={data.personal.audienceBreakdown} dataKey="count" nameKey="role" cx="50%" cy="50%" outerRadius={70} label={(e) => `${e.role} (${e.count})`}>
                          {data.personal.audienceBreakdown.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-col justify-center gap-2">
                      {data.personal.audienceBreakdown.map((item, i) => (
                        <div key={item.role} className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                          <span className="text-xs text-card-foreground font-medium">{item.role}</span>
                          <span className="text-xs text-muted-foreground ml-auto">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              )}

              {/* Network growth */}
              <Card className="p-5">
                <h3 className="text-sm font-heading font-semibold mb-4 flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-primary" /> Network Growth ({dateRange} Days)
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={data.personal.networkGrowth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,90%)" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="followers" stroke="hsl(152,55%,42%)" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="connections" stroke="hsl(224,60%,55%)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              {/* Profile views trend */}
              <Card className="p-5">
                <h3 className="text-sm font-heading font-semibold mb-4 flex items-center gap-2">
                  <Eye className="h-4 w-4 text-intermediary" /> Profile Views Trend
                </h3>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={data.personal.dailyViews}>
                    <defs>
                      <linearGradient id="viewsGrad2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(262,50%,55%)" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="hsl(262,50%,55%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,90%)" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="views" stroke="hsl(262,50%,55%)" fill="url(#viewsGrad2)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
            </div>
          ) : null}
        </TabsContent>

        {/* ======================== PLATFORM TRENDS TAB ======================== */}
        <TabsContent value="platform">
          {isLoading ? (
            <FindooLoader text="Loading platform trends..." />
          ) : data ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-3">
                <StatCard icon={<FileText className="h-5 w-5 text-accent" />} label="Total Posts" value={data.platform.totalPosts} />
                <StatCard icon={<TrendingUp className="h-5 w-5 text-accent" />} label="Total Interactions" value={data.platform.totalInteractions} />
              </div>

              <Card className="p-5">
                <h3 className="text-sm font-heading font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-accent" /> Top Hashtags
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={data.platform.topHashtags}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,90%)" />
                    <XAxis dataKey="tag" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" height={60} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(152,55%,42%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              <Card className="p-5">
                <h3 className="text-sm font-heading font-semibold mb-4">Platform Activity ({dateRange} Days)</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={data.platform.platformDaily}>
                    <defs>
                      <linearGradient id="postsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(224,60%,55%)" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="hsl(224,60%,55%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,90%)" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="posts" stroke="hsl(224,60%,55%)" fill="url(#postsGrad)" strokeWidth={2} />
                    <Line type="monotone" dataKey="interactions" stroke="hsl(152,55%,42%)" strokeWidth={2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>

              <Card className="p-5">
                <h3 className="text-sm font-heading font-semibold mb-4 flex items-center gap-2">
                  <Flame className="h-4 w-4 text-destructive" /> Top Performing Posts
                </h3>
                <div className="space-y-3">
                  {data.platform.topPosts.map((post, idx) => (
                    <div key={post.id} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
                      <span className="text-lg font-heading font-bold text-muted-foreground w-6">{idx + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-card-foreground line-clamp-2">{post.content.slice(0, 120)}</p>
                        <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{post.likes}</span>
                          <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" />{post.comments}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {data.platform.typeBreakdown.length > 0 && (
                <Card className="p-5">
                  <h3 className="text-sm font-heading font-semibold mb-4">Content Type Distribution</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={data.platform.typeBreakdown} dataKey="count" nameKey="type" cx="50%" cy="50%" outerRadius={70} label={(e) => e.type}>
                        {data.platform.typeBreakdown.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              )}
            </div>
          ) : null}
        </TabsContent>
      </Tabs>
      )}
    </AppLayout>
  );
};

export default PostAnalytics;
