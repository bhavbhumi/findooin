/**
 * AdminSalesManagement — Kanban-style sales pipeline with lead CRUD,
 * stage advancement, and conversion to invitations/contacts.
 */
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  TrendingUp, Plus, Search, MoreHorizontal, ArrowRight,
  Users, Target, XCircle, Phone, Mail, Building2,
  Clock, Star, AlertTriangle, UserPlus, Send, Link2, Trash2, Save
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow, format } from "date-fns";

const STAGES = [
  { key: "new", label: "New", color: "bg-blue-500" },
  { key: "contacted", label: "Contacted", color: "bg-yellow-500" },
  { key: "qualified", label: "Qualified", color: "bg-purple-500" },
  { key: "proposal", label: "Proposal", color: "bg-orange-500" },
  { key: "won", label: "Won", color: "bg-emerald-500" },
  { key: "lost", label: "Lost", color: "bg-destructive" },
];

const PRIORITIES = [
  { key: "high", label: "High", icon: AlertTriangle, color: "text-destructive" },
  { key: "medium", label: "Medium", icon: Star, color: "text-yellow-500" },
  { key: "low", label: "Low", icon: Clock, color: "text-muted-foreground" },
];

const SOURCES = ["registry", "invitation", "referral", "website", "event", "manual"];

type Lead = {
  id: string;
  lead_name: string;
  lead_email: string | null;
  lead_phone: string | null;
  company_name: string | null;
  lead_stage: string;
  lead_priority: string;
  lead_source: string;
  notes: string | null;
  assigned_to: string | null;
  last_contacted_at: string | null;
  invitation_id: string | null;
  registry_entity_id: string | null;
  metadata: any;
  created_at: string;
  updated_at: string;
};

