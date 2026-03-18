/**
 * AdminCampaignsManagement — Campaign lifecycle management with
 * creation, scheduling, audience targeting, and performance metrics.
 */
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Megaphone, Plus, Search, MoreHorizontal, Play, Pause, CheckCircle2,
  Mail, Eye, MousePointer, Target, Clock, Send, Archive, Trash2
} from "lucide-react";
import { toast } from "sonner";
import { format, formatDistanceToNow } from "date-fns";

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
  draft: { label: "Draft", variant: "secondary", icon: <Clock className="h-3 w-3" /> },
  scheduled: { label: "Scheduled", variant: "outline", icon: <Clock className="h-3 w-3" /> },
  sending: { label: "Sending", variant: "default", icon: <Send className="h-3 w-3" /> },
  completed: { label: "Completed", variant: "outline", icon: <CheckCircle2 className="h-3 w-3" /> },
  paused: { label: "Paused", variant: "secondary", icon: <Pause className="h-3 w-3" /> },
  cancelled: { label: "Cancelled", variant: "destructive", icon: <Archive className="h-3 w-3" /> },
};

const CAMPAIGN_TYPES = [
  { key: "email", label: "Email" },
  { key: "push", label: "Push Notification" },
  { key: "in_app", label: "In-App" },
];

const AUDIENCES = [
  { key: "all_users", label: "All Users" },
  { key: "verified_users", label: "Verified Users" },
  { key: "intermediaries", label: "Intermediaries" },
  { key: "issuers", label: "Issuers" },
  { key: "investors", label: "Investors" },
  { key: "inactive_30d", label: "Inactive 30+ days" },
  { key: "new_users_7d", label: "New Users (7 days)" },
];

