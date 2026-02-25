import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const REPORT_REASONS = [
  "Misleading financial information",
  "Spam or scam",
  "Harassment or abuse",
  "Impersonation",
  "Inappropriate content",
  "Intellectual property violation",
  "Other",
];

interface ReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId: string;
  postAuthorId: string;
}

export function ReportDialog({ open, onOpenChange, postId, postAuthorId }: ReportDialogProps) {
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedReason) return;
    setSubmitting(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { toast.error("Please sign in"); setSubmitting(false); return; }

    const { error } = await supabase.from("reports").insert({
      reporter_id: session.user.id,
      post_id: postId,
      reported_user_id: postAuthorId,
      reason: selectedReason,
      description: description.trim() || null,
    });

    if (error) {
      toast.error("Failed to submit report");
    } else {
      toast.success("Report submitted. We'll review it shortly.");
      onOpenChange(false);
      setSelectedReason(null);
      setDescription("");
    }
    setSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">Report Post</DialogTitle>
          <DialogDescription>
            Help us keep the community safe. Select a reason for reporting this content.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 my-2">
          {REPORT_REASONS.map((reason) => (
            <button
              key={reason}
              onClick={() => setSelectedReason(reason)}
              className={`w-full text-left px-3 py-2.5 rounded-lg border text-sm transition-colors ${
                selectedReason === reason
                  ? "border-primary bg-primary/5 text-foreground font-medium"
                  : "border-border bg-card text-foreground hover:bg-muted/50"
              }`}
            >
              {reason}
            </button>
          ))}
        </div>

        <Textarea
          placeholder="Additional details (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-[80px]"
        />

        <div className="flex justify-end gap-2 mt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!selectedReason || submitting} variant="destructive">
            {submitting ? "Submitting..." : "Submit Report"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
