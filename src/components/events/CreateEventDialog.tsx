import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useCreateEvent, EVENT_CATEGORY_LABELS } from "@/hooks/useEvents";
import { useRole } from "@/contexts/RoleContext";

interface CreateEventDialogProps {
  open: boolean;
  onClose: () => void;
}

export function CreateEventDialog({ open, onClose }: CreateEventDialogProps) {
  const { userId } = useRole();
  const createEvent = useCreateEvent();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("webinar");
  const [eventMode, setEventMode] = useState("virtual");
  const [startDate, setStartDate] = useState<Date>();
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("11:00");
  const [venueName, setVenueName] = useState("");
  const [venueAddress, setVenueAddress] = useState("");
  const [virtualLink, setVirtualLink] = useState("");
  const [capacity, setCapacity] = useState("");
  const [isFree, setIsFree] = useState(true);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [publishNow, setPublishNow] = useState(true);

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t) && tags.length < 5) {
      setTags([...tags, t]);
      setTagInput("");
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !startDate || !userId) return;

    const [sh, sm] = startTime.split(":").map(Number);
    const [eh, em] = endTime.split(":").map(Number);
    const start = new Date(startDate);
    start.setHours(sh, sm, 0, 0);
    const end = new Date(startDate);
    end.setHours(eh, em, 0, 0);

    await createEvent.mutateAsync({
      organizer_id: userId,
      title: title.trim(),
      description: description.trim(),
      category,
      event_mode: eventMode,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      venue_name: venueName.trim() || null,
      venue_address: venueAddress.trim() || null,
      virtual_link: virtualLink.trim() || null,
      capacity: capacity ? parseInt(capacity) : null,
      is_free: isFree,
      status: publishNow ? "published" : "draft",
      tags,
    } as any);

    onClose();
    // Reset
    setTitle(""); setDescription(""); setCategory("webinar"); setEventMode("virtual");
    setStartDate(undefined); setStartTime("10:00"); setEndTime("11:00");
    setVenueName(""); setVenueAddress(""); setVirtualLink("");
    setCapacity(""); setIsFree(true); setTags([]); setPublishNow(true);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">Create Event</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div>
            <Label>Event Title *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Q3 Market Outlook Webinar" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(EVENT_CATEGORY_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Mode</Label>
              <Select value={eventMode} onValueChange={setEventMode}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="virtual">Virtual</SelectItem>
                  <SelectItem value="physical">In-Person</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your event..."
              rows={4}
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    {startDate ? format(startDate, "MMM d") : "Pick"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    disabled={(date) => date < new Date()}
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label>Start Time</Label>
              <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
            <div>
              <Label>End Time</Label>
              <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>
          </div>

          {/* Venue (for physical/hybrid) */}
          {(eventMode === "physical" || eventMode === "hybrid") && (
            <div className="space-y-3">
              <div>
                <Label>Venue Name</Label>
                <Input value={venueName} onChange={(e) => setVenueName(e.target.value)} placeholder="e.g., Taj Vivanta, BKC" />
              </div>
              <div>
                <Label>Venue Address</Label>
                <Input value={venueAddress} onChange={(e) => setVenueAddress(e.target.value)} placeholder="Full address" />
              </div>
            </div>
          )}

          {/* Virtual link (for virtual/hybrid) */}
          {(eventMode === "virtual" || eventMode === "hybrid") && (
            <div>
              <Label>Virtual Meeting Link</Label>
              <Input value={virtualLink} onChange={(e) => setVirtualLink(e.target.value)} placeholder="Zoom/Meet/Teams link" />
              <p className="text-[10px] text-muted-foreground mt-1">Hidden until 1 hour before event</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Capacity (optional)</Label>
              <Input type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} placeholder="Unlimited" />
            </div>
            <div className="flex items-end gap-2 pb-1">
              <Switch checked={isFree} onCheckedChange={setIsFree} id="free-event" />
              <Label htmlFor="free-event" className="cursor-pointer">{isFree ? "Free Event" : "Paid Event"}</Label>
            </div>
          </div>

          {/* Tags */}
          <div>
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add tag"
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
              />
              <Button variant="outline" size="icon" onClick={addTag}><Plus className="h-4 w-4" /></Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tags.map((t) => (
                  <span key={t} className="inline-flex items-center gap-1 text-xs bg-muted px-2 py-0.5 rounded-full">
                    {t}
                    <button onClick={() => setTags(tags.filter((x) => x !== t))}><X className="h-3 w-3" /></button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Switch checked={publishNow} onCheckedChange={setPublishNow} id="publish-now" />
            <Label htmlFor="publish-now" className="cursor-pointer">
              {publishNow ? "Publish immediately" : "Save as draft"}
            </Label>
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button
              className="flex-1"
              onClick={handleSubmit}
              disabled={!title.trim() || !startDate || createEvent.isPending}
            >
              {createEvent.isPending ? "Creating..." : "Create Event"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
