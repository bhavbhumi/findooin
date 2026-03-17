/**
 * CreateTicketDialog — User-facing dialog to submit support tickets.
 */
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageCircle } from "lucide-react";
import { useCreateTicket } from "@/hooks/useSupportTickets";

const CATEGORIES = [
  { value: "general", label: "General" },
  { value: "account", label: "Account & Profile" },
  { value: "verification", label: "Verification" },
  { value: "billing", label: "Billing & Plans" },
  { value: "content", label: "Posts & Content" },
  { value: "bug", label: "Bug Report" },
  { value: "feature", label: "Feature Request" },
];

export function CreateTicketDialog({ trigger }: { trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("general");
  const [priority, setPriority] = useState("medium");

  const createTicket = useCreateTicket();

  const handleSubmit = () => {
    if (!subject.trim()) return;
    createTicket.mutate(
      { subject: subject.trim(), description: description.trim(), category, priority },
      {
        onSuccess: () => {
          setOpen(false);
          setSubject("");
          setDescription("");
          setCategory("general");
          setPriority("medium");
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <MessageCircle className="h-4 w-4 mr-1.5" /> Submit a Ticket
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Submit a Support Ticket</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="ticket-subject">Subject</Label>
            <Input id="ticket-subject" placeholder="Brief summary of your issue" value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={200} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ticket-desc">Description</Label>
            <Textarea id="ticket-desc" placeholder="Describe your issue in detail..." value={description} onChange={(e) => setDescription(e.target.value)} rows={4} maxLength={2000} />
          </div>
          <Button onClick={handleSubmit} disabled={!subject.trim() || createTicket.isPending} className="w-full">
            {createTicket.isPending ? "Submitting..." : "Submit Ticket"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
