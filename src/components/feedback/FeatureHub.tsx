import { useState, useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { useFeatureRequests, type FeatureFilters, type FeatureStatus, type FeatureCategory, type FeatureSortBy, type FeatureRequest } from "@/hooks/useFeedback";
import { FeatureCard } from "./FeatureCard";
import { SubmitFeatureModal } from "./SubmitFeatureModal";
import { CommentDrawer } from "./CommentDrawer";

const STATUS_OPTIONS: { value: FeatureStatus | "all"; label: string }[] = [
  { value: "all", label: "All Statuses" },
  { value: "under_review", label: "Under Review" },
  { value: "planned", label: "Planned" },
  { value: "in_progress", label: "In Progress" },
  { value: "beta", label: "Beta" },
  { value: "released", label: "Released" },
];

const CATEGORY_OPTIONS: { value: FeatureCategory | "all"; label: string }[] = [
  { value: "all", label: "All Categories" },
  { value: "ui_ux", label: "UI/UX" },
  { value: "investment", label: "Investment" },
  { value: "insurance", label: "Insurance" },
  { value: "compliance", label: "Compliance" },
  { value: "community", label: "Community" },
  { value: "data", label: "Data" },
  { value: "jobs", label: "Jobs" },
];

const SORT_OPTIONS: { value: FeatureSortBy; label: string }[] = [
  { value: "priority", label: "Highest Priority" },
  { value: "recent", label: "Most Recent" },
  { value: "comments", label: "Most Comments" },
];

interface FeatureHubProps {
  showSubmitModal: boolean;
  onCloseSubmitModal: () => void;
}

export function FeatureHub({ showSubmitModal, onCloseSubmitModal }: FeatureHubProps) {
  const [statusFilter, setStatusFilter] = useState<FeatureStatus | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<FeatureCategory | "all">("all");
  const [sortBy, setSortBy] = useState<FeatureSortBy>("priority");
  const [commentFeature, setCommentFeature] = useState<FeatureRequest | null>(null);

  const filters: FeatureFilters = useMemo(() => ({
    status: statusFilter,
    category: categoryFilter,
    sortBy,
  }), [statusFilter, categoryFilter, sortBy]);

  const { data: features, isLoading, isError, error } = useFeatureRequests(filters);

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="flex flex-wrap gap-2">
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
          <SelectTrigger className="w-[150px] h-9 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map(opt => (
              <SelectItem key={opt.value} value={opt.value} className="text-xs">{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as any)}>
          <SelectTrigger className="w-[150px] h-9 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORY_OPTIONS.map(opt => (
              <SelectItem key={opt.value} value={opt.value} className="text-xs">{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
          <SelectTrigger className="w-[160px] h-9 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map(opt => (
              <SelectItem key={opt.value} value={opt.value} className="text-xs">{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-border bg-card p-4 space-y-3">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <div className="flex gap-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-6 w-full rounded-full" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="flex items-center gap-2 p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{(error as Error)?.message || "Failed to load features"}</span>
        </div>
      ) : !features?.length ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
            <span className="text-2xl">💡</span>
          </div>
          <h3 className="font-semibold text-foreground mb-1">No feature requests yet</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            Be the first to suggest a feature and shape findoo's future.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {features.map(feature => (
            <FeatureCard key={feature.id} feature={feature} />
          ))}
        </div>
      )}

      {/* Submit Modal */}
      <SubmitFeatureModal open={showSubmitModal} onOpenChange={onCloseSubmitModal} />
    </div>
  );
}
