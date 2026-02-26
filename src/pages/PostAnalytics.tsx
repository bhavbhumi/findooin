import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useRole } from "@/contexts/RoleContext";
import { useQuery } from "@tanstack/react-query";
import AppLayout from "@/components/AppLayout";
import { FindooLoader } from "@/components/FindooLoader";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area,
} from "recharts";
import { TrendingUp, Flame, Heart, MessageSquare, Eye, FileText, Clock, BarChart3, Bookmark } from "lucide-react";
import { format, parseISO } from "date-fns";

const COLORS = ["hsl(152,55%,42%)", "hsl(224,60%,55%)", "hsl(262,50%,55%)", "hsl(0,72%,51%)", "hsl(40,80%,55%)"];

function useAnalyticsData(userId: string | null) {
  return useQuery({
    queryKey: ["post-analytics", userId],
    enabled: !!userId,
    queryFn: async () => {
      const [postsRes, interactionsRes, commentsRes] = await Promise.all([
        supabase.from("posts").select("*").order("created_at", { ascending: false }),
        supabase.from("post_interactions").select("*"),
        supabase.from("comments").select("*"),
      ]);

      const allPosts = postsRes.data || [];
      const allInteractions = interactionsRes.data || [];
      const allComments = commentsRes.data || [];

      const myPosts = allPosts.filter((p) => p.author_id === userId);
      const myPostIds = new Set(myPosts.map((p) => p.id));
      const myInteractions = allInteractions.filter((i) => myPostIds.has(i.post_id));
      const myCommentsCount = allComments.filter((c) => myPostIds.has(c.post_id)).length;
      const myLikes = myInteractions.filter((i) => i.interaction_type === "like").length;
      const myBookmarks = myInteractions.filter((i) => i.interaction_type === "bookmark").length;

      // Post type breakdown
      const myTypeBreakdown: Record<string, number> = {};
      myPosts.forEach((p) => { myTypeBreakdown[p.post_type] = (myTypeBreakdown[p.post_type] || 0) + 1; });

      // Daily engagement (last 14 days)
      const dailyEngagement: { date: string; likes: number; comments: number; total: number }[] = [];
      for (let i = 13; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().slice(0, 10);
        const dayLikes = myInteractions.filter((x) => x.created_at.slice(0, 10) === dateStr && x.interaction_type === "like").length;
        const dayComments = allComments.filter((c) => myPostIds.has(c.post_id) && c.created_at.slice(0, 10) === dateStr).length;
        dailyEngagement.push({ date: dateStr.slice(5), likes: dayLikes, comments: dayComments, total: dayLikes + dayComments });
      }

      // Engagement rate (likes+comments / posts)
      const engagementRate = myPosts.length > 0 ? ((myLikes + myCommentsCount) / myPosts.length).toFixed(1) : "0";

      // Best posting times (hour distribution)
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
      const postPerformance = myPosts.slice(0, 10).map((p) => {
        const likes = allInteractions.filter((i) => i.post_id === p.id && i.interaction_type === "like").length;
        const comments = allComments.filter((c) => c.post_id === p.id).length;
        const bookmarks = allInteractions.filter((i) => i.post_id === p.id && i.interaction_type === "bookmark").length;
        return { ...p, likes, comments, bookmarks, engagement: likes + comments * 2 + bookmarks };
      }).sort((a, b) => b.engagement - a.engagement);

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
      for (let i = 13; i >= 0; i--) {
        const d = new Date(); d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().slice(0, 10);
        platformDaily.push({
          date: dateStr.slice(5),
          posts: allPosts.filter((p) => p.created_at.slice(0, 10) === dateStr).length,
          interactions: allInteractions.filter((x) => x.created_at.slice(0, 10) === dateStr).length,
        });
      }

      return {
        personal: {
          totalPosts: myPosts.length,
          totalLikes: myLikes,
          totalComments: myCommentsCount,
          totalBookmarks: myBookmarks,
          engagementRate,
          bestHours,
          typeBreakdown: Object.entries(myTypeBreakdown).map(([type, count]) => ({ type, count })),
          dailyEngagement,
          postPerformance,
        },
        platform: {
          totalPosts: allPosts.length,
          totalInteractions: allInteractions.length,
          topHashtags,
          typeBreakdown: Object.entries(platformTypeBreakdown).map(([type, count]) => ({ type, count })),
          topPosts,
          platformDaily,
        },
      };
    },
    staleTime: 120_000,
  });
}

const StatCard = ({ icon, label, value, subtitle }: { icon: React.ReactNode; label: string; value: string | number; subtitle?: string }) => (
  <Card className="p-4 flex items-center gap-3">
    <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">{icon}</div>
    <div>
      <p className="text-2xl font-heading font-bold text-card-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
      {subtitle && <p className="text-[10px] text-accent font-medium">{subtitle}</p>}
    </div>
  </Card>
);

const PostAnalytics = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const { activeRole } = useRole();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setUserId(session.user.id);
    });
  }, []);

  const { data, isLoading } = useAnalyticsData(userId);

  const isInvestor = activeRole === "investor";

  return (
    <AppLayout maxWidth="max-w-5xl">
      <h1 className="text-xl font-heading font-bold text-foreground mb-6">
        {isInvestor ? "Platform Insights" : "Post Analytics"}
      </h1>

      {isInvestor ? (
        /* Investors see platform trends only — personal performance is not relevant */
        <div className="space-y-6">
          <Card className="p-4 border-dashed border-accent/30 bg-accent/5">
            <p className="text-sm text-muted-foreground">
              As an investor, explore platform-wide trends and top-performing content to stay informed.
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
          <TabsTrigger value="platform" className="text-xs font-medium">Platform Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          {isLoading ? (
            <FindooLoader text="Crunching your analytics..." />
          ) : data ? (
            <div className="space-y-6">
              {/* Stats row */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
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

              {/* Engagement trend */}
              <Card className="p-5">
                <h3 className="text-sm font-heading font-semibold mb-4">Engagement Trend (14 Days)</h3>
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

              {/* Per-post performance */}
              {data.personal.postPerformance.length > 0 && (
                <Card className="p-5">
                  <h3 className="text-sm font-heading font-semibold mb-4 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    Post Performance
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
                <h3 className="text-sm font-heading font-semibold mb-4">Platform Activity (14 Days)</h3>
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
