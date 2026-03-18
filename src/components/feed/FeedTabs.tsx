import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Clock, BarChart3 } from "lucide-react";

export type FeedFilter = "affinity" | "recent" | "opinions";

interface FeedTabsProps {
  value: FeedFilter;
  onChange: (v: FeedFilter) => void;
}

export function FeedTabs({ value, onChange }: FeedTabsProps) {
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as FeedFilter)} className="mb-4">
      <TabsList className="w-full grid grid-cols-3 bg-secondary/50 h-9">
        <TabsTrigger value="affinity" className="text-xs font-medium gap-1 data-[state=active]:bg-card data-[state=active]:shadow-sm">
          <Sparkles className="h-3 w-3" />
          AffinityFeed™
        </TabsTrigger>
        <TabsTrigger value="recent" className="text-xs font-medium gap-1 data-[state=active]:bg-card data-[state=active]:shadow-sm">
          <Clock className="h-3 w-3" />
          Recent
        </TabsTrigger>
        <TabsTrigger value="opinions" className="text-xs font-medium gap-1 data-[state=active]:bg-card data-[state=active]:shadow-sm">
          <BarChart3 className="h-3 w-3" />
          Opinions
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
