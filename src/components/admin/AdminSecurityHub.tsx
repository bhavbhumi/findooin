/**
 * AdminSecurityHub — Unified security management with VAPT Dashboard,
 * Incident Reporting, Compliance Tracker, and Security Alerts.
 * Admin-only access via RLS.
 */
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Shield, AlertTriangle, CheckCircle2, Clock, Bug, Eye, EyeOff,
  Plus, FileText, Activity, ShieldAlert, ShieldCheck, Bell,
  XCircle, AlertCircle, Info, Loader2, Search, RefreshCcw
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

/* ─────── helpers ─────── */

const severityColor: Record<string, string> = {
  critical: "bg-red-600 text-white",
  high: "bg-orange-500 text-white",
  medium: "bg-yellow-500 text-black",
  low: "bg-blue-500 text-white",
  info: "bg-muted text-muted-foreground",
};

const statusColor: Record<string, string> = {
  open: "bg-red-500/15 text-red-700 border-red-300",
  investigating: "bg-orange-500/15 text-orange-700 border-orange-300",
  mitigated: "bg-yellow-500/15 text-yellow-700 border-yellow-300",
  resolved: "bg-green-500/15 text-green-700 border-green-300",
  closed: "bg-muted text-muted-foreground border-border",
};

const complianceStatusColor: Record<string, string> = {
  not_started: "bg-muted text-muted-foreground",
  in_progress: "bg-blue-500/15 text-blue-700",
  implemented: "bg-green-500/15 text-green-700",
  verified: "bg-emerald-600 text-white",
  non_compliant: "bg-red-500/15 text-red-700",
};

const alertIcon: Record<string, React.ReactNode> = {
  critical: <XCircle className="h-4 w-4 text-red-500" />,
  warning: <AlertCircle className="h-4 w-4 text-orange-500" />,
  info: <Info className="h-4 w-4 text-blue-500" />,
  resolved: <CheckCircle2 className="h-4 w-4 text-green-500" />,
};

/* ─────── VAPT Dashboard Tab ─────── */

