import { Skeleton } from "@/components/ui/skeleton";

export function NotificationSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-4 flex items-start gap-3 animate-pulse">
      <Skeleton className="h-10 w-10 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/3" />
      </div>
      <Skeleton className="h-2.5 w-2.5 rounded-full shrink-0 mt-1.5" />
    </div>
  );
}

export function NotificationSkeletonGroup() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-3 w-16 mb-2" />
      <div className="space-y-1.5">
        {[1, 2, 3].map((i) => (
          <NotificationSkeleton key={i} />
        ))}
      </div>
      <Skeleton className="h-3 w-20 mb-2 mt-4" />
      <div className="space-y-1.5">
        {[4, 5].map((i) => (
          <NotificationSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
