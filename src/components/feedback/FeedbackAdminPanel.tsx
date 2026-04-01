import { useState } from "react";
import { useFeatureRequests, type FeatureRequest, type FeatureStatus } from "@/hooks/useFeedback";
import { useAdminUpdateStatus, useAdminReject, useAdminPin, useAdminMerge, useCreateChangelog, useSeedModules, useEditFeatureDescription } from "@/hooks/useFeedbackAdmin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  AlertCircle, Pin, PinOff, Merge, Ban, ArrowUp, MessageSquare,
  Search, ChevronRight, Clock, Calendar, Plus, X, FileText,
  Sprout, Pencil, Star,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

const ALL_STATUSES: { value: FeatureStatus; label: string }[] = [
  { value: "under_review", label: "Under Review" },
  { value: "planned", label: "Planned" },
  { value: "in_progress", label: "In Progress" },
  { value: "beta", label: "Beta" },
  { value: "released", label: "Released" },
];

const STATUS_COLORS: Record<string, string> = {
  under_review: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
  planned: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30",
  in_progress: "bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30",
  beta: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
  released: "bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30",
  rejected: "bg-destructive/15 text-destructive border-destructive/30",
};

// ─── Admin Row ───
function AdminFeatureRow({
  feature,
  onStatusChange,
  onReject,
  onTogglePin,
  onMerge,
  onEdit,
}: {
  feature: FeatureRequest;
  onStatusChange: (f: FeatureRequest) => void;
  onReject: (f: FeatureRequest) => void;
  onTogglePin: (f: FeatureRequest) => void;
  onMerge: (f: FeatureRequest) => void;
  onEdit: (f: FeatureRequest) => void;
}) {
  const totalVotes = feature.inv_votes + feature.int_votes + feature.iss_votes + feature.enb_votes;

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            {feature.pinned && (
              <Pin className="h-3 w-3 text-primary shrink-0" />
            )}
            {feature.is_seeded && (
              <Sprout className="h-3 w-3 text-muted-foreground shrink-0" />
            )}
            <p className="text-sm font-medium text-foreground leading-snug truncate">{feature.title}</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
            <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 border", STATUS_COLORS[feature.status] || "")}>
              {feature.status.replace("_", " ")}
            </Badge>
            {feature.is_regulatory && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-destructive/40 text-destructive">SEBI</Badge>
            )}
            <span className="flex items-center gap-0.5"><ArrowUp className="h-3 w-3" />{totalVotes}</span>
            <span className="flex items-center gap-0.5"><MessageSquare className="h-3 w-3" />{feature.comment_count}</span>
            <span>Score: {feature.priority_score?.toFixed(1) ?? "—"}</span>
            {feature.expected_quarter && (
              <span className="flex items-center gap-0.5"><Calendar className="h-3 w-3" />{feature.expected_quarter}</span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            title="Edit"
            onClick={() => onEdit(feature)}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            title={feature.pinned ? "Unpin" : "Pin"}
            onClick={() => onTogglePin(feature)}
          >
            {feature.pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            title="Change status"
            onClick={() => onStatusChange(feature)}
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            title="Merge"
            onClick={() => onMerge(feature)}
          >
            <Merge className="h-3.5 w-3.5" />
          </Button>
          {feature.status !== "rejected" && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:text-destructive"
              title="Reject"
              onClick={() => onReject(feature)}
            >
              <Ban className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Status Change Dialog ───
function StatusChangeDialog({
  feature,
  open,
  onOpenChange,
}: {
  feature: FeatureRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [newStatus, setNewStatus] = useState<FeatureStatus>("planned");
  const [notes, setNotes] = useState("");
  const [quarter, setQuarter] = useState("");
  const [rationale, setRationale] = useState("");
  const updateStatus = useAdminUpdateStatus();

  const handleSubmit = () => {
    if (!feature) return;
    updateStatus.mutate(
      { featureId: feature.id, newStatus, notes, expectedQuarter: quarter, roadmapRationale: rationale },
      { onSuccess: () => { onOpenChange(false); setNotes(""); setQuarter(""); setRationale(""); } }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">Update Status</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground truncate">{feature?.title}</p>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-foreground mb-1 block">New Status</label>
            <Select value={newStatus} onValueChange={(v) => setNewStatus(v as FeatureStatus)}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ALL_STATUSES.map(s => (
                  <SelectItem key={s.value} value={s.value} className="text-xs">{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs font-medium text-foreground mb-1 block">Expected Quarter (optional)</label>
            <Input
              placeholder="e.g. Q3 2026"
              value={quarter}
              onChange={e => setQuarter(e.target.value)}
              className="h-9 text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-foreground mb-1 block">Roadmap Rationale (optional)</label>
            <Textarea
              placeholder="Why this is being prioritized..."
              value={rationale}
              onChange={e => setRationale(e.target.value)}
              className="text-xs min-h-[60px]"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-foreground mb-1 block">Internal Notes (optional)</label>
            <Textarea
              placeholder="Notes for the status change..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="text-xs min-h-[60px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button size="sm" onClick={handleSubmit} disabled={updateStatus.isPending}>
            {updateStatus.isPending ? "Updating..." : "Update Status"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Reject Dialog ───
function RejectDialog({
  feature,
  open,
  onOpenChange,
}: {
  feature: FeatureRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [reason, setReason] = useState("");
  const reject = useAdminReject();

  const handleSubmit = () => {
    if (!feature) return;
    reject.mutate(
      { featureId: feature.id, reason },
      { onSuccess: () => { onOpenChange(false); setReason(""); } }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base text-destructive">Reject Feature</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground truncate">{feature?.title}</p>
        <div>
          <label className="text-xs font-medium text-foreground mb-1 block">Reason (required — visible to submitter)</label>
          <Textarea
            placeholder="Explain why this request is being rejected..."
            value={reason}
            onChange={e => setReason(e.target.value)}
            className="text-xs min-h-[80px]"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="destructive" size="sm" onClick={handleSubmit} disabled={!reason.trim() || reject.isPending}>
            {reject.isPending ? "Rejecting..." : "Reject"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Merge Dialog ───
function MergeDialog({
  feature,
  open,
  onOpenChange,
  allFeatures,
}: {
  feature: FeatureRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allFeatures: FeatureRequest[];
}) {
  const [targetId, setTargetId] = useState("");
  const [search, setSearch] = useState("");
  const merge = useAdminMerge();

  const candidates = allFeatures.filter(
    f => f.id !== feature?.id && !f.merged_into_id && f.title.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 8);

  const handleSubmit = () => {
    if (!feature || !targetId) return;
    merge.mutate(
      { sourceId: feature.id, targetId },
      { onSuccess: () => { onOpenChange(false); setTargetId(""); setSearch(""); } }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">Merge Feature</DialogTitle>
        </DialogHeader>
        <p className="text-xs text-muted-foreground">
          Merge <span className="font-medium text-foreground">"{feature?.title}"</span> into another feature request.
        </p>

        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search target feature..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-9 text-xs pl-8"
            />
          </div>

          <div className="max-h-48 overflow-y-auto space-y-1 rounded-lg border border-border p-1">
            {candidates.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">No matching features</p>
            ) : (
              candidates.map(c => (
                <button
                  key={c.id}
                  onClick={() => setTargetId(c.id)}
                  className={cn(
                    "w-full text-left rounded px-3 py-2 text-xs transition-colors",
                    targetId === c.id
                      ? "bg-primary/10 text-primary border border-primary/30"
                      : "hover:bg-accent/50 text-foreground"
                  )}
                >
                  <p className="font-medium truncate">{c.title}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {c.status.replace("_", " ")} · Score: {c.priority_score?.toFixed(1)}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button size="sm" onClick={handleSubmit} disabled={!targetId || merge.isPending}>
            {merge.isPending ? "Merging..." : "Merge"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Create Changelog Dialog ───
function CreateChangelogDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [version, setVersion] = useState("");
  const [releaseDate, setReleaseDate] = useState(new Date().toISOString().split("T")[0]);
  const [features, setFeatures] = useState<string[]>([""]);
  const [improvements, setImprovements] = useState<string[]>([""]);
  const [bugFixes, setBugFixes] = useState<string[]>([""]);
  const createChangelog = useCreateChangelog();

  const addItem = (setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => [...prev, ""]);
  };

  const updateItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, idx: number, value: string) => {
    setter(prev => prev.map((v, i) => i === idx ? value : v));
  };

  const removeItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, idx: number) => {
    setter(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = () => {
    createChangelog.mutate(
      {
        version: version.trim(),
        releaseDate,
        featuresAdded: features.filter(Boolean),
        improvements: improvements.filter(Boolean),
        bugFixes: bugFixes.filter(Boolean),
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          setVersion("");
          setFeatures([""]);
          setImprovements([""]);
          setBugFixes([""]);
        },
      }
    );
  };

  const hasContent = features.some(Boolean) || improvements.some(Boolean) || bugFixes.some(Boolean);

  const renderList = (
    label: string,
    items: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    placeholder: string,
    accentClass: string
  ) => (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className={cn("text-xs font-medium", accentClass)}>{label}</label>
        <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2 gap-0.5" onClick={() => addItem(setter)}>
          <Plus className="h-2.5 w-2.5" /> Add
        </Button>
      </div>
      {items.map((item, idx) => (
        <div key={idx} className="flex gap-1.5">
          <Input
            value={item}
            onChange={e => updateItem(setter, idx, e.target.value)}
            placeholder={placeholder}
            className="h-8 text-xs flex-1"
          />
          {items.length > 1 && (
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => removeItem(setter, idx)}>
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base">Create Changelog Entry</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Version</label>
              <Input
                value={version}
                onChange={e => setVersion(e.target.value)}
                placeholder="e.g. v2.4.0"
                className="h-9 text-xs font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Release Date</label>
              <Input
                type="date"
                value={releaseDate}
                onChange={e => setReleaseDate(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
          </div>

          {renderList("New Features", features, setFeatures, "e.g. Role-weighted voting engine", "text-emerald-600 dark:text-emerald-400")}
          {renderList("Improvements", improvements, setImprovements, "e.g. Faster search results", "text-blue-600 dark:text-blue-400")}
          {renderList("Bug Fixes", bugFixes, setBugFixes, "e.g. Fixed comment threading on mobile", "text-amber-600 dark:text-amber-400")}
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!version.trim() || !hasContent || createChangelog.isPending}
          >
            {createChangelog.isPending ? "Publishing..." : "Publish Changelog"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Edit Feature Dialog ───
function EditFeatureDialog({
  feature,
  open,
  onOpenChange,
}: {
  feature: FeatureRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [title, setTitle] = useState(feature?.title || "");
  const [description, setDescription] = useState(feature?.description || "");
  const editMutation = useEditFeatureDescription();

  // Sync state when feature changes
  useState(() => {
    if (feature) {
      setTitle(feature.title);
      setDescription(feature.description);
    }
  });

  const handleSubmit = () => {
    if (!feature) return;
    editMutation.mutate(
      { featureId: feature.id, title: title.trim(), description: description.trim() },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base">Edit Feature</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-foreground mb-1 block">Title</label>
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="h-9 text-xs"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-foreground mb-1 block">Description</label>
            <Textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="text-xs min-h-[120px]"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button size="sm" onClick={handleSubmit} disabled={!title.trim() || editMutation.isPending}>
            {editMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Admin Panel ───
export function FeedbackAdminPanel() {
  const { data: features, isLoading, isError, error } = useFeatureRequests({ sortBy: "recent" });
  const pinMutation = useAdminPin();
  const seedMutation = useSeedModules();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<FeatureStatus | "all">("all");
  const [statusTarget, setStatusTarget] = useState<FeatureRequest | null>(null);
  const [rejectTarget, setRejectTarget] = useState<FeatureRequest | null>(null);
  const [mergeTarget, setMergeTarget] = useState<FeatureRequest | null>(null);
  const [editTarget, setEditTarget] = useState<FeatureRequest | null>(null);
  const [showChangelog, setShowChangelog] = useState(false);

  const filtered = (features || []).filter(f => {
    if (statusFilter !== "all" && f.status !== statusFilter) return false;
    if (search && !f.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const seededCount = features?.filter(f => f.is_seeded).length || 0;

  // Stats
  const stats = {
    total: features?.length || 0,
    underReview: features?.filter(f => f.status === "under_review").length || 0,
    planned: features?.filter(f => f.status === "planned").length || 0,
    inProgress: features?.filter(f => f.status === "in_progress").length || 0,
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
        </div>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center gap-2 p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
        <AlertCircle className="h-4 w-4 shrink-0" />
        <span>{(error as Error)?.message || "Failed to load"}</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total", value: stats.total, icon: "📊" },
          { label: "Under Review", value: stats.underReview, icon: "⏳" },
          { label: "Planned", value: stats.planned, icon: "📋" },
          { label: "In Progress", value: stats.inProgress, icon: "🚧" },
        ].map(s => (
          <div key={s.label} className="rounded-lg border border-border bg-card p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm">{s.icon}</span>
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
            <p className="text-xl font-bold text-foreground">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Seed banner */}
      {seededCount === 0 && (
        <div className="flex items-center justify-between gap-3 p-3 rounded-lg border border-dashed border-primary/30 bg-primary/5">
          <div className="flex items-center gap-2">
            <Sprout className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs font-medium text-foreground">Seed Product Hub</p>
              <p className="text-[10px] text-muted-foreground">Auto-populate with 29+ platform modules (as Released) and their future scope items (as Planned votable cards).</p>
            </div>
          </div>
          <Button
            size="sm"
            className="gap-1.5 text-xs shrink-0"
            onClick={() => seedMutation.mutate()}
            disabled={seedMutation.isPending}
          >
            <Sprout className="h-3.5 w-3.5" />
            {seedMutation.isPending ? "Seeding..." : "Seed Modules"}
          </Button>
        </div>
      )}

      {/* Filters + actions */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search features..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-9 text-xs pl-8"
          />
        </div>
        <Select value={statusFilter} onValueChange={v => setStatusFilter(v as any)}>
          <SelectTrigger className="w-[150px] h-9 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-xs">All Statuses</SelectItem>
            {ALL_STATUSES.map(s => (
              <SelectItem key={s.value} value={s.value} className="text-xs">{s.label}</SelectItem>
            ))}
            <SelectItem value="rejected" className="text-xs">Rejected</SelectItem>
          </SelectContent>
        </Select>
        {seededCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-1.5 text-xs"
            onClick={() => seedMutation.mutate()}
            disabled={seedMutation.isPending}
          >
            <Sprout className="h-3.5 w-3.5" />
            {seedMutation.isPending ? "Seeding..." : "Re-seed"}
          </Button>
        )}
        <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs" onClick={() => setShowChangelog(true)}>
          <FileText className="h-3.5 w-3.5" />
          New Changelog
        </Button>
      </div>

      {/* Feature list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Clock className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground">No features match your filter</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(f => (
            <AdminFeatureRow
              key={f.id}
              feature={f}
              onStatusChange={setStatusTarget}
              onReject={setRejectTarget}
              onTogglePin={(feat) => pinMutation.mutate({ featureId: feat.id, pinned: !feat.pinned })}
              onMerge={setMergeTarget}
              onEdit={setEditTarget}
            />
          ))}
        </div>
      )}

      {/* Dialogs */}
      <StatusChangeDialog feature={statusTarget} open={!!statusTarget} onOpenChange={o => { if (!o) setStatusTarget(null); }} />
      <RejectDialog feature={rejectTarget} open={!!rejectTarget} onOpenChange={o => { if (!o) setRejectTarget(null); }} />
      <MergeDialog feature={mergeTarget} open={!!mergeTarget} onOpenChange={o => { if (!o) setMergeTarget(null); }} allFeatures={features || []} />
      <EditFeatureDialog feature={editTarget} open={!!editTarget} onOpenChange={o => { if (!o) setEditTarget(null); }} />
      <CreateChangelogDialog open={showChangelog} onOpenChange={setShowChangelog} />
    </div>
  );
}
