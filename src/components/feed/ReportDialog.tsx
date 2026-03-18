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

const REPORT_REASONS: Record<string, string[]> = {
  post: [
    "Misleading financial information",
    "Spam or scam",
    "Harassment or abuse",
    "Impersonation",
    "Inappropriate content",
    "Intellectual property violation",
    "Other",
  ],
  job: [
    "Fake or fraudulent job posting",
    "Misleading job description",
    "Spam or scam",
    "Discriminatory requirements",
    "Inappropriate content",
    "Other",
  ],
  event: [
    "Fake or fraudulent event",
    "Misleading event details",
    "Spam or scam",
    "Inappropriate content",
    "Safety concerns",
    "Other",
  ],
  listing: [
    "Misleading financial information",
    "Fake or fraudulent listing",
    "Spam or scam",
    "Regulatory violation",
    "Inappropriate content",
    "Other",
  ],
  message: [
    "Harassment or abuse",
    "Spam or scam",
    "Threats or intimidation",
    "Impersonation",
    "Inappropriate content",
    "Other",
  ],
};

const RESOURCE_LABELS: Record<string, string> = {
  post: "Post",
  job: "Job",
  event: "Event",
  listing: "Listing",
  message: "Message",
};

interface ReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Resource type being reported */
  resourceType?: string;
  /** ID of the resource (job, event, listing, message) */
  resourceId?: string;
  /** User ID of the content owner */
  reportedUserId?: string;
  /** @deprecated Use resourceId + resourceType instead */
  postId?: string;
  /** @deprecated Use reportedUserId instead */
  postAuthorId?: string;
}

export function ReportDialog({
  open,
  onOpenChange,
  resourceType = "post",
  resourceId,
  reportedUserId,
  postId,
  postAuthorId,
}: ReportDialogProps) {
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Backward compat
  const finalResourceId = resourceId || postId || "";
  const finalReportedUserId = reportedUserId || postAuthorId || "";
  const finalResourceType = resourceType || "post";

  const reasons = REPORT_REASONS[finalResourceType] || REPORT_REASONS.post;
  const label = RESOURCE_LABELS[finalResourceType] || "Content";

  const handleSubmit = async () => {
    if (!selectedReason) return;
    setSubmitting(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { toast.error("Please sign in"); setSubmitting(false); return; }

    const insertData: Record<string, any> = {
      reporter_id: session.user.id,
      reported_user_id: finalReportedUserId || null,
      reason: selectedReason,
      description: description.trim() || null,
      resource_type: finalResourceType,
      resource_id: finalResourceId,
    };

    // Keep post_id populated for backward compat
    if (finalResourceType === "post") {
      insertData.post_id = finalResourceId;
    }

    const { error } = await supabase.from("reports").insert(insertData);

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
          <DialogTitle className="font-heading">Report {label}</DialogTitle>
          <DialogDescription>
            Help us keep the community safe. Select a reason for reporting this {label.toLowerCase()}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 my-2">
          {reasons.map((reason) => (
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