export function AdminSalesManagement() {
  const [tab, setTab] = useState("pipeline");
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [convertLead, setConvertLead] = useState<Lead | null>(null);
  const qc = useQueryClient();

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["admin-sales-leads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales_leads")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Lead[];
    },
  });

  const updateLead = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Lead> & { id: string }) => {
      const { error } = await supabase.from("sales_leads").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-sales-leads"] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const moveStage = (id: string, stage: string) => {
    updateLead.mutate({ id, lead_stage: stage });
    toast.success(`Lead moved to ${stage}`);
  };

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      if (stageFilter !== "all" && l.lead_stage !== stageFilter) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        l.lead_name.toLowerCase().includes(q) ||
        l.lead_email?.toLowerCase().includes(q) ||
        l.company_name?.toLowerCase().includes(q)
      );
    });
  }, [leads, search, stageFilter]);

  const stats = useMemo(() => {
    const s: Record<string, number> = {};
    STAGES.forEach((st) => { s[st.key] = leads.filter((l) => l.lead_stage === st.key).length; });
    const conversionRate = leads.length > 0
      ? Math.round((s.won / leads.length) * 100)
      : 0;
    return { ...s, total: leads.length, conversionRate };
  }, [leads]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold font-heading flex items-center gap-2">
            <TrendingUp className="h-5 w-5" /> Sales Pipeline
          </h2>
          <p className="text-sm text-muted-foreground">Track leads from prospecting through conversion</p>
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Add Lead
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {STAGES.map((st) => (
          <Card key={st.key} className="cursor-pointer hover:ring-1 ring-primary/30 transition-all"
            onClick={() => setStageFilter(stageFilter === st.key ? "all" : st.key)}>
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <div className={`h-2 w-2 rounded-full ${st.color}`} />
                <span className="text-[10px] text-muted-foreground uppercase tracking-wide">{st.label}</span>
              </div>
              <p className="text-xl font-bold">{stats[st.key] || 0}</p>
            </CardContent>
          </Card>
        ))}
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <Target className="h-3 w-3 text-primary" />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Conv.</span>
            </div>
            <p className="text-xl font-bold">{stats.conversionRate}%</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>

        {/* Pipeline / Kanban View */}
        <TabsContent value="pipeline" className="mt-3">
          <div className="flex gap-3 overflow-x-auto pb-4">
            {STAGES.filter(s => s.key !== "lost").map((stage) => {
              const stageLeads = leads.filter((l) => l.lead_stage === stage.key);
              return (
                <div key={stage.key} className="min-w-[220px] max-w-[250px] flex-shrink-0">
                  <div className="flex items-center gap-2 mb-2 px-1">
                    <div className={`h-2 w-2 rounded-full ${stage.color}`} />
                    <span className="text-xs font-semibold uppercase tracking-wide">{stage.label}</span>
                    <Badge variant="secondary" className="text-[9px] ml-auto">{stageLeads.length}</Badge>
                  </div>
                  <div className="space-y-2">
                    {stageLeads.slice(0, 20).map((lead) => {
                      const priority = PRIORITIES.find((p) => p.key === lead.lead_priority);
                      return (
                        <Card key={lead.id} className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => setEditLead(lead)}>
                          <CardContent className="p-3 space-y-1.5">
                            <div className="flex items-start justify-between gap-1">
                              <p className="text-sm font-medium leading-tight truncate">{lead.lead_name}</p>
                              {priority && <priority.icon className={`h-3 w-3 shrink-0 ${priority.color}`} />}
                            </div>
                            {lead.company_name && (
                              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                <Building2 className="h-2.5 w-2.5" /> {lead.company_name}
                              </p>
                            )}
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="text-[8px] capitalize">{lead.lead_source}</Badge>
                              {lead.invitation_id && <Link2 className="h-2.5 w-2.5 text-primary" />}
                            </div>
                            {/* Stage advancement + convert */}
                            <div className="flex gap-1 pt-1">
                              {stage.key === "won" ? (
                                <Button size="sm" variant="outline"
                                  className="h-5 text-[9px] px-1.5 w-full text-primary"
                                  onClick={(e) => { e.stopPropagation(); setConvertLead(lead); }}>
                                  <UserPlus className="h-2.5 w-2.5 mr-0.5" /> Convert
                                </Button>
                              ) : (
                                <>
                                  {STAGES.filter(s =>
                                    STAGES.findIndex(x => x.key === s.key) > STAGES.findIndex(x => x.key === stage.key) && s.key !== "lost"
                                  ).slice(0, 1).map((next) => (
                                    <Button key={next.key} size="sm" variant="ghost"
                                      className="h-5 text-[9px] px-1.5 w-full"
                                      onClick={(e) => { e.stopPropagation(); moveStage(lead.id, next.key); }}>
                                      <ArrowRight className="h-2.5 w-2.5 mr-0.5" /> {next.label}
                                    </Button>
                                  ))}
                                  <Button size="sm" variant="ghost"
                                    className="h-5 text-[9px] px-1.5 text-destructive"
                                    onClick={(e) => { e.stopPropagation(); moveStage(lead.id, "lost"); }}>
                                    <XCircle className="h-2.5 w-2.5" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                    {stageLeads.length === 0 && (
                      <div className="text-center py-6 text-muted-foreground text-xs border border-dashed rounded-lg">
                        No leads
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* List View */}
        <TabsContent value="list" className="mt-3 space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search leads..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={stageFilter} onValueChange={setStageFilter}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Stage" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                {STAGES.map((s) => <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-4 space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No leads found</p>
                  <Button size="sm" variant="outline" className="mt-3" onClick={() => setCreateOpen(true)}>
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add your first lead
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Lead</TableHead>
                      <TableHead className="text-xs">Stage</TableHead>
                      <TableHead className="text-xs">Priority</TableHead>
                      <TableHead className="text-xs">Source</TableHead>
                      <TableHead className="text-xs">Contact</TableHead>
                      <TableHead className="text-xs">Linked</TableHead>
                      <TableHead className="text-xs w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((lead) => {
                      const stage = STAGES.find((s) => s.key === lead.lead_stage);
                      const priority = PRIORITIES.find((p) => p.key === lead.lead_priority);
                      return (
                        <TableRow key={lead.id} className="cursor-pointer" onClick={() => setEditLead(lead)}>
                          <TableCell>
                            <p className="text-sm font-medium">{lead.lead_name}</p>
                            {lead.company_name && <p className="text-[10px] text-muted-foreground">{lead.company_name}</p>}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <div className={`h-2 w-2 rounded-full ${stage?.color}`} />
                              <span className="text-xs capitalize">{lead.lead_stage}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {priority && (
                              <Badge variant="outline" className={`text-[10px] ${priority.color}`}>
                                {priority.label}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell><Badge variant="secondary" className="text-[9px] capitalize">{lead.lead_source}</Badge></TableCell>
                          <TableCell>
                            <div className="text-xs space-y-0.5">
                              {lead.lead_email && <p className="flex items-center gap-1"><Mail className="h-2.5 w-2.5" />{lead.lead_email}</p>}
                              {lead.lead_phone && <p className="flex items-center gap-1"><Phone className="h-2.5 w-2.5" />{lead.lead_phone}</p>}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {lead.invitation_id && <Badge variant="outline" className="text-[8px]">Invited</Badge>}
                              {lead.registry_entity_id && <Badge variant="outline" className="text-[8px]">Registry</Badge>}
                            </div>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => e.stopPropagation()}>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {STAGES.filter(s => s.key !== lead.lead_stage).map((s) => (
                                  <DropdownMenuItem key={s.key} onClick={(e) => { e.stopPropagation(); moveStage(lead.id, s.key); }}>
                                    <div className={`h-2 w-2 rounded-full ${s.color} mr-2`} /> Move to {s.label}
                                  </DropdownMenuItem>
                                ))}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setConvertLead(lead); }}>
                                  <UserPlus className="h-3.5 w-3.5 mr-2" /> Convert to Invitation
                                </DropdownMenuItem>
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
        </TabsContent>
      </Tabs>

      {/* Create Lead Dialog */}
      <CreateLeadDialog open={createOpen} onOpenChange={setCreateOpen} />

      {/* Edit Lead Dialog */}
      {editLead && (
        <EditLeadDialog
          lead={editLead}
          open={!!editLead}
          onOpenChange={(v) => { if (!v) setEditLead(null); }}
          onConvert={() => { setConvertLead(editLead); setEditLead(null); }}
        />
      )}

      {/* Convert Lead Dialog */}
      {convertLead && (
        <ConvertLeadDialog
          lead={convertLead}
          open={!!convertLead}
          onOpenChange={(v) => { if (!v) setConvertLead(null); }}
        />
      )}
    </div>
  );
}

/* ─── Create Lead Dialog ─── */
function CreateLeadDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    lead_name: "", lead_email: "", lead_phone: "", company_name: "",
    lead_stage: "new", lead_priority: "medium", lead_source: "manual", notes: "",
  });

  const create = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("sales_leads").insert({
        lead_name: form.lead_name,
        lead_email: form.lead_email || null,
        lead_phone: form.lead_phone || null,
        company_name: form.company_name || null,
        lead_stage: form.lead_stage,
        lead_priority: form.lead_priority,
        lead_source: form.lead_source,
        notes: form.notes || null,
        assigned_to: user.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-sales-leads"] });
      toast.success("Lead created successfully");
      onOpenChange(false);
      setForm({ lead_name: "", lead_email: "", lead_phone: "", company_name: "", lead_stage: "new", lead_priority: "medium", lead_source: "manual", notes: "" });
    },
    onError: (e: any) => toast.error(`Failed to create lead: ${e.message}`),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Lead</DialogTitle>
          <DialogDescription>Add a new lead to the sales pipeline.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Name *</Label>
              <Input value={form.lead_name} onChange={(e) => setForm(f => ({ ...f, lead_name: e.target.value }))} placeholder="Full name" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Company</Label>
              <Input value={form.company_name} onChange={(e) => setForm(f => ({ ...f, company_name: e.target.value }))} placeholder="Company name" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Email</Label>
              <Input type="email" value={form.lead_email} onChange={(e) => setForm(f => ({ ...f, lead_email: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Phone</Label>
              <Input value={form.lead_phone} onChange={(e) => setForm(f => ({ ...f, lead_phone: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Stage</Label>
              <Select value={form.lead_stage} onValueChange={(v) => setForm(f => ({ ...f, lead_stage: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{STAGES.map(s => <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Priority</Label>
              <Select value={form.lead_priority} onValueChange={(v) => setForm(f => ({ ...f, lead_priority: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PRIORITIES.map(p => <SelectItem key={p.key} value={p.key}>{p.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Source</Label>
              <Select value={form.lead_source} onValueChange={(v) => setForm(f => ({ ...f, lead_source: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{SOURCES.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Notes</Label>
            <Textarea rows={2} value={form.notes} onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => create.mutate()} disabled={!form.lead_name || create.isPending}>
            {create.isPending ? "Creating..." : "Create Lead"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Edit Lead Dialog ─── */
function EditLeadDialog({ lead, open, onOpenChange, onConvert }: {
  lead: Lead; open: boolean; onOpenChange: (v: boolean) => void; onConvert: () => void;
}) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    lead_name: lead.lead_name,
    lead_email: lead.lead_email || "",
    lead_phone: lead.lead_phone || "",
    company_name: lead.company_name || "",
    lead_stage: lead.lead_stage,
    lead_priority: lead.lead_priority,
    lead_source: lead.lead_source,
    notes: lead.notes || "",
  });

  const update = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("sales_leads").update({
        lead_name: form.lead_name,
        lead_email: form.lead_email || null,
        lead_phone: form.lead_phone || null,
        company_name: form.company_name || null,
        lead_stage: form.lead_stage,
        lead_priority: form.lead_priority,
        lead_source: form.lead_source,
        notes: form.notes || null,
        last_contacted_at: new Date().toISOString(),
      }).eq("id", lead.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-sales-leads"] });
      toast.success("Lead updated");
      onOpenChange(false);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteLead = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("sales_leads").delete().eq("id", lead.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-sales-leads"] });
      toast.success("Lead deleted");
      onOpenChange(false);
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Lead</DialogTitle>
          <DialogDescription>Update lead details or convert to invitation.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Name *</Label>
              <Input value={form.lead_name} onChange={(e) => setForm(f => ({ ...f, lead_name: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Company</Label>
              <Input value={form.company_name} onChange={(e) => setForm(f => ({ ...f, company_name: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Email</Label>
              <Input type="email" value={form.lead_email} onChange={(e) => setForm(f => ({ ...f, lead_email: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Phone</Label>
              <Input value={form.lead_phone} onChange={(e) => setForm(f => ({ ...f, lead_phone: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Stage</Label>
              <Select value={form.lead_stage} onValueChange={(v) => setForm(f => ({ ...f, lead_stage: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{STAGES.map(s => <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Priority</Label>
              <Select value={form.lead_priority} onValueChange={(v) => setForm(f => ({ ...f, lead_priority: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PRIORITIES.map(p => <SelectItem key={p.key} value={p.key}>{p.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Source</Label>
              <Select value={form.lead_source} onValueChange={(v) => setForm(f => ({ ...f, lead_source: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{SOURCES.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Notes</Label>
            <Textarea rows={3} value={form.notes} onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))} />
          </div>

          {/* Linked entities */}
          {(lead.invitation_id || lead.registry_entity_id) && (
            <div className="flex gap-2 flex-wrap">
              {lead.invitation_id && <Badge variant="secondary" className="text-xs"><Send className="h-3 w-3 mr-1" /> Linked to Invitation</Badge>}
              {lead.registry_entity_id && <Badge variant="secondary" className="text-xs"><Building2 className="h-3 w-3 mr-1" /> Linked to Registry</Badge>}
            </div>
          )}

          <div className="text-xs text-muted-foreground space-y-0.5">
            <p>Created: {format(new Date(lead.created_at), "dd MMM yyyy, HH:mm")}</p>
            {lead.last_contacted_at && <p>Last contacted: {formatDistanceToNow(new Date(lead.last_contacted_at), { addSuffix: true })}</p>}
          </div>
        </div>

        <Separator />

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <div className="flex gap-2 mr-auto">
            <Button variant="destructive" size="sm" onClick={() => deleteLead.mutate()} disabled={deleteLead.isPending}>
              <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
            </Button>
            <Button variant="outline" size="sm" onClick={onConvert}>
              <UserPlus className="h-3.5 w-3.5 mr-1" /> Convert to Invitation
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={() => update.mutate()} disabled={!form.lead_name || update.isPending}>
              <Save className="h-3.5 w-3.5 mr-1" /> {update.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Convert Lead → Invitation Dialog ─── */
function ConvertLeadDialog({ lead, open, onOpenChange }: {
  lead: Lead; open: boolean; onOpenChange: (v: boolean) => void;
}) {
  const qc = useQueryClient();
  const [targetRole, setTargetRole] = useState("intermediary");
  const [notes, setNotes] = useState(lead.notes || "");
  const [markWon, setMarkWon] = useState(lead.lead_stage !== "won");

  const convert = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      if (!lead.lead_email) throw new Error("Lead must have an email to convert to invitation");

      // 1. Create invitation
      const { data: invitation, error: invErr } = await supabase.from("invitations").insert({
        target_name: lead.lead_name,
        target_email: lead.lead_email,
        target_phone: lead.lead_phone || null,
        target_role: targetRole,
        notes: notes || null,
        created_by: user.id,
        registry_entity_id: lead.registry_entity_id || null,
      }).select("id").single();
      if (invErr) throw invErr;

      // 2. Link invitation back to lead + mark won
      const leadUpdates: Record<string, any> = {
        invitation_id: invitation.id,
        last_contacted_at: new Date().toISOString(),
      };
      if (markWon) leadUpdates.lead_stage = "won";

      const { error: leadErr } = await supabase.from("sales_leads")
        .update(leadUpdates).eq("id", lead.id);
      if (leadErr) throw leadErr;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-sales-leads"] });
      qc.invalidateQueries({ queryKey: ["admin-invitations"] });
      toast.success("Lead converted to invitation successfully!");
      onOpenChange(false);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const hasEmail = !!lead.lead_email;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" /> Convert Lead to Invitation
          </DialogTitle>
          <DialogDescription>
            This will create an invitation for <strong>{lead.lead_name}</strong> and link it to this lead.
          </DialogDescription>
        </DialogHeader>

        {!hasEmail && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
            <AlertTriangle className="h-4 w-4 inline mr-1" />
            This lead has no email address. An email is required to send an invitation.
          </div>
        )}

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Name</Label>
              <p className="text-sm font-medium">{lead.lead_name}</p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Email</Label>
              <p className="text-sm">{lead.lead_email || "—"}</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Invite as Role *</Label>
            <Select value={targetRole} onValueChange={setTargetRole}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="intermediary">Intermediary (MFD / RIA / Agent)</SelectItem>
                <SelectItem value="issuer">Issuer (AMC / Insurance Co.)</SelectItem>
                <SelectItem value="investor">Investor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Invitation Notes</Label>
            <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional context..." />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="markWon"
              checked={markWon}
              onChange={(e) => setMarkWon(e.target.checked)}
              className="rounded border-border"
            />
            <Label htmlFor="markWon" className="text-xs">Mark lead as "Won" after conversion</Label>
          </div>

          {lead.registry_entity_id && (
            <Badge variant="secondary" className="text-xs">
              <Building2 className="h-3 w-3 mr-1" /> Will link registry entity to invitation
            </Badge>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => convert.mutate()} disabled={!hasEmail || convert.isPending}>
            <Send className="h-3.5 w-3.5 mr-1" />
            {convert.isPending ? "Converting..." : "Create Invitation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
