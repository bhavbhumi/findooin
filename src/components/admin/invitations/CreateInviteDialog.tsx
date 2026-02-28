import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateInvitation } from "@/hooks/useInvitations";

interface CreateInviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateInviteDialog({ open, onOpenChange }: CreateInviteDialogProps) {
  const [form, setForm] = useState({
    target_name: "",
    target_email: "",
    target_phone: "",
    target_role: "intermediary",
    notes: "",
  });

  const create = useCreateInvitation();

  const handleSubmit = () => {
    if (!form.target_email.trim()) return;
    create.mutate(
      {
        target_name: form.target_name || null,
        target_email: form.target_email.trim().toLowerCase(),
        target_phone: form.target_phone || null,
        target_role: form.target_role,
        notes: form.notes || null,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          setForm({ target_name: "", target_email: "", target_phone: "", target_role: "intermediary", notes: "" });
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Invitation</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Name</Label>
              <Input
                placeholder="Full name"
                value={form.target_name}
                onChange={(e) => setForm((f) => ({ ...f, target_name: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Role</Label>
              <Select value={form.target_role} onValueChange={(v) => setForm((f) => ({ ...f, target_role: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="intermediary">Intermediary</SelectItem>
                  <SelectItem value="issuer">Issuer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Email *</Label>
            <Input
              type="email"
              placeholder="email@example.com"
              value={form.target_email}
              onChange={(e) => setForm((f) => ({ ...f, target_email: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Phone</Label>
            <Input
              placeholder="+91 9876543210"
              value={form.target_phone}
              onChange={(e) => setForm((f) => ({ ...f, target_phone: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Notes</Label>
            <Textarea
              placeholder="Optional notes..."
              rows={2}
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!form.target_email.trim() || create.isPending}>
            {create.isPending ? "Sending..." : "Create Invite"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
