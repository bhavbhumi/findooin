import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Eye, TrendingUp, Users, BarChart3, Search } from "lucide-react";
import { format, subDays } from "date-fns";

export function ProfileAnalyticsSection({ profileId }: { profileId: string }) {
  const { data: analytics } = useQuery({
    queryKey: ["profile-analytics", profileId],
    queryFn: async () => {
      const thirtyDaysAgo = subDays(new Date(), 30).toISOString();
      const sevenDaysAgo = subDays(new Date(), 7).toISOString();

      const [viewsTotal, viewsRecent, viewsWeek, postsCount, connectionsCount, followersCount] = await Promise.all([
        supabase.from("profile_views").select("id", { count: "exact", head: true }).eq("profile_id", profileId),
        supabase.from("profile_views").select("id, created_at").eq("profile_id", profileId).gte("created_at", thirtyDaysAgo).order("created_at", { ascending: true }),
        supabase.from("profile_views").select("id", { count: "exact", head: true }).eq("profile_id", profileId).gte("created_at", sevenDaysAgo),
        supabase.from("posts").select("id", { count: "exact", head: true }).eq("author_id", profileId),
        supabase.from("connections").select("id", { count: "exact", head: true }).or(`from_user_id.eq.${profileId},to_user_id.eq.${profileId}`).eq("connection_type", "connect").eq("status", "accepted"),
        supabase.from("connections").select("id", { count: "exact", head: true }).eq("to_user_id", profileId).eq("connection_type", "follow"),
      ]);

      // Build daily view data for sparkline
      const dailyViews = new Map<string, number>();
      (viewsRecent.data || []).forEach((v: any) => {
        const day = format(new Date(v.created_at), "MMM dd");
        dailyViews.set(day, (dailyViews.get(day) || 0) + 1);
      });

      return {
        totalViews: viewsTotal.count || 0,
        weekViews: viewsWeek.count || 0,
        posts: postsCount.count || 0,
        connections: connectionsCount.count || 0,
        followers: followersCount.count || 0,
        dailyViews: Array.from(dailyViews.entries()).slice(-14).map(([date, count]) => ({ date, count })),
      };
    },
    staleTime: 120_000,
  });

  if (!analytics) return null;

  const stats = [
    { icon: Eye, label: "Profile Views", value: analytics.totalViews, sub: `${analytics.weekViews} this week` },
    { icon: Users, label: "Connections", value: analytics.connections, sub: "" },
    { icon: TrendingUp, label: "Followers", value: analytics.followers, sub: "" },
    { icon: BarChart3, label: "Posts Published", value: analytics.posts, sub: "" },
  ];

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold font-heading text-card-foreground">Profile Analytics</h3>
        <span className="text-[10px] text-muted-foreground ml-auto">Last 30 days</span>
      </div>
      <div className="p-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.map((s) => (
            <div key={s.label} className="bg-muted/30 rounded-lg p-3 text-center">
              <s.icon className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
              <p className="text-lg font-bold font-heading text-card-foreground">{s.value}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
              {s.sub && <p className="text-[10px] text-primary font-medium mt-0.5">{s.sub}</p>}
            </div>
          ))}
        </div>

        {/* Mini sparkline using CSS bars */}
        {analytics.dailyViews.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs font-medium text-muted-foreground mb-2">Daily Profile Views</p>
            <div className="flex items-end gap-1 h-12">
              {analytics.dailyViews.map((d) => {
                const max = Math.max(...analytics.dailyViews.map((v) => v.count), 1);
                const height = Math.max((d.count / max) * 100, 8);
                return (
                  <div key={d.date} className="flex-1 group relative">
                    <div
                      className="bg-primary/60 rounded-t-sm hover:bg-primary transition-colors w-full"
                      style={{ height: `${height}%` }}
                      title={`${d.date}: ${d.count} views`}
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[9px] text-muted-foreground">{analytics.dailyViews[0]?.date}</span>
              <span className="text-[9px] text-muted-foreground">{analytics.dailyViews[analytics.dailyViews.length - 1]?.date}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