function VAPTDashboard() {
  const { data: scans, isLoading } = useQuery({
    queryKey: ["vapt-scans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vapt_scans")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });

  const latestScan = scans?.[0];
  const totalFindings = latestScan
    ? latestScan.findings_critical + latestScan.findings_high + latestScan.findings_medium + latestScan.findings_low + latestScan.findings_info
    : 0;

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Critical", count: latestScan?.findings_critical ?? 0, color: "text-red-600", bg: "bg-red-50 dark:bg-red-950/30" },
          { label: "High", count: latestScan?.findings_high ?? 0, color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-950/30" },
          { label: "Medium", count: latestScan?.findings_medium ?? 0, color: "text-yellow-600", bg: "bg-yellow-50 dark:bg-yellow-950/30" },
          { label: "Low", count: latestScan?.findings_low ?? 0, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/30" },
          { label: "Info", count: latestScan?.findings_info ?? 0, color: "text-muted-foreground", bg: "bg-muted/50" },
        ].map(({ label, count, color, bg }) => (
          <Card key={label} className={bg}>
            <CardContent className="pt-4 pb-3 text-center">
              <p className={`text-2xl font-bold ${color}`}>{count}</p>
              <p className="text-xs text-muted-foreground mt-1">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {latestScan && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4" /> Latest Scan
            </CardTitle>
            <CardDescription>
              {latestScan.scanner_name} · {latestScan.scan_type.replace(/_/g, " ")} · {totalFindings} findings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Status</span>
                <Badge className={`ml-2 ${latestScan.status === "completed" ? "bg-green-600" : "bg-yellow-500"}`}>
                  {latestScan.status}
                </Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Started</span>
                <p className="font-medium">{latestScan.started_at ? format(new Date(latestScan.started_at), "PPp") : "—"}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Completed</span>
                <p className="font-medium">{latestScan.completed_at ? format(new Date(latestScan.completed_at), "PPp") : "—"}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Conducted by</span>
                <p className="font-medium">{latestScan.conducted_by || "—"}</p>
              </div>
            </div>
            {latestScan.summary && <p className="mt-3 text-sm text-muted-foreground">{latestScan.summary}</p>}
          </CardContent>
        </Card>
      )}

      {/* Scan history */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Scan History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : !scans?.length ? (
            <p className="text-center text-muted-foreground py-8">No VAPT scans recorded yet. Add your first scan result.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Scanner</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">C</TableHead>
                  <TableHead className="text-center">H</TableHead>
                  <TableHead className="text-center">M</TableHead>
                  <TableHead className="text-center">L</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scans.map((scan) => (
                  <TableRow key={scan.id}>
                    <TableCell className="text-sm">{format(new Date(scan.created_at), "PP")}</TableCell>
                    <TableCell className="text-sm capitalize">{scan.scan_type.replace(/_/g, " ")}</TableCell>
                    <TableCell className="text-sm">{scan.scanner_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs capitalize">{scan.status}</Badge>
                    </TableCell>
                    <TableCell className="text-center font-bold text-red-600">{scan.findings_critical}</TableCell>
                    <TableCell className="text-center font-bold text-orange-600">{scan.findings_high}</TableCell>
                    <TableCell className="text-center font-bold text-yellow-600">{scan.findings_medium}</TableCell>
                    <TableCell className="text-center text-blue-600">{scan.findings_low}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* ─────── Incident Reporting Tab ─────── */

function IncidentReporting() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filter, setFilter] = useState<string>("all");

  const { data: incidents, isLoading } = useQuery({
    queryKey: ["security-incidents", filter],
    queryFn: async () => {
      let q = supabase.from("security_incidents").select("*").order("created_at", { ascending: false }).limit(100);
      if (filter !== "all") q = q.eq("status", filter);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (inc: { title: string; description: string; severity: string; category: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from("security_incidents").insert({
        ...inc,
        reported_by: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["security-incidents"] });
      toast.success("Incident reported");
      setDialogOpen(false);
    },
    onError: () => toast.error("Failed to create incident"),
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("security_incidents").update({
        status,
        ...(status === "resolved" || status === "closed" ? { resolved_at: new Date().toISOString() } : {}),
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["security-incidents"] });
      toast.success("Status updated");
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="investigating">Investigating</SelectItem>
            <SelectItem value="mitigated">Mitigated</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Report Incident</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Report Security Incident</DialogTitle></DialogHeader>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                createMutation.mutate({
                  title: fd.get("title") as string,
                  description: fd.get("description") as string,
                  severity: fd.get("severity") as string,
                  category: fd.get("category") as string,
                });
              }}
            >
              <div><Label>Title</Label><Input name="title" required /></div>
              <div><Label>Description</Label><Textarea name="description" required rows={3} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Severity</Label>
                  <select name="severity" className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm" defaultValue="medium">
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                    <option value="info">Informational</option>
                  </select>
                </div>
                <div>
                  <Label>Category</Label>
                  <select name="category" className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm" defaultValue="other">
                    <option value="data_breach">Data Breach</option>
                    <option value="unauthorized_access">Unauthorized Access</option>
                    <option value="malware">Malware</option>
                    <option value="phishing">Phishing</option>
                    <option value="ddos">DDoS</option>
                    <option value="vulnerability">Vulnerability</option>
                    <option value="policy_violation">Policy Violation</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <Button type="submit" disabled={createMutation.isPending} className="w-full">
                {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                Submit Report
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : !incidents?.length ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No incidents recorded. Good news! 🎉</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {incidents.map((inc) => (
            <Card key={inc.id}>
              <CardContent className="py-3 px-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={severityColor[inc.severity] + " text-xs"}>{inc.severity}</Badge>
                      <Badge variant="outline" className={statusColor[inc.status] + " text-xs"}>{inc.status}</Badge>
                      <Badge variant="outline" className="text-xs capitalize">{inc.category.replace(/_/g, " ")}</Badge>
                    </div>
                    <h4 className="font-medium mt-1.5 text-sm">{inc.title}</h4>
                    {inc.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{inc.description}</p>}
                    <p className="text-xs text-muted-foreground mt-1">
                      Detected: {format(new Date(inc.detected_at), "PPp")}
                      {inc.resolved_at && ` · Resolved: ${format(new Date(inc.resolved_at), "PPp")}`}
                    </p>
                  </div>
                  <Select
                    value={inc.status}
                    onValueChange={(v) => updateStatus.mutate({ id: inc.id, status: v })}
                  >
                    <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="investigating">Investigating</SelectItem>
                      <SelectItem value="mitigated">Mitigated</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────── Compliance Tracker Tab ─────── */

function ComplianceTracker() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [framework, setFramework] = useState<string>("all");

  const { data: items, isLoading } = useQuery({
    queryKey: ["compliance-items", framework],
    queryFn: async () => {
      let q = supabase.from("compliance_items").select("*").order("framework").order("control_id");
      if (framework !== "all") q = q.eq("framework", framework);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (item: { framework: string; control_id: string; title: string; description: string; owner: string }) => {
      const { error } = await supabase.from("compliance_items").insert(item);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["compliance-items"] });
      toast.success("Compliance item added");
      setDialogOpen(false);
    },
    onError: () => toast.error("Failed to add item"),
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("compliance_items").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["compliance-items"] });
      toast.success("Updated");
    },
  });

  // Stats
  const stats = items?.reduce(
    (acc, i) => {
      acc[i.status] = (acc[i.status] || 0) + 1;
      acc.total += 1;
      return acc;
    },
    { total: 0 } as Record<string, number>
  ) ?? { total: 0 };

  const completionPct = stats.total > 0 ? Math.round(((stats.verified || 0) + (stats.implemented || 0)) / stats.total * 100) : 0;

  const frameworkLabels: Record<string, string> = {
    soc2: "SOC 2", iso27001: "ISO 27001", gdpr: "GDPR", dpdp: "DPDP Act",
    sebi: "SEBI", pci_dss: "PCI DSS", internal: "Internal",
  };

  return (
    <div className="space-y-4">
      {/* Progress summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="pt-4 pb-3 text-center">
          <p className="text-2xl font-bold text-primary">{completionPct}%</p>
          <p className="text-xs text-muted-foreground">Compliance</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 pb-3 text-center">
          <p className="text-2xl font-bold text-green-600">{(stats.verified || 0) + (stats.implemented || 0)}</p>
          <p className="text-xs text-muted-foreground">Completed</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 pb-3 text-center">
          <p className="text-2xl font-bold text-blue-600">{stats.in_progress || 0}</p>
          <p className="text-xs text-muted-foreground">In Progress</p>
        </CardContent></Card>
        <Card><CardContent className="pt-4 pb-3 text-center">
          <p className="text-2xl font-bold text-red-600">{stats.non_compliant || 0}</p>
          <p className="text-xs text-muted-foreground">Non-Compliant</p>
        </CardContent></Card>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select value={framework} onValueChange={setFramework}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Frameworks</SelectItem>
            {Object.entries(frameworkLabels).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Control</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Compliance Control</DialogTitle></DialogHeader>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                createMutation.mutate({
                  framework: fd.get("framework") as string,
                  control_id: fd.get("control_id") as string,
                  title: fd.get("title") as string,
                  description: fd.get("description") as string,
                  owner: fd.get("owner") as string,
                });
              }}
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Framework</Label>
                  <select name="framework" className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm" defaultValue="internal">
                    {Object.entries(frameworkLabels).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
                <div><Label>Control ID</Label><Input name="control_id" required placeholder="e.g. CC6.1" /></div>
              </div>
              <div><Label>Title</Label><Input name="title" required /></div>
              <div><Label>Description</Label><Textarea name="description" rows={2} /></div>
              <div><Label>Owner</Label><Input name="owner" placeholder="Team or person responsible" /></div>
              <Button type="submit" disabled={createMutation.isPending} className="w-full">Add Control</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : !items?.length ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No compliance controls added yet.</CardContent></Card>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Framework</TableHead>
              <TableHead>Control</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <Badge variant="outline" className="text-xs">{frameworkLabels[item.framework] || item.framework}</Badge>
                </TableCell>
                <TableCell className="font-mono text-xs">{item.control_id}</TableCell>
                <TableCell className="text-sm">{item.title}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{item.owner || "—"}</TableCell>
                <TableCell>
                  <Select value={item.status} onValueChange={(v) => updateStatus.mutate({ id: item.id, status: v })}>
                    <SelectTrigger className="w-32 h-7 text-xs">
                      <span className="flex items-center gap-1">
                        <span className={`inline-block w-2 h-2 rounded-full ${
                          item.status === "verified" ? "bg-emerald-500" :
                          item.status === "implemented" ? "bg-green-500" :
                          item.status === "in_progress" ? "bg-blue-500" :
                          item.status === "non_compliant" ? "bg-red-500" : "bg-muted-foreground"
                        }`} />
                        <SelectValue />
                      </span>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not_started">Not Started</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="implemented">Implemented</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                      <SelectItem value="non_compliant">Non-Compliant</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

/* ─────── Security Alerts Tab ─────── */

function SecurityAlerts() {
  const queryClient = useQueryClient();
  const [showAcknowledged, setShowAcknowledged] = useState(false);

  const { data: alerts, isLoading } = useQuery({
    queryKey: ["security-alerts", showAcknowledged],
    queryFn: async () => {
      let q = supabase.from("security_alerts").select("*").order("created_at", { ascending: false }).limit(100);
      if (!showAcknowledged) q = q.eq("is_acknowledged", false);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });

  const ackMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from("security_alerts").update({
        is_acknowledged: true,
        acknowledged_by: user?.id,
        acknowledged_at: new Date().toISOString(),
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["security-alerts"] });
      toast.success("Alert acknowledged");
    },
  });

  const unackCount = alerts?.filter((a) => !a.is_acknowledged).length ?? 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button
          size="sm"
          variant={showAcknowledged ? "default" : "outline"}
          onClick={() => setShowAcknowledged(!showAcknowledged)}
        >
          {showAcknowledged ? <Eye className="h-4 w-4 mr-1" /> : <EyeOff className="h-4 w-4 mr-1" />}
          {showAcknowledged ? "Showing All" : "Hiding Acknowledged"}
        </Button>
        {unackCount > 0 && (
          <Badge variant="destructive" className="text-xs">{unackCount} unacknowledged</Badge>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : !alerts?.length ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">
          {showAcknowledged ? "No security alerts recorded." : "No unacknowledged alerts. All clear! ✅"}
        </CardContent></Card>
      ) : (
        <div className="space-y-2">
          {alerts.map((alert) => (
            <Card key={alert.id} className={!alert.is_acknowledged ? "border-l-4 border-l-yellow-500" : "opacity-70"}>
              <CardContent className="py-3 px-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="mt-0.5">{alertIcon[alert.alert_type]}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-sm">{alert.title}</h4>
                        <Badge variant="outline" className="text-[10px] capitalize">{alert.source.replace(/_/g, " ")}</Badge>
                      </div>
                      {alert.description && <p className="text-xs text-muted-foreground mt-1">{alert.description}</p>}
                      <p className="text-xs text-muted-foreground mt-1">{format(new Date(alert.created_at), "PPp")}</p>
                    </div>
                  </div>
                  {!alert.is_acknowledged && (
                    <Button size="sm" variant="outline" className="shrink-0 text-xs h-7" onClick={() => ackMutation.mutate(alert.id)}>
                      <CheckCircle2 className="h-3 w-3 mr-1" /> Ack
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────── Main Export ─────── */

export function AdminSecurityHub() {
  const { data: alertCount } = useQuery({
    queryKey: ["security-alerts-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("security_alerts")
        .select("*", { count: "exact", head: true })
        .eq("is_acknowledged", false);
      if (error) return 0;
      return count ?? 0;
    },
  });

  const { data: openIncidents } = useQuery({
    queryKey: ["security-incidents-open-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("security_incidents")
        .select("*", { count: "exact", head: true })
        .in("status", ["open", "investigating"]);
      if (error) return 0;
      return count ?? 0;
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <ShieldAlert className="h-5 w-5" /> Security Hub
        </h2>
        <p className="text-sm text-muted-foreground">VAPT, incident management, compliance, and security alerts</p>
      </div>

      <Tabs defaultValue="vapt" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="vapt" className="text-xs sm:text-sm gap-1">
            <Shield className="h-3.5 w-3.5 hidden sm:inline" /> VAPT
          </TabsTrigger>
          <TabsTrigger value="incidents" className="text-xs sm:text-sm gap-1 relative">
            <AlertTriangle className="h-3.5 w-3.5 hidden sm:inline" /> Incidents
            {(openIncidents ?? 0) > 0 && (
              <Badge variant="destructive" className="absolute -top-1.5 -right-1 text-[9px] h-4 min-w-4 px-1">{openIncidents}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="compliance" className="text-xs sm:text-sm gap-1">
            <ShieldCheck className="h-3.5 w-3.5 hidden sm:inline" /> Compliance
          </TabsTrigger>
          <TabsTrigger value="alerts" className="text-xs sm:text-sm gap-1 relative">
            <Bell className="h-3.5 w-3.5 hidden sm:inline" /> Alerts
            {(alertCount ?? 0) > 0 && (
              <Badge variant="destructive" className="absolute -top-1.5 -right-1 text-[9px] h-4 min-w-4 px-1">{alertCount}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="vapt"><VAPTDashboard /></TabsContent>
        <TabsContent value="incidents"><IncidentReporting /></TabsContent>
        <TabsContent value="compliance"><ComplianceTracker /></TabsContent>
        <TabsContent value="alerts"><SecurityAlerts /></TabsContent>
      </Tabs>
    </div>
  );
}
