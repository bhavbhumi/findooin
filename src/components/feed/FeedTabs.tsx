import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Clock } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export type FeedFilter = "affinity" | "recent";

interface FeedTabsProps {
  value: FeedFilter;
  onChange: (v: FeedFilter) => void;
}

export function FeedTabs({ value, onChange }: FeedTabsProps) {
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as FeedFilter)} className="mb-4">
      <TabsList className="w-full grid grid-cols-2 bg-secondary/50 h-9">
        <TabsTrigger value="affinity" className="text-xs font-medium gap-1 data-[state=active]:bg-card data-[state=active]:shadow-sm">
          <Sparkles className="h-3 w-3" />
          AffinityFeed™
        </TabsTrigger>
        <TabsTrigger value="recent" className="text-xs font-medium gap-1 data-[state=active]:bg-card data-[state=active]:shadow-sm">
          <Clock className="h-3 w-3" />
          Recent
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
