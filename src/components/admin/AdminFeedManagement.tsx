/**
 * AdminFeedManagement — Admin view for managing all feed posts.
 * Provides stats, filtering, and moderation (hide, delete, view reports).
 */
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FindooLoader } from "@/components/FindooLoader";
import { toast } from "sonner";
import {
  FileText, Search, ChevronLeft, ChevronRight, Eye, Heart,
  Trash2, MessageSquare, Clock, EyeOff, Flag, BarChart3, Hash
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const PAGE_SIZE = 15;

const kindColors: Record<string, string> = {
  insight: "bg-primary/10 text-primary border-primary/20",
  research_note: "bg-accent/10 text-accent border-accent/20",
  market_update: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  opinion: "bg-muted text-muted-foreground border-border",
  general: "bg-muted text-muted-foreground border-border",
  question: "bg-status-warning/10 text-status-warning border-status-warning/20",
};

export function AdminFeedManagement() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [kindFilter, setKindFilter] = useState("all");
  const [visibilityFilter, setVisibilityFilter] = useState("all");
  const [page, setPage] = useState(1);

  const { data: posts, isLoading } = useQuery({
    queryKey: ["admin-feed-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;

      const authorIds = [...new Set((data || []).map((p) => p.author_id))];
      const { data: profiles } = authorIds.length > 0
        ? await supabase.from("profiles").select("id, full_name, display_name, avatar_url").in("id", authorIds)
        : { data: [] };
      const profileMap = Object.fromEntries((profiles || []).map((p) => [p.id, p]));

      // Get interaction counts
      const postIds = (data || []).map((p) => p.id);
      const { data: interactions } = postIds.length > 0
        ? await supabase.from("post_interactions").select("post_id, interaction_type").in("post_id", postIds)
        : { data: [] };
      const { data: comments } = postIds.length > 0
        ? await supabase.from("comments").select("post_id").in("post_id", postIds)
        : { data: [] };
      const { data: reports } = await supabase.from("reports").select("post_id, status").not("post_id", "is", null);

      const likeCounts: Record<string, number> = {};
      const commentCounts: Record<string, number> = {};
      const reportCounts: Record<string, number> = {};

      (interactions || []).forEach((i) => {
        if (i.interaction_type === "like") {
          likeCounts[i.post_id] = (likeCounts[i.post_id] || 0) + 1;
        }
      });
      (comments || []).forEach((c) => {
        commentCounts[c.post_id] = (commentCounts[c.post_id] || 0) + 1;
      });
      (reports || []).forEach((r) => {
        if (r.post_id) {
          reportCounts[r.post_id] = (reportCounts[r.post_id] || 0) + 1;
        }
      });

      return (data || []).map((p) => ({
        ...p,
        author_profile: profileMap[p.author_id] || null,
        like_count: likeCounts[p.id] || 0,
        comment_count: commentCounts[p.id] || 0,
        report_count: reportCounts[p.id] || 0,
      }));
    },
  });

  const deletePost = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("posts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-feed-posts"] });
      toast.success("Post deleted");
    },
  });

  const filtered = useMemo(() => {
    if (!posts) return [];
    return posts.filter((p) => {
      if (kindFilter !== "all" && p.post_kind !== kindFilter) return false;
      if (visibilityFilter !== "all" && p.visibility !== visibilityFilter) return false;
      if (search) {
        const s = search.toLowerCase();
        return p.content.toLowerCase().includes(s) ||
          (p.author_profile?.full_name || "").toLowerCase().includes(s);
      }
      return true;
    });
  }, [posts, search, kindFilter, visibilityFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const stats = useMemo(() => {
    if (!posts) return { total: 0, reported: 0, polls: 0, totalLikes: 0, totalComments: 0 };
    return {
      total: posts.length,
      reported: posts.filter((p) => p.report_count > 0).length,
      polls: posts.filter((p) => p.post_type === "poll").length,
      totalLikes: posts.reduce((s, p) => s + p.like_count, 0),
      totalComments: posts.reduce((s, p) => s + p.comment_count, 0),
    };
  }, [posts]);

  if (isLoading) return <FindooLoader text="Loading posts..." />;

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Total Posts", value: stats.total, icon: FileText },
          { label: "Reported", value: stats.reported, icon: Flag, highlight: stats.reported > 0 },
          { label: "Polls", value: stats.polls, icon: BarChart3 },
          { label: "Likes", value: stats.totalLikes, icon: Heart },
          { label: "Comments", value: stats.totalComments, icon: MessageSquare },
        ].map((s) => (
          <Card key={s.label} className={`border-border/50 ${s.highlight ? "border-destructive/40" : ""}`}>
            <CardContent className="p-3 flex items-center gap-2">
              <s.icon className={`h-4 w-4 shrink-0 ${s.highlight ? "text-destructive" : "text-muted-foreground"}`} />
              <div>
                <p className="text-lg font-bold leading-none">{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search posts..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9 h-9" />
        </div>
        <Select value={kindFilter} onValueChange={(v) => { setKindFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[140px] h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Kinds</SelectItem>
            <SelectItem value="general">General</SelectItem>
            <SelectItem value="insight">Insight</SelectItem>
            <SelectItem value="research_note">Research Note</SelectItem>
            <SelectItem value="market_update">Market Update</SelectItem>
            <SelectItem value="opinion">Opinion</SelectItem>
            <SelectItem value="question">Question</SelectItem>
          </SelectContent>
        </Select>
        <Select value={visibilityFilter} onValueChange={(v) => { setVisibilityFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[130px] h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Visibility</SelectItem>
            <SelectItem value="public">Public</SelectItem>
            <SelectItem value="network">Network</SelectItem>
            <SelectItem value="connections">Connections</SelectItem>
            <SelectItem value="private">Private</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <p className="text-xs text-muted-foreground">{filtered.length} post{filtered.length !== 1 ? "s" : ""}</p>

      {/* Post list */}
      <div className="space-y-2">
        {paged.map((post) => {
          const author = post.author_profile as any;
          return (
            <Card key={post.id} className={`border-border/50 ${post.report_count > 0 ? "border-l-2 border-l-destructive" : ""}`}>
              <CardContent className="p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium truncate max-w-md">
                        {post.content.substring(0, 80)}{post.content.length > 80 ? "…" : ""}
                      </p>
                      <Badge variant="outline" className={`text-[9px] ${kindColors[post.post_kind] || ""}`}>
                        {post.post_kind.replace(/_/g, " ")}
                      </Badge>
                      {post.post_type === "poll" && (
                        <Badge variant="outline" className="text-[9px]">Poll</Badge>
                      )}
                      {post.report_count > 0 && (
                        <Badge variant="destructive" className="text-[9px] gap-0.5">
                          <Flag className="h-2.5 w-2.5" /> {post.report_count} report{post.report_count !== 1 ? "s" : ""}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{post.like_count}</span>
                      <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" />{post.comment_count}</span>
                      <span className="flex items-center gap-1"><EyeOff className="h-3 w-3" />{post.visibility}</span>
                      {post.hashtags && post.hashtags.length > 0 && (
                        <span className="flex items-center gap-1"><Hash className="h-3 w-3" />{post.hashtags.length} tags</span>
                      )}
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                    </div>
                    {author && (
                      <p className="text-[10px] text-muted-foreground mt-1">
                        By: {author.display_name || author.full_name}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive hover:text-destructive" onClick={() => deletePost.mutate(post.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {paged.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No posts found</p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}><ChevronLeft className="h-4 w-4" /></Button>
          <span className="text-xs text-muted-foreground">Page {page} of {totalPages}</span>
          <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage(page + 1)}><ChevronRight className="h-4 w-4" /></Button>
        </div>
      )}
    </div>
  );
}
