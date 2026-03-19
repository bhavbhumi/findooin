/**
 * AdminOpinionsManagement — Admin CRUD for professional opinions.
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, Pencil, Trash2, BarChart3, CalendarIcon, Eye, Users } from "lucide-react";
import { format, addHours } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  useOpinions, useCreateOpinion, useUpdateOpinion, useDeleteOpinion,
  type Opinion, type OpinionFormat, type OpinionCategory, type OpinionOption, type ContentIntent,
  OPINION_CATEGORIES, DURATION_PRESETS, FORMAT_DEFAULTS, DEFAULT_DISCLAIMER, CONTENT_INTENT_LABELS,
} from "@/hooks/useOpinions";

const FORMAT_LABELS: Record<OpinionFormat, string> = {
  binary: "Binary (Yes/No)",
  multiple_choice: "Multiple Choice",
  scale: "Scale (Bullish → Bearish)",
  over_under: "Over / Under",
};

export function AdminOpinionsManagement() {
  const { data: opinions = [], isLoading } = useOpinions();
  const createOpinion = useCreateOpinion();
  const updateOpinion = useUpdateOpinion();
  const deleteOpinion = useDeleteOpinion();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<OpinionCategory>("markets_indices");
  const [opFormat, setOpFormat] = useState<OpinionFormat>("binary");
  const [options, setOptions] = useState<OpinionOption[]>(FORMAT_DEFAULTS.binary);
  const [status, setStatus] = useState<"draft" | "active">("draft");
  const [isFeatured, setIsFeatured] = useState(false);
  const [durationPreset, setDurationPreset] = useState<number>(168); // 1 week
  const [customDate, setCustomDate] = useState<Date | undefined>(undefined);
  const [useCustomDate, setUseCustomDate] = useState(false);
  const [disclaimer, setDisclaimer] = useState(DEFAULT_DISCLAIMER);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCategory("markets_indices");
    setOpFormat("binary");
    setOptions(FORMAT_DEFAULTS.binary);
    setStatus("draft");
    setIsFeatured(false);
    setDurationPreset(168);
    setCustomDate(undefined);
    setUseCustomDate(false);
    setDisclaimer(DEFAULT_DISCLAIMER);
    setEditingId(null);
  };

  const openCreate = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (op: Opinion) => {
    setEditingId(op.id);
    setTitle(op.title);
    setDescription(op.description);
    setCategory(op.category);
    setOpFormat(op.format);
    setOptions(op.options);
    setStatus(op.status as "draft" | "active");
    setIsFeatured(op.is_featured);
    setDisclaimer(op.disclaimer_text || DEFAULT_DISCLAIMER);
    setDialogOpen(true);
  };

  const handleFormatChange = (f: OpinionFormat) => {
    setOpFormat(f);
    setOptions(FORMAT_DEFAULTS[f]);
  };

  const updateOption = (idx: number, label: string) => {
    setOptions((prev) => prev.map((o, i) => (i === idx ? { ...o, label } : o)));
  };

  const addOption = () => {
    if (options.length >= 6) return;
    const colors = ["#3b82f6", "#8b5cf6", "#f59e0b", "#14b8a6", "#f43f5e", "#6366f1"];
    setOptions((prev) => [...prev, { label: `Option ${prev.length + 1}`, color: colors[prev.length % colors.length] }]);
  };

  const removeOption = (idx: number) => {
    if (options.length <= 2) return;
    setOptions((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    const endsAt = useCustomDate && customDate
      ? customDate.toISOString()
      : addHours(new Date(), durationPreset).toISOString();

    const payload: any = {
      title: title.trim(),
      description: description.trim(),
      category,
      format: opFormat,
      options,
      status,
      is_featured: isFeatured,
      ends_at: endsAt,
      disclaimer_text: disclaimer.trim() || DEFAULT_DISCLAIMER,
    };

    if (editingId) {
      updateOpinion.mutate({ id: editingId, ...payload });
    } else {
      createOpinion.mutate(payload);
    }
    setDialogOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this opinion? All votes and comments will be removed.")) {
      deleteOpinion.mutate(id);
    }
  };

  const activeCount = opinions.filter((o) => o.status === "active").length;
  const draftCount = opinions.filter((o) => o.status === "draft").length;
  const totalVotes = opinions.reduce((sum, o) => sum + o.participation_count, 0);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Opinions", value: opinions.length, icon: BarChart3 },
          { label: "Active", value: activeCount, icon: Eye },
          { label: "Drafts", value: draftCount, icon: Pencil },
          { label: "Total Votes", value: totalVotes, icon: Users },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <stat.icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-lg font-bold">{stat.value}</p>
                <p className="text-[11px] text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Header + Create */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Manage Opinions</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={openCreate}>
              <Plus className="h-4 w-4 mr-1" /> Create Opinion
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Opinion" : "Create New Opinion"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <Label className="text-xs">Title *</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Will RBI cut repo rate in April 2026?" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Description</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Context for this opinion poll..." className="mt-1 min-h-[60px]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Category</Label>
                  <Select value={category} onValueChange={(v) => setCategory(v as OpinionCategory)}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(OPINION_CATEGORIES).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v.icon} {v.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Format</Label>
                  <Select value={opFormat} onValueChange={(v) => handleFormatChange(v as OpinionFormat)}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(FORMAT_LABELS).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Options */}
              <div>
                <Label className="text-xs">Options</Label>
                <div className="space-y-2 mt-1">
                  {options.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: opt.color }} />
                      <Input
                        value={opt.label}
                        onChange={(e) => updateOption(idx, e.target.value)}
                        className="h-8 text-sm"
                      />
                      {options.length > 2 && (
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => removeOption(idx)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                  {options.length < 6 && opFormat === "multiple_choice" && (
                    <Button variant="outline" size="sm" className="text-xs" onClick={addOption}>
                      + Add Option
                    </Button>
                  )}
                </div>
              </div>

              {/* Duration */}
              <div>
                <Label className="text-xs">Duration</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {DURATION_PRESETS.map((p) => (
                    <Button
                      key={p.hours}
                      variant={!useCustomDate && durationPreset === p.hours ? "default" : "outline"}
                      size="sm"
                      className="text-xs h-7"
                      onClick={() => { setUseCustomDate(false); setDurationPreset(p.hours); }}
                    >
                      {p.label}
                    </Button>
                  ))}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={useCustomDate ? "default" : "outline"}
                        size="sm"
                        className="text-xs h-7 gap-1"
                      >
                        <CalendarIcon className="h-3 w-3" /> Custom
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={customDate}
                        onSelect={(d) => { setCustomDate(d); setUseCustomDate(true); }}
                        disabled={(d) => d < new Date()}
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                {useCustomDate && customDate && (
                  <p className="text-[10px] text-muted-foreground mt-1">Ends: {format(customDate, "PPP")}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Status</Label>
                  <Select value={status} onValueChange={(v) => setStatus(v as "draft" | "active")}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active (Published)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <Switch checked={isFeatured} onCheckedChange={setIsFeatured} />
                  <Label className="text-xs">Featured</Label>
                </div>
              </div>

              <div>
                <Label className="text-xs">Disclaimer</Label>
                <Textarea
                  value={disclaimer}
                  onChange={(e) => setDisclaimer(e.target.value)}
                  className="mt-1 min-h-[50px] text-[11px]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={createOpinion.isPending || updateOpinion.isPending}>
                {editingId ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Format</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Votes</TableHead>
                <TableHead>Ends</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading...</TableCell>
                </TableRow>
              ) : opinions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No opinions yet</TableCell>
                </TableRow>
              ) : opinions.map((op) => (
                <TableRow key={op.id}>
                  <TableCell className="max-w-[200px]">
                    <span className="text-sm font-medium line-clamp-1">{op.title}</span>
                    {op.is_featured && <Badge className="text-[8px] ml-1 h-4">Featured</Badge>}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-[10px]">
                      {OPINION_CATEGORIES[op.category]?.icon} {OPINION_CATEGORIES[op.category]?.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">{FORMAT_LABELS[op.format]}</TableCell>
                  <TableCell>
                    <Badge variant={op.status === "active" ? "default" : "outline"} className="text-[10px]">
                      {op.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center text-sm font-medium">{op.participation_count}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{format(new Date(op.ends_at), "PP")}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openEdit(op)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive" onClick={() => handleDelete(op.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