type Campaign = {
  id: string;
  name: string;
  campaign_type: string;
  status: string;
  target_audience: string | null;
  target_count: number | null;
  sent_count: number | null;
  open_count: number | null;
  click_count: number | null;
  conversion_count: number | null;
  content: any;
  scheduled_at: string | null;
  completed_at: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export function AdminCampaignsManagement() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [editCampaign, setEditCampaign] = useState<Campaign | null>(null);
  const qc = useQueryClient();

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ["admin-campaigns"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Campaign[];
    },
  });

  const updateCampaign = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Campaign> & { id: string }) => {
      const { error } = await supabase.from("campaigns").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-campaigns"] }),
    onError: (e) => toast.error(e.message),
  });

  const deleteCampaign = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("campaigns").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-campaigns"] }); toast.success("Campaign deleted"); },
    onError: (e) => toast.error(e.message),
  });

  const filtered = useMemo(() => {
    return campaigns.filter((c) => {
      if (statusFilter !== "all" && c.status !== statusFilter) return false;
      if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [campaigns, search, statusFilter]);

  const stats = useMemo(() => ({
    total: campaigns.length,
    draft: campaigns.filter(c => c.status === "draft").length,
    sending: campaigns.filter(c => c.status === "sending").length,
    completed: campaigns.filter(c => c.status === "completed").length,
    totalSent: campaigns.reduce((sum, c) => sum + (c.sent_count || 0), 0),
    totalOpens: campaigns.reduce((sum, c) => sum + (c.open_count || 0), 0),
  }), [campaigns]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold font-heading flex items-center gap-2">
            <Megaphone className="h-5 w-5" /> Campaigns
          </h2>
          <p className="text-sm text-muted-foreground">Create and manage outreach campaigns</p>
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="h-3.5 w-3.5 mr-1" /> New Campaign
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Total", value: stats.total, icon: Megaphone, color: "text-primary" },
          { label: "Drafts", value: stats.draft, icon: Clock, color: "text-muted-foreground" },
          { label: "Active", value: stats.sending, icon: Send, color: "text-emerald-500" },
          { label: "Emails Sent", value: stats.totalSent, icon: Mail, color: "text-blue-500" },
          { label: "Total Opens", value: stats.totalOpens, icon: Eye, color: "text-purple-500" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-3 flex items-center gap-3">
              <div className={`h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0 ${s.color}`}>
                <s.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-lg font-bold leading-none">{s.value}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search campaigns..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Campaign Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Megaphone className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No campaigns yet</p>
              <p className="text-xs mt-1">Create your first campaign to start outreach</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Campaign</TableHead>
                  <TableHead className="text-xs">Type</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Audience</TableHead>
                  <TableHead className="text-xs text-center">Sent</TableHead>
                  <TableHead className="text-xs text-center">Opens</TableHead>
                  <TableHead className="text-xs text-center">Clicks</TableHead>
                  <TableHead className="text-xs">Created</TableHead>
                  <TableHead className="text-xs w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((campaign) => {
                  const statusCfg = STATUS_CONFIG[campaign.status] || STATUS_CONFIG.draft;
                  const openRate = campaign.sent_count && campaign.open_count
                    ? Math.round((campaign.open_count / campaign.sent_count) * 100) : 0;
                  return (
                    <TableRow key={campaign.id} className="cursor-pointer" onClick={() => setEditCampaign(campaign)}>
                      <TableCell>
                        <p className="text-sm font-medium">{campaign.name}</p>
                        {campaign.scheduled_at && (
                          <p className="text-[10px] text-muted-foreground">
                            Scheduled: {format(new Date(campaign.scheduled_at), "dd MMM, HH:mm")}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px] capitalize">{campaign.campaign_type.replace("_", " ")}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusCfg.variant} className="text-[10px] gap-1">{statusCfg.icon}{statusCfg.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs capitalize">{(campaign.target_audience || "all").replace("_", " ")}</span>
                        {campaign.target_count && <p className="text-[10px] text-muted-foreground">{campaign.target_count} targets</p>}
                      </TableCell>
                      <TableCell className="text-center text-sm font-mono">{campaign.sent_count || 0}</TableCell>
                      <TableCell className="text-center">
                        <span className="text-sm font-mono">{campaign.open_count || 0}</span>
                        {openRate > 0 && <p className="text-[9px] text-muted-foreground">{openRate}%</p>}
                      </TableCell>
                      <TableCell className="text-center text-sm font-mono">{campaign.click_count || 0}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(campaign.created_at), { addSuffix: true })}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => e.stopPropagation()}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {campaign.status === "draft" && (
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); updateCampaign.mutate({ id: campaign.id, status: "sending" }); toast.success("Campaign started"); }}>
                                <Play className="h-3.5 w-3.5 mr-2" /> Start Sending
                              </DropdownMenuItem>
                            )}
                            {campaign.status === "sending" && (
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); updateCampaign.mutate({ id: campaign.id, status: "paused" }); toast.success("Campaign paused"); }}>
                                <Pause className="h-3.5 w-3.5 mr-2" /> Pause
                              </DropdownMenuItem>
                            )}
                            {campaign.status === "paused" && (
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); updateCampaign.mutate({ id: campaign.id, status: "sending" }); toast.success("Campaign resumed"); }}>
                                <Play className="h-3.5 w-3.5 mr-2" /> Resume
                              </DropdownMenuItem>
                            )}
                            {["draft", "paused"].includes(campaign.status) && (
                              <DropdownMenuItem className="text-destructive" onClick={(e) => { e.stopPropagation(); deleteCampaign.mutate(campaign.id); }}>
                                <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <CreateCampaignDialog open={createOpen} onOpenChange={setCreateOpen} />
      {editCampaign && <CampaignDetailDialog campaign={editCampaign} open={!!editCampaign} onOpenChange={(v) => { if (!v) setEditCampaign(null); }} />}
    </div>
  );
}

function CreateCampaignDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    name: "", campaign_type: "email", target_audience: "all_users",
    subject: "", body: "",
  });

  const create = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("campaigns").insert({
        name: form.name,
        campaign_type: form.campaign_type,
        target_audience: form.target_audience,
        content: { subject: form.subject, body: form.body },
        created_by: user.id,
        status: "draft",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-campaigns"] });
      toast.success("Campaign created as draft");
      onOpenChange(false);
      setForm({ name: "", campaign_type: "email", target_audience: "all_users", subject: "", body: "" });
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle>Create Campaign</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Campaign Name *</Label>
            <Input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g., Q1 Product Launch" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Type</Label>
              <Select value={form.campaign_type} onValueChange={(v) => setForm(f => ({ ...f, campaign_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CAMPAIGN_TYPES.map(t => <SelectItem key={t.key} value={t.key}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Target Audience</Label>
              <Select value={form.target_audience} onValueChange={(v) => setForm(f => ({ ...f, target_audience: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{AUDIENCES.map(a => <SelectItem key={a.key} value={a.key}>{a.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          {form.campaign_type === "email" && (
            <div className="space-y-1.5">
              <Label className="text-xs">Subject Line</Label>
              <Input value={form.subject} onChange={(e) => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="Email subject" />
            </div>
          )}
          <div className="space-y-1.5">
            <Label className="text-xs">Message Body</Label>
            <Textarea rows={4} value={form.body} onChange={(e) => setForm(f => ({ ...f, body: e.target.value }))} placeholder="Campaign content..." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => create.mutate()} disabled={!form.name || create.isPending}>
            {create.isPending ? "Creating..." : "Create Draft"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CampaignDetailDialog({ campaign, open, onOpenChange }: { campaign: Campaign; open: boolean; onOpenChange: (v: boolean) => void }) {
  const statusCfg = STATUS_CONFIG[campaign.status] || STATUS_CONFIG.draft;
  const content = campaign.content as { subject?: string; body?: string } || {};
  const openRate = campaign.sent_count && campaign.open_count ? Math.round((campaign.open_count / campaign.sent_count) * 100) : 0;
  const clickRate = campaign.sent_count && campaign.click_count ? Math.round((campaign.click_count / campaign.sent_count) * 100) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {campaign.name}
            <Badge variant={statusCfg.variant} className="text-[10px] gap-1">{statusCfg.icon}{statusCfg.label}</Badge>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Type</p>
              <p className="capitalize">{campaign.campaign_type.replace("_", " ")}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Audience</p>
              <p className="capitalize">{(campaign.target_audience || "all").replace("_", " ")}</p>
            </div>
          </div>

          {/* Performance Metrics */}
          {campaign.sent_count && campaign.sent_count > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Performance</p>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: "Sent", value: campaign.sent_count || 0, icon: Send },
                  { label: "Opens", value: `${campaign.open_count || 0} (${openRate}%)`, icon: Eye },
                  { label: "Clicks", value: `${campaign.click_count || 0} (${clickRate}%)`, icon: MousePointer },
                  { label: "Conversions", value: campaign.conversion_count || 0, icon: Target },
                ].map((m) => (
                  <div key={m.label} className="text-center">
                    <m.icon className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-sm font-bold">{m.value}</p>
                    <p className="text-[9px] text-muted-foreground">{m.label}</p>
                  </div>
                ))}
              </div>
              {campaign.sent_count > 0 && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>Open Rate</span><span>{openRate}%</span>
                  </div>
                  <Progress value={openRate} className="h-1.5" />
                </div>
              )}
            </div>
          )}

          {/* Content Preview */}
          {(content.subject || content.body) && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Content</p>
              {content.subject && <p className="text-sm font-medium">{content.subject}</p>}
              {content.body && <p className="text-sm text-muted-foreground whitespace-pre-wrap">{content.body}</p>}
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            Created {format(new Date(campaign.created_at), "dd MMM yyyy, HH:mm")}
            {campaign.completed_at && <> • Completed {format(new Date(campaign.completed_at), "dd MMM yyyy, HH:mm")}</>}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
