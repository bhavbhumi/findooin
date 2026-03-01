import { Skeleton } from "@/components/ui/skeleton";

export function VaultFileSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3 animate-pulse">
      <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <div className="flex gap-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-12" />
        </div>
      </div>
      <div className="flex gap-1.5 shrink-0">
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
    </div>
  );
}

export function VaultSkeletonGroup() {
  return (
    <div className="grid grid-cols-1 gap-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <VaultFileSkeleton key={i} />
      ))}
    </div>
  );
}
