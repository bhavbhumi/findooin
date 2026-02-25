import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type FeedFilter = "foryou" | "trending" | "viral";

interface FeedTabsProps {
  value: FeedFilter;
  onChange: (v: FeedFilter) => void;
}

export function FeedTabs({ value, onChange }: FeedTabsProps) {
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as FeedFilter)} className="mb-4">
      <TabsList className="w-full grid grid-cols-3 bg-secondary/50 h-9">
        <TabsTrigger value="foryou" className="text-xs font-medium data-[state=active]:bg-card data-[state=active]:shadow-sm">
          For You
        </TabsTrigger>
        <TabsTrigger value="trending" className="text-xs font-medium data-[state=active]:bg-card data-[state=active]:shadow-sm">
          Trending
        </TabsTrigger>
        <TabsTrigger value="viral" className="text-xs font-medium data-[state=active]:bg-card data-[state=active]:shadow-sm">
          Viral
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
