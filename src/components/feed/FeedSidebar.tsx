import { useState, memo, lazy, Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingSidebar } from "@/components/feed/TrendingSidebar";
import { PostDraft } from "@/hooks/useDrafts";
import { TrendingUp, FileEdit, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { WeeklyChallenges } from "@/components/gamification/WeeklyChallenges";
import { ReferralCard } from "@/components/gamification/ReferralCard";
import { OpinionsSidebarWidget } from "@/components/opinions/OpinionsSidebarWidget";
import { WeeklyChallenges } from "@/components/gamification/WeeklyChallenges";
import { ReferralCard } from "@/components/gamification/ReferralCard";

// Lazy load non-default tabs
const DraftsPanel = lazy(() =>
  import("@/components/feed/DraftsPanel").then((m) => ({ default: m.DraftsPanel }))
);
const ScheduledPostsManager = lazy(() =>
  import("@/components/feed/ScheduledPostsManager").then((m) => ({ default: m.ScheduledPostsManager }))
);

const MemoizedTrendingSidebar = memo(TrendingSidebar);

function SidebarFallback() {
  return (
    <div className="space-y-3 p-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-1.5">
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3 w-20" />
        </div>
      ))}
    </div>
  );
}

interface FeedSidebarProps {
  userId: string | null;
  onLoadDraft: (draft: PostDraft) => void;
  initialTab?: string;
}

export const FeedSidebar = memo(function FeedSidebar({ userId, onLoadDraft, initialTab }: FeedSidebarProps) {
  const [tab, setTab] = useState(initialTab || "trending");
  // Track which tabs have been visited to keep them mounted after first visit
  const [visited, setVisited] = useState<Set<string>>(new Set([initialTab || "trending"]));

  const handleTabChange = (value: string) => {
    setTab(value);
    setVisited((prev) => new Set(prev).add(value));
  };

  return (
    <div className="space-y-0">
      <Tabs value={tab} onValueChange={handleTabChange}>
        <TabsList className="w-full grid grid-cols-3 h-9 mb-3">
          <TabsTrigger value="trending" className="text-xs gap-1">
            <TrendingUp className="h-3.5 w-3.5" />
            <span className="hidden xl:inline">Trending</span>
          </TabsTrigger>
          <TabsTrigger value="drafts" className="text-xs gap-1">
            <FileEdit className="h-3.5 w-3.5" />
            <span className="hidden xl:inline">Drafts</span>
          </TabsTrigger>
          <TabsTrigger value="scheduled" className="text-xs gap-1">
            <Clock className="h-3.5 w-3.5" />
            <span className="hidden xl:inline">Scheduled</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trending" className="mt-0">
          <MemoizedTrendingSidebar />
        </TabsContent>

        <TabsContent value="drafts" className="mt-0">
          {visited.has("drafts") && (
            <Suspense fallback={<SidebarFallback />}>
              <DraftsPanel userId={userId} onLoadDraft={onLoadDraft} />
            </Suspense>
          )}
        </TabsContent>

        <TabsContent value="scheduled" className="mt-0">
          {visited.has("scheduled") && (
            <Suspense fallback={<SidebarFallback />}>
              <ScheduledPostsManager />
            </Suspense>
          )}
        </TabsContent>
      </Tabs>

      {/* Gamification widgets below tabs */}
      {userId && (
        <div className="space-y-3 mt-4">
          <WeeklyChallenges userId={userId} />
          <ReferralCard userId={userId} />
        </div>
      )}
    </div>
  );
});
