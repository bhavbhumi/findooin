import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingSidebar } from "@/components/feed/TrendingSidebar";
import { DraftsPanel } from "@/components/feed/DraftsPanel";
import { ScheduledPostsManager } from "@/components/feed/ScheduledPostsManager";
import { PostDraft } from "@/hooks/useDrafts";
import { TrendingUp, FileEdit, Clock } from "lucide-react";

interface FeedSidebarProps {
  userId: string | null;
  onLoadDraft: (draft: PostDraft) => void;
}

export function FeedSidebar({ userId, onLoadDraft }: FeedSidebarProps) {
  const [tab, setTab] = useState("trending");

  return (
    <div className="space-y-0">
      <Tabs value={tab} onValueChange={setTab}>
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
          <TrendingSidebar />
        </TabsContent>
        <TabsContent value="drafts" className="mt-0">
          <DraftsPanel userId={userId} onLoadDraft={onLoadDraft} />
        </TabsContent>
        <TabsContent value="scheduled" className="mt-0">
          <ScheduledPostsManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
