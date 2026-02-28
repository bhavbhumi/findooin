import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus, Upload, Database, Search, MoreHorizontal,
  Archive, RotateCcw, Send, Mail, Users, Clock, CheckCircle2, XCircle
} from "lucide-react";
import { useInvitations, useArchiveInvitation, useReactivateInvitation, useUpdateInvitation } from "@/hooks/useInvitations";
import { CreateInviteDialog } from "./CreateInviteDialog";
import { BulkImportDialog } from "./BulkImportDialog";
import { RegistryImportDialog } from "./RegistryImportDialog";
import { format, formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  active: { label: "Active", variant: "default" },
  archived: { label: "Archived", variant: "secondary" },
  converted: { label: "Converted", variant: "outline" },
  stopped: { label: "Stopped", variant: "destructive" },
};

export function InvitationsPipeline() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [registryOpen, setRegistryOpen] = useState(false);

  const { data: invitations = [], isLoading } = useInvitations({ status: statusFilter, role: roleFilter });
  const archive = useArchiveInvitation();
  const reactivate = useReactivateInvitation();
  const update = useUpdateInvitation();

  const filtered = invitations.filter((inv) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      inv.target_name?.toLowerCase().includes(q) ||
      inv.target_email.toLowerCase().includes(q) ||
      inv.target_phone?.toLowerCase().includes(q)
    );
  });

  // Stats
  const stats = {
    total: invitations.length,
    active: invitations.filter((i) => i.status === "active").length,
    archived: invitations.filter((i) => i.status === "archived").length,
    converted: invitations.filter((i) => i.status === "converted").length,
  };

  const handleMarkConverted = (id: string) => {
    update.mutate({ id, status: "converted" }, { onSuccess: () => toast.success("Marked as converted") });
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Invites", value: stats.total, icon: Mail, color: "text-primary" },
          { label: "Active", value: stats.active, icon: Send, color: "text-emerald-500" },
          { label: "Archived", value: stats.archived, icon: Clock, color: "text-muted-foreground" },
          { label: "Converted", value: stats.converted, icon: CheckCircle2, color: "text-blue-500" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-3 flex items-center gap-3">
              <div className={`h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0 ${stat.color}`}>
                <stat.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-lg font-bold leading-none">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Toolbar */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              Invitations Pipeline
            </CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <Button size="sm" onClick={() => setCreateOpen(true)}>
                <Plus className="h-3.5 w-3.5 mr-1" /> Single Invite
              </Button>
              <Button size="sm" variant="outline" onClick={() => setBulkOpen(true)}>
                <Upload className="h-3.5 w-3.5 mr-1" /> CSV Import
              </Button>
              <Button size="sm" variant="outline" onClick={() => setRegistryOpen(true)}>
                <Database className="h-3.5 w-3.5 mr-1" /> From Registry
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
                <SelectItem value="converted">Converted</SelectItem>
                <SelectItem value="stopped">Stopped</SelectItem>
              </SelectContent>
            </Select>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Role" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="intermediary">Intermediary</SelectItem>
                <SelectItem value="issuer">Issuer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Mail className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No invitations found</p>
              <p className="text-xs mt-1">Create a single invite or import in bulk to get started</p>
            </div>
          ) : (
            <div className="border rounded-md overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Contact</TableHead>
                    <TableHead className="text-xs">Role</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs text-center">Reminders</TableHead>
                    <TableHead className="text-xs">Source</TableHead>
                    <TableHead className="text-xs">Created</TableHead>
                    <TableHead className="text-xs w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((inv) => {
                    const statusCfg = STATUS_CONFIG[inv.status] || STATUS_CONFIG.active;
                    const registry = (inv as any).registry_entities;
                    return (
                      <TableRow key={inv.id}>
                        <TableCell>
                          <div>
                            <p className="text-sm font-medium">{inv.target_name || "—"}</p>
                            <p className="text-xs text-muted-foreground">{inv.target_email}</p>
                            {inv.target_phone && (
                              <p className="text-[10px] text-muted-foreground">{inv.target_phone}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px] capitalize">{inv.target_role}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusCfg.variant} className="text-[10px]">{statusCfg.label}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="text-sm font-mono font-medium">{inv.reminder_count}/{inv.max_reminders}</span>
                          {inv.last_reminder_at && (
                            <p className="text-[10px] text-muted-foreground">
                              Last: {formatDistanceToNow(new Date(inv.last_reminder_at), { addSuffix: true })}
                            </p>
                          )}
                        </TableCell>
                        <TableCell>
                          {registry ? (
                            <div>
                              <Badge variant="secondary" className="text-[9px]">{registry.source}</Badge>
                              {registry.registration_number && (
                                <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                                  #{registry.registration_number}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">Manual</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <p className="text-xs">{format(new Date(inv.created_at), "dd MMM yyyy")}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {formatDistanceToNow(new Date(inv.created_at), { addSuffix: true })}
                          </p>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {inv.status === "active" && (
                                <>
                                  <DropdownMenuItem onClick={() => archive.mutate(inv.id)}>
                                    <Archive className="h-3.5 w-3.5 mr-2" /> Archive
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleMarkConverted(inv.id)}>
                                    <CheckCircle2 className="h-3.5 w-3.5 mr-2" /> Mark Converted
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => update.mutate({ id: inv.id, status: "stopped" })}>
                                    <XCircle className="h-3.5 w-3.5 mr-2" /> Stop
                                  </DropdownMenuItem>
                                </>
                              )}
                              {inv.status === "archived" && (
                                <DropdownMenuItem onClick={() => reactivate.mutate(inv.id)}>
                                  <RotateCcw className="h-3.5 w-3.5 mr-2" /> Reactivate
                                </DropdownMenuItem>
                              )}
                              {inv.status === "stopped" && (
                                <DropdownMenuItem onClick={() => reactivate.mutate(inv.id)}>
                                  <RotateCcw className="h-3.5 w-3.5 mr-2" /> Reactivate
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
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CreateInviteDialog open={createOpen} onOpenChange={setCreateOpen} />
      <BulkImportDialog open={bulkOpen} onOpenChange={setBulkOpen} />
      <RegistryImportDialog open={registryOpen} onOpenChange={setRegistryOpen} />
    </div>
  );
}
