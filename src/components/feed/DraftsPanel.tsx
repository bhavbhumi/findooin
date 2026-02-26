import { useEffect } from "react";
import { PostDraft, useDrafts } from "@/hooks/useDrafts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { FileEdit, Trash2, Loader2 } from "lucide-react";

interface DraftsPanelProps {
  userId: string | null;
  onLoadDraft: (draft: PostDraft) => void;
}

export function DraftsPanel({ userId, onLoadDraft }: DraftsPanelProps) {
  const { drafts, loading, loadDrafts, deleteDraft } = useDrafts(userId);

  useEffect(() => {
    loadDrafts();
  }, [loadDrafts]);

  if (!userId) return null;
  if (loading) {
    return (
      <Card className="p-4 flex justify-center">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </Card>
    );
  }
  if (drafts.length === 0) return null;

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center gap-2">
        <FileEdit className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold font-heading">Drafts</h3>
        <Badge variant="secondary" className="text-[10px]">{drafts.length}</Badge>
      </div>

      {drafts.map((draft) => (
        <div
          key={draft.id}
          className="rounded-lg border border-border bg-secondary/30 p-3 space-y-2"
        >
          <p className="text-xs text-foreground line-clamp-2">
            {draft.content || <span className="italic text-muted-foreground">Empty draft</span>}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground">
              {formatDistanceToNow(new Date(draft.updated_at), { addSuffix: true })}
            </span>
            <Badge variant="outline" className="text-[10px]">{draft.post_kind}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={() => onLoadDraft(draft)}
            >
              <FileEdit className="h-3 w-3" /> Resume
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs gap-1 text-destructive hover:text-destructive"
              onClick={() => deleteDraft(draft.id)}
            >
              <Trash2 className="h-3 w-3" /> Delete
            </Button>
          </div>
        </div>
      ))}
    </Card>
  );
}
