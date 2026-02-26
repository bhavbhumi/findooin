import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Copy, Mail, Share2, Check, Loader2, UserPlus } from "lucide-react";

interface InviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const INVITE_LINK = typeof window !== "undefined"
  ? `${window.location.origin}/auth?mode=signup&ref=invite`
  : "";

const INVITE_MESSAGE =
  "Join FindOO — India's trust-first financial network for verified Issuers, Intermediaries & Investors.";

export function InviteDialog({ open, onOpenChange }: InviteDialogProps) {
  const [emails, setEmails] = useState("");
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);

  const canShare = typeof navigator !== "undefined" && !!navigator.share;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(INVITE_LINK);
      setCopied(true);
      toast.success("Invite link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy — please copy manually");
    }
  };

  const handleWebShare = async () => {
    try {
      await navigator.share({
        title: "Join FindOO",
        text: INVITE_MESSAGE,
        url: INVITE_LINK,
      });
    } catch (err: any) {
      if (err?.name !== "AbortError") {
        toast.error("Sharing failed");
      }
    }
  };

  const handleEmailInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    const list = emails
      .split(/[,;\s]+/)
      .map((s) => s.trim())
      .filter((s) => s.includes("@"));

    if (list.length === 0) {
      toast.error("Enter at least one valid email address");
      return;
    }

    setSending(true);

    // Generate mailto link as a fallback (no backend email service required)
    const subject = encodeURIComponent("Join me on FindOO");
    const body = encodeURIComponent(
      `${INVITE_MESSAGE}\n\nSign up here: ${INVITE_LINK}`
    );
    const mailtoUrl = `mailto:${list.join(",")}?subject=${subject}&body=${body}`;

    window.open(mailtoUrl, "_blank");

    toast.success(`Opening email for ${list.length} invite${list.length > 1 ? "s" : ""}`);
    setSending(false);
    setEmails("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-accent" />
            Invite to FindOO
          </DialogTitle>
          <DialogDescription>
            Grow your professional network by inviting colleagues and associates.
          </DialogDescription>
        </DialogHeader>

        {/* Copy link section */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">Share invite link</Label>
          <div className="flex gap-2">
            <Input
              value={INVITE_LINK}
              readOnly
              className="text-xs bg-muted/50 font-mono"
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <Button
              variant="outline"
              size="icon"
              className="shrink-0"
              onClick={handleCopyLink}
            >
              {copied ? (
                <Check className="h-4 w-4 text-accent" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
            {canShare && (
              <Button
                variant="outline"
                size="icon"
                className="shrink-0"
                onClick={handleWebShare}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 my-1">
          <Separator className="flex-1" />
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">or</span>
          <Separator className="flex-1" />
        </div>

        {/* Email invite section */}
        <form onSubmit={handleEmailInvite} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="inviteEmails" className="text-xs font-medium text-muted-foreground">
              Invite via email
            </Label>
            <Input
              id="inviteEmails"
              type="text"
              placeholder="email1@example.com, email2@example.com"
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
            />
            <p className="text-[10px] text-muted-foreground">
              Separate multiple emails with commas
            </p>
          </div>
          <Button type="submit" className="w-full gap-2" disabled={sending || !emails.trim()}>
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Mail className="h-4 w-4" />
            )}
            Send Invite{emails.includes(",") ? "s" : ""}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
