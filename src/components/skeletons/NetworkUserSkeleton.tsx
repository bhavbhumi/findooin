import { Skeleton } from "@/components/ui/skeleton";

export function NetworkUserSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
      <Skeleton className="h-10 w-10 rounded-full shrink-0" />
      <div className="flex-1 min-w-0 space-y-1.5">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-48" />
      </div>
      <Skeleton className="h-8 w-16 rounded shrink-0" />
    </div>
  );
}
