import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Hash, Flame, TrendingUp, Clock, X } from "lucide-react";
import { NetworkAvatar } from "@/components/ui/network-avatar";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface DiscoverSidebarProps {
  onHashtagClick: (tag: string) => void;
  onTopicClick: (topic: string) => void;
}

const POPULAR_TOPICS = [
  { label: "IPO & Listings", query: "IPO" },
  { label: "Fixed Income", query: "fixed income" },
  { label: "Mutual Funds", query: "mutual fund" },
  { label: "Regulatory Updates", query: "regulatory" },
  { label: "Market Analysis", query: "market analysis" },
  { label: "Private Equity", query: "private equity" },
];

interface TrendingTag {
  tag: string;
  count: number;
}

interface RisingProfile {
  id: string;
  full_name: string;
  display_name: string | null;
  avatar_url: string | null;
  headline: string | null;
  user_type: string;
}

const RECENT_SEARCHES_KEY = "findoo_recent_searches";

export function DiscoverSidebar({ onHashtagClick, onTopicClick }: DiscoverSidebarProps) {
  const [trendingTags, setTrendingTags] = useState<TrendingTag[]>([]);
  const [risingProfiles, setRisingProfiles] = useState<RisingProfile[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    loadTrendingTags();
    loadRisingProfiles();
    loadRecentSearches();
  }, []);

  const loadTrendingTags = async () => {
    const { data } = await supabase
      .from("posts")
      .select("hashtags")
      .not("hashtags", "is", null)
      .order("created_at", { ascending: false })
      .limit(100);

    const tagCount = new Map<string, number>();
    data?.forEach((post) => {
      post.hashtags?.forEach((tag: string) => {
        const normalized = tag.toLowerCase().replace(/^#/, "");
        tagCount.set(normalized, (tagCount.get(normalized) || 0) + 1);
      });
    });

    const sorted = Array.from(tagCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([tag, count]) => ({ tag, count }));

    setTrendingTags(sorted);
  };

  const loadRisingProfiles = async () => {
    // Get users who posted recently
    const { data: recentPosts } = await supabase
      .from("posts")
      .select("author_id")
      .order("created_at", { ascending: false })
      .limit(50);

    const authorIds = [...new Set(recentPosts?.map((p) => p.author_id) || [])].slice(0, 5);

    if (authorIds.length === 0) return;

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, display_name, avatar_url, headline, user_type")
      .in("id", authorIds);

    setRisingProfiles(profiles || []);
  };

  const loadRecentSearches = () => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) setRecentSearches(JSON.parse(stored));
    } catch {}
  };

  const clearRecentSearches = () => {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
    setRecentSearches([]);
  };

  const removeRecentSearch = (query: string) => {
    const updated = recentSearches.filter((s) => s !== query);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    setRecentSearches(updated);
  };

  const roleColors: Record<string, string> = {
    individual: "bg-investor/10 text-investor",
    entity: "bg-issuer/10 text-issuer",
  };

  const getInitials = (name: string) =>
    name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="space-y-4">
      {/* Trending Hashtags */}
      {trendingTags.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-card-foreground mb-3 flex items-center gap-2">
            <Flame className="h-4 w-4 text-primary" />
            Trending Hashtags
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {trendingTags.map((t) => (
              <button
                key={t.tag}
                onClick={() => onHashtagClick(t.tag)}
                className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-primary/5 text-primary hover:bg-primary/10 transition-colors"
              >
                <Hash className="h-3 w-3" />
                {t.tag}
                <span className="text-[10px] text-muted-foreground ml-0.5">{t.count}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Popular Topics */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="text-sm font-semibold text-card-foreground mb-3 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          Popular Topics
        </h3>
        <div className="space-y-1.5">
          {POPULAR_TOPICS.map((topic) => (
            <button
              key={topic.query}
              onClick={() => onTopicClick(topic.query)}
              className="w-full text-left text-xs font-medium px-3 py-2 rounded-lg text-card-foreground hover:bg-primary/5 hover:text-primary transition-colors"
            >
              {topic.label}
            </button>
          ))}
        </div>
      </div>

      {/* Rising Profiles */}
      {risingProfiles.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="text-sm font-semibold text-card-foreground mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Rising Profiles
          </h3>
          <div className="space-y-3">
            {risingProfiles.map((user) => (
              <Link
                key={user.id}
                to={`/profile/${user.id}`}
                className="flex items-center gap-2.5 group"
              >
                <NetworkAvatar src={user.avatar_url} initials={getInitials(user.full_name)} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-card-foreground truncate group-hover:text-primary transition-colors">
                    {user.display_name || user.full_name}
                  </p>
                  {user.headline && (
                    <p className="text-[10px] text-muted-foreground truncate">{user.headline}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recent Searches */}
      {recentSearches.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-card-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Recent Searches
            </h3>
            <button
              onClick={clearRecentSearches}
              className="text-[10px] text-muted-foreground hover:text-primary transition-colors"
            >
              Clear all
            </button>
          </div>
          <div className="space-y-1">
            {recentSearches.slice(0, 6).map((query) => (
              <div key={query} className="flex items-center gap-2 group">
                <button
                  onClick={() => onTopicClick(query)}
                  className="flex-1 text-left text-xs text-muted-foreground hover:text-primary truncate px-2 py-1.5 rounded-md hover:bg-primary/5 transition-colors"
                >
                  {query}
                </button>
                <button
                  onClick={() => removeRecentSearch(query)}
                  className="opacity-0 group-hover:opacity-100 p-0.5 text-muted-foreground hover:text-destructive transition-all"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper to save a search to recent searches
export function saveRecentSearch(query: string) {
  if (!query.trim()) return;
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    const searches: string[] = stored ? JSON.parse(stored) : [];
    const updated = [query, ...searches.filter((s) => s !== query)].slice(0, 10);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch {}
}
