import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import AppNavbar from "@/components/AppNavbar";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from "recharts";
import { TrendingUp, Flame, Heart, MessageSquare, Repeat2, Eye, FileText } from "lucide-react";

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

      // --- Personal analytics ---
      const myPostIds = new Set(myPosts.map((p) => p.id));
      const myInteractions = allInteractions.filter((i) => myPostIds.has(i.post_id));
      const myCommentsCount = allComments.filter((c) => myPostIds.has(c.post_id)).length;
      const myLikes = myInteractions.filter((i) => i.interaction_type === "like").length;
      const myReposts = myInteractions.filter((i) => i.interaction_type === "repost").length;
      const myBookmarks = myInteractions.filter((i) => i.interaction_type === "bookmark").length;

      // Post type breakdown for my posts
      const myTypeBreakdown: Record<string, number> = {};
      myPosts.forEach((p) => {
        myTypeBreakdown[p.post_type] = (myTypeBreakdown[p.post_type] || 0) + 1;
      });

      // Daily engagement for my posts (last 14 days)
      const dailyEngagement: { date: string; likes: number; comments: number; reposts: number }[] = [];
      for (let i = 13; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().slice(0, 10);
        const dayInteractions = myInteractions.filter((x) => x.created_at.slice(0, 10) === dateStr);
        const dayComments = allComments.filter((c) => myPostIds.has(c.post_id) && c.created_at.slice(0, 10) === dateStr);
        dailyEngagement.push({
          date: dateStr.slice(5),
          likes: dayInteractions.filter((x) => x.interaction_type === "like").length,
          comments: dayComments.length,
          reposts: dayInteractions.filter((x) => x.interaction_type === "repost").length,
        });
      }

      // --- Platform analytics ---
      // Top hashtags
      const hashtagFreq = new Map<string, number>();
      allPosts.forEach((p) => {
        (p.hashtags as string[] | null)?.forEach((t) => {
          const n = t.startsWith("#") ? t.toLowerCase() : `#${t.toLowerCase()}`;
          hashtagFreq.set(n, (hashtagFreq.get(n) || 0) + 1);
        });
      });
      const topHashtags = [...hashtagFreq.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([tag, count]) => ({ tag, count }));

      // Post type distribution (platform)
      const platformTypeBreakdown: Record<string, number> = {};
      allPosts.forEach((p) => {
        platformTypeBreakdown[p.post_type] = (platformTypeBreakdown[p.post_type] || 0) + 1;
      });

      // Top posts by engagement
      const postEngagement = allPosts.map((p) => {
        const likes = allInteractions.filter((i) => i.post_id === p.id && i.interaction_type === "like").length;
        const reposts = allInteractions.filter((i) => i.post_id === p.id && i.interaction_type === "repost").length;
        const comments = allComments.filter((c) => c.post_id === p.id).length;
        return { ...p, likes, reposts, comments, total: likes + comments * 2 + reposts * 3 };
      });
      const topPosts = postEngagement.sort((a, b) => b.total - a.total).slice(0, 5);

      // Daily activity (platform, last 14 days)
      const platformDaily: { date: string; posts: number; interactions: number }[] = [];
      for (let i = 13; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
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
          totalReposts: myReposts,
          totalBookmarks: myBookmarks,
          typeBreakdown: Object.entries(myTypeBreakdown).map(([type, count]) => ({ type, count })),
          dailyEngagement,
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

const statCard = (icon: React.ReactNode, label: string, value: number) => (
  <Card className="p-4 flex items-center gap-3">
    <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">{icon}</div>
    <div>
      <p className="text-2xl font-heading font-bold text-card-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  </Card>
);

const PostAnalytics = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { navigate("/auth"); return; }
      setUserId(session.user.id);
    });
  }, [navigate]);

  const { data, isLoading } = useAnalyticsData(userId);

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <AppNavbar />
      <div className="container py-6 max-w-5xl mx-auto">
        <h1 className="text-xl font-heading font-bold text-foreground mb-6">Post Analytics</h1>

        <Tabs defaultValue="personal">
          <TabsList className="mb-6 bg-secondary/50">
            <TabsTrigger value="personal" className="text-xs font-medium">My Performance</TabsTrigger>
            <TabsTrigger value="platform" className="text-xs font-medium">Platform Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="personal">
            {isLoading ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[1,2,3,4].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}
                </div>
                <Skeleton className="h-64 rounded-xl" />
              </div>
            ) : data ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {statCard(<FileText className="h-5 w-5 text-accent" />, "Posts", data.personal.totalPosts)}
                  {statCard(<Heart className="h-5 w-5 text-destructive" />, "Likes", data.personal.totalLikes)}
                  {statCard(<MessageSquare className="h-5 w-5 text-accent" />, "Comments", data.personal.totalComments)}
                  {statCard(<Repeat2 className="h-5 w-5 text-green-600" />, "Reposts", data.personal.totalReposts)}
                  {statCard(<Eye className="h-5 w-5 text-muted-foreground" />, "Bookmarks", data.personal.totalBookmarks)}
                </div>

                <Card className="p-5">
                  <h3 className="text-sm font-heading font-semibold mb-4">Engagement (Last 14 Days)</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={data.personal.dailyEngagement}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,90%)" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="likes" stroke="hsl(0,72%,51%)" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="comments" stroke="hsl(152,55%,42%)" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="reposts" stroke="hsl(224,60%,55%)" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>

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
              <div className="space-y-4">
                <Skeleton className="h-64 rounded-xl" />
                <Skeleton className="h-64 rounded-xl" />
              </div>
            ) : data ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-3">
                  {statCard(<FileText className="h-5 w-5 text-accent" />, "Total Posts", data.platform.totalPosts)}
                  {statCard(<TrendingUp className="h-5 w-5 text-accent" />, "Total Interactions", data.platform.totalInteractions)}
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
                    <LineChart data={data.platform.platformDaily}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,90%)" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="posts" stroke="hsl(224,60%,55%)" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="interactions" stroke="hsl(152,55%,42%)" strokeWidth={2} dot={false} />
                    </LineChart>
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
                            <span className="flex items-center gap-1"><Repeat2 className="h-3 w-3" />{post.reposts}</span>
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
      </div>
    </div>
  );
};

export default PostAnalytics;
