import { TrendingUp } from "lucide-react";

const trendingTopics = [
  { tag: "#Nifty50", posts: 24 },
  { tag: "#SIPInvesting", posts: 18 },
  { tag: "#RBIPolicy", posts: 15 },
  { tag: "#ESGIndia", posts: 12 },
  { tag: "#NFO", posts: 9 },
];

export function TrendingSidebar() {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="font-semibold font-heading text-card-foreground text-sm mb-4 flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-accent" />
        Trending
      </h3>
      <div className="space-y-3">
        {trendingTopics.map((topic) => (
          <div key={topic.tag} className="flex items-center justify-between">
            <span className="text-sm font-medium text-accent">{topic.tag}</span>
            <span className="text-xs text-muted-foreground">{topic.posts} posts</span>
          </div>
        ))}
      </div>
    </div>
  );
}
