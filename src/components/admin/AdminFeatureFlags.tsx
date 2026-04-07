/**
 * AdminFeatureFlags — Full CRUD for feature flags with toggle, segments,
 * rollout percentages, and audit logging.
 */
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { QUERY_KEYS } from "@/lib/query-keys";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  ToggleLeft, Plus, Search, Trash2, Pencil, Shield,
  Users, Percent, Clock, Tag, AlertTriangle, CheckCircle2, XCircle
} from "lucide-react";
import { toast } from "sonner";
import { format, formatDistanceToNow } from "date-fns";

const SEGMENTS = [
  { key: "all", label: "All Users" },
  { key: "staff", label: "Staff Only" },
  { key: "admin", label: "Admins Only" },
  { key: "verified", label: "Verified Users" },
  { key: "intermediary", label: "Intermediaries" },
  { key: "issuer", label: "Issuers" },
  { key: "investor", label: "Investors" },
];

type Flag = {
  id: string;
  flag_key: string;
  label: string;
  description: string;
  is_enabled: boolean;
  rollout_percentage: number;
  target_segment: string;
  metadata: any;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export function AdminFeatureFlags() {
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editFlag, setEditFlag] = useState<Flag | null>(null);
  const qc = useQueryClient();

  const { data: flags = [], isLoading } = useQuery({
    queryKey: ["admin-feature-flags"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("feature_flags")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Flag[];
    },
  });

  const toggleFlag = useMutation({
    mutationFn: async ({ id, is_enabled }: { id: string; is_enabled: boolean }) => {
      const { error } = await supabase.from("feature_flags")
        .update({ is_enabled, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;

      // Audit log
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("audit_logs").insert({
          user_id: user.id,
          action: is_enabled ? "feature_flag_enabled" : "feature_flag_disabled",
          resource_type: "feature_flag",
          resource_id: id,
        });
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-feature-flags"] }),
    onError: (e: any) => toast.error(e.message),
  });

  const filtered = useMemo(() => {
    if (!search) return flags;
    const q = search.toLowerCase();
    return flags.filter(f =>
      f.flag_key.toLowerCase().includes(q) ||
      f.label.toLowerCase().includes(q) ||
      f.description.toLowerCase().includes(q)
    );
  }, [flags, search]);

  const enabledCount = flags.filter(f => f.is_enabled).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold font-heading flex items-center gap-2">
            <ToggleLeft className="h-5 w-5" /> Feature Flags
          </h2>
          <p className="text-sm text-muted-foreground">Control feature rollouts and platform configuration</p>
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="h-3.5 w-3.5 mr-1" /> New Flag
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <Tag className="h-3 w-3 text-primary" />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Total</span>
            </div>
            <p className="text-xl font-bold">{flags.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Enabled</span>
            </div>
            <p className="text-xl font-bold text-emerald-600">{enabledCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <XCircle className="h-3 w-3 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Disabled</span>
            </div>
            <p className="text-xl font-bold">{flags.length - enabledCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <Percent className="h-3 w-3 text-yellow-500" />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Partial Rollout</span>
            </div>
            <p className="text-xl font-bold">{flags.filter(f => f.is_enabled && f.rollout_percentage < 100).length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search flags..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {/* Flags table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <ToggleLeft className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium mb-1">No feature flags yet</p>
              <p className="text-xs mb-4">Create your first flag to control feature rollouts.</p>
              <Button size="sm" variant="outline" onClick={() => setCreateOpen(true)}>
                <Plus className="h-3.5 w-3.5 mr-1" /> Create Flag
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs w-16">Status</TableHead>
                  <TableHead className="text-xs">Flag</TableHead>
                  <TableHead className="text-xs">Segment</TableHead>
                  <TableHead className="text-xs">Rollout</TableHead>
                  <TableHead className="text-xs">Updated</TableHead>
                  <TableHead className="text-xs w-20"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((flag) => {
                  const segment = SEGMENTS.find(s => s.key === flag.target_segment);
                  return (
                    <TableRow key={flag.id}>
                      <TableCell>
                        <Switch
                          checked={flag.is_enabled}
                          onCheckedChange={(v) => {
                            toggleFlag.mutate({ id: flag.id, is_enabled: v });
                            toast.success(`${flag.label} ${v ? "enabled" : "disabled"}`);
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium">{flag.label}</p>
                          <code className="text-[10px] text-muted-foreground bg-muted px-1 py-0.5 rounded">{flag.flag_key}</code>
                          {flag.description && (
                            <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{flag.description}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">
                          <Users className="h-2.5 w-2.5 mr-1" /> {segment?.label || flag.target_segment}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all"
                              style={{ width: `${flag.rollout_percentage}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">{flag.rollout_percentage}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-[11px] text-muted-foreground">
                          {formatDistanceToNow(new Date(flag.updated_at), { addSuffix: true })}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditFlag(flag)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <CreateFlagDialog open={createOpen} onOpenChange={setCreateOpen} />
      {editFlag && <EditFlagDialog flag={editFlag} open={!!editFlag} onOpenChange={(v) => { if (!v) setEditFlag(null); }} />}
    </div>
  );
}

/* ─── Create Flag Dialog ─── */
function CreateFlagDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    flag_key: "", label: "", description: "",
    is_enabled: false, rollout_percentage: 100, target_segment: "all",
  });

  const autoKey = (label: string) =>
    label.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");

  const create = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("feature_flags").insert({
        flag_key: form.flag_key || autoKey(form.label),
        label: form.label,
        description: form.description,
        is_enabled: form.is_enabled,
        rollout_percentage: form.rollout_percentage,
        target_segment: form.target_segment,
        created_by: user.id,
      });
      if (error) throw error;

      await supabase.from("audit_logs").insert({
        user_id: user.id,
        action: "feature_flag_created",
        resource_type: "feature_flag",
        metadata: { flag_key: form.flag_key || autoKey(form.label) },
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-feature-flags"] });
      toast.success("Feature flag created");
      onOpenChange(false);
      setForm({ flag_key: "", label: "", description: "", is_enabled: false, rollout_percentage: 100, target_segment: "all" });
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Feature Flag</DialogTitle>
          <DialogDescription>Define a new flag to control feature availability.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Label *</Label>
            <Input
              value={form.label}
              onChange={(e) => {
                const label = e.target.value;
                setForm(f => ({ ...f, label, flag_key: f.flag_key || autoKey(label) }));
              }}
              placeholder="e.g. Dark Mode"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Key</Label>
            <Input
              value={form.flag_key}
              onChange={(e) => setForm(f => ({ ...f, flag_key: e.target.value }))}
              placeholder="auto-generated from label"
              className="font-mono text-xs"
            />
            <p className="text-[10px] text-muted-foreground">Unique identifier used in code. Auto-generated if left blank.</p>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Description</Label>
            <Textarea rows={2} value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Target Segment</Label>
              <Select value={form.target_segment} onValueChange={(v) => setForm(f => ({ ...f, target_segment: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SEGMENTS.map(s => <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Rollout %</Label>
              <div className="flex items-center gap-2">
                <Slider
                  value={[form.rollout_percentage]}
                  onValueChange={([v]) => setForm(f => ({ ...f, rollout_percentage: v }))}
                  max={100} min={0} step={5}
                  className="flex-1"
                />
                <span className="text-xs font-mono w-8 text-right">{form.rollout_percentage}%</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <Switch checked={form.is_enabled} onCheckedChange={(v) => setForm(f => ({ ...f, is_enabled: v }))} />
            <div>
              <p className="text-sm font-medium">{form.is_enabled ? "Enabled" : "Disabled"}</p>
              <p className="text-[10px] text-muted-foreground">{form.is_enabled ? "Flag will be active immediately" : "Flag created in disabled state"}</p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => create.mutate()} disabled={!form.label || create.isPending}>
            {create.isPending ? "Creating..." : "Create Flag"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Edit Flag Dialog ─── */
function EditFlagDialog({ flag, open, onOpenChange }: { flag: Flag; open: boolean; onOpenChange: (v: boolean) => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    label: flag.label,
    description: flag.description,
    is_enabled: flag.is_enabled,
    rollout_percentage: flag.rollout_percentage,
    target_segment: flag.target_segment,
  });

  const update = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("feature_flags").update({
        label: form.label,
        description: form.description,
        is_enabled: form.is_enabled,
        rollout_percentage: form.rollout_percentage,
        target_segment: form.target_segment,
        updated_at: new Date().toISOString(),
      }).eq("id", flag.id);
      if (error) throw error;

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("audit_logs").insert({
          user_id: user.id,
          action: "feature_flag_updated",
          resource_type: "feature_flag",
          resource_id: flag.id,
          metadata: { flag_key: flag.flag_key, changes: form },
        });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-feature-flags"] });
      toast.success("Flag updated");
      onOpenChange(false);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteFlag = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("feature_flags").delete().eq("id", flag.id);
      if (error) throw error;

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("audit_logs").insert({
          user_id: user.id,
          action: "feature_flag_deleted",
          resource_type: "feature_flag",
          metadata: { flag_key: flag.flag_key },
        });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-feature-flags"] });
      toast.success("Flag deleted");
      onOpenChange(false);
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Feature Flag</DialogTitle>
          <DialogDescription>
            <code className="text-[11px] bg-muted px-1.5 py-0.5 rounded">{flag.flag_key}</code>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Label</Label>
            <Input value={form.label} onChange={(e) => setForm(f => ({ ...f, label: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Description</Label>
            <Textarea rows={2} value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Target Segment</Label>
              <Select value={form.target_segment} onValueChange={(v) => setForm(f => ({ ...f, target_segment: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SEGMENTS.map(s => <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Rollout %</Label>
              <div className="flex items-center gap-2">
                <Slider
                  value={[form.rollout_percentage]}
                  onValueChange={([v]) => setForm(f => ({ ...f, rollout_percentage: v }))}
                  max={100} min={0} step={5}
                  className="flex-1"
                />
                <span className="text-xs font-mono w-8 text-right">{form.rollout_percentage}%</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <Switch checked={form.is_enabled} onCheckedChange={(v) => setForm(f => ({ ...f, is_enabled: v }))} />
            <div>
              <p className="text-sm font-medium">{form.is_enabled ? "Enabled" : "Disabled"}</p>
              <p className="text-[10px] text-muted-foreground">{form.is_enabled ? "Flag is active for target segment" : "Flag is currently off"}</p>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            <p>Created: {format(new Date(flag.created_at), "dd MMM yyyy, HH:mm")}</p>
            <p>Updated: {formatDistanceToNow(new Date(flag.updated_at), { addSuffix: true })}</p>
          </div>
        </div>
        <Separator />
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="destructive" size="sm" onClick={() => deleteFlag.mutate()} disabled={deleteFlag.isPending} className="mr-auto">
            <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={() => update.mutate()} disabled={!form.label || update.isPending}>
              {update.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
