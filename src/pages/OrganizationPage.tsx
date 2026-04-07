import { useParams } from "react-router-dom";
import { usePageMeta } from "@/hooks/usePageMeta";
import AppLayout from "@/components/AppLayout";
import { useOrganization, useOrgBranches, useOrgDepartments, useOrgMembers, useClaimMembership, useVerifyMember, useManageBranch, useManageDepartment } from "@/hooks/useOrganizations";
import { FindooLoader } from "@/components/FindooLoader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Building2, MapPin, Users, CheckCircle2, Clock, XCircle, Globe, Shield, Plus, UserPlus } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function OrganizationPage() {
  const { slug } = useParams<{ slug: string }>();
  usePageMeta({ title: "Organization", description: "Organization page" });

  const { data: org, isLoading } = useOrganization(slug);
  const { data: branches = [] } = useOrgBranches(org?.id);
  const { data: departments = [] } = useOrgDepartments(org?.id);
  const [memberTab, setMemberTab] = useState("verified");
  const { data: members = [] } = useOrgMembers(org?.id, memberTab);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const claimMembership = useClaimMembership();
  const verifyMember = useVerifyMember();
  const manageBranch = useManageBranch();
  const manageDepartment = useManageDepartment();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id ?? null));
  }, []);

  const isOrgAdmin = org?.claimed_by === currentUserId;
  const hq = branches.find(b => b.is_headquarters);

  if (isLoading) return <AppLayout><div className="flex justify-center py-20"><FindooLoader text="Loading..." /></div></AppLayout>;
  if (!org) return <AppLayout><div className="text-center py-20 text-muted-foreground">Organization not found</div></AppLayout>;

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
        {/* Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center shrink-0">
                {org.logo_url ? (
                  <img src={org.logo_url} alt={org.name} className="w-full h-full rounded-xl object-cover" />
                ) : (
                  <Building2 className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-bold text-foreground">{org.name}</h1>
                  {org.is_verified && (
                    <Badge variant="default" className="bg-primary/10 text-primary border-primary/20">
                      <Shield className="h-3 w-3 mr-1" /> Verified
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{org.industry}</p>
                {hq && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="h-3.5 w-3.5" /> {hq.city}{hq.state ? `, ${hq.state}` : ""}
                  </p>
                )}
                {org.website && (
                  <a href={org.website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary flex items-center gap-1 mt-1 hover:underline">
                    <Globe className="h-3.5 w-3.5" /> {org.website.replace(/^https?:\/\//, "")}
                  </a>
                )}
                {org.description && <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{org.description}</p>}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex gap-6 mt-4 pt-4 border-t border-border text-sm">
              <div className="text-center">
                <div className="font-semibold text-foreground">{members.length}</div>
                <div className="text-muted-foreground text-xs">Team Members</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-foreground">{branches.length}</div>
                <div className="text-muted-foreground text-xs">Locations</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-foreground">{departments.length}</div>
                <div className="text-muted-foreground text-xs">Departments</div>
              </div>
              {org.founded_year && (
                <div className="text-center">
                  <div className="font-semibold text-foreground">{org.founded_year}</div>
                  <div className="text-muted-foreground text-xs">Founded</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="team" className="space-y-4">
          <TabsList>
            <TabsTrigger value="team"><Users className="h-4 w-4 mr-1" /> Team</TabsTrigger>
            <TabsTrigger value="locations"><MapPin className="h-4 w-4 mr-1" /> Locations</TabsTrigger>
            {isOrgAdmin && <TabsTrigger value="requests"><Clock className="h-4 w-4 mr-1" /> Requests</TabsTrigger>}
          </TabsList>

          {/* Team Tab */}
          <TabsContent value="team" className="space-y-4">
            {!isOrgAdmin && currentUserId && (
              <ClaimMembershipCard orgId={org.id} departments={departments} branches={branches} onClaim={claimMembership.mutate} />
            )}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {members.filter(m => m.status === "verified").map(m => (
                <MemberCard key={m.id} member={m} isAdmin={isOrgAdmin} onAction={verifyMember.mutate} />
              ))}
              {members.filter(m => m.status === "verified").length === 0 && (
                <p className="text-sm text-muted-foreground col-span-full text-center py-8">No verified team members yet</p>
              )}
            </div>
          </TabsContent>

          {/* Locations Tab */}
          <TabsContent value="locations" className="space-y-4">
            {isOrgAdmin && <AddBranchCard orgId={org.id} onSave={manageBranch.mutate} />}
            <div className="grid gap-3 sm:grid-cols-2">
              {branches.map(b => (
                <Card key={b.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium text-foreground flex items-center gap-2">
                          {b.branch_name}
                          {b.is_headquarters && <Badge variant="outline" className="text-xs">HQ</Badge>}
                        </div>
                        {b.address_line && <p className="text-sm text-muted-foreground mt-1">{b.address_line}</p>}
                        <p className="text-sm text-muted-foreground">
                          {[b.city, b.state, b.pincode].filter(Boolean).join(", ")}
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-xs capitalize">{b.branch_type}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Pending Requests (Admin only) */}
          {isOrgAdmin && (
            <TabsContent value="requests" className="space-y-3">
              <PendingRequests orgId={org.id} onAction={verifyMember.mutate} />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </AppLayout>
  );
}

/* ── Sub-components ── */

function MemberCard({ member, isAdmin, onAction }: { member: any; isAdmin: boolean; onAction: any }) {
  const profile = member.profile || {};
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={profile.avatar_url} />
            <AvatarFallback>{(profile.full_name || "?")[0]}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="font-medium text-sm text-foreground truncate">{profile.full_name || "Unknown"}</div>
            <div className="text-xs text-muted-foreground truncate">{member.designation}</div>
            {member.department?.name && (
              <div className="text-xs text-muted-foreground">{member.department.name}</div>
            )}
          </div>
          {member.status === "verified" && <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />}
        </div>
        {member.branch?.city && (
          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
            <MapPin className="h-3 w-3" /> {member.branch.branch_name}, {member.branch.city}
          </p>
        )}
        {isAdmin && member.status === "verified" && (
          <Button size="sm" variant="outline" className="mt-2 w-full text-xs" onClick={() => onAction({ memberId: member.id, action: "alumni" })}>
            Mark as Alumni
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function ClaimMembershipCard({ orgId, departments, branches, onClaim }: any) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ designation: "", department_id: "", branch_id: "", joined_at: "" });

  const handleSubmit = () => {
    if (!form.designation.trim()) { toast.error("Designation is required"); return; }
    onClaim({ org_id: orgId, ...form });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm"><UserPlus className="h-4 w-4 mr-1" /> I work here</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Claim your role</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div><Label>Designation *</Label><Input value={form.designation} onChange={e => setForm(p => ({ ...p, designation: e.target.value }))} placeholder="e.g. Senior Advisor" /></div>
          {departments.length > 0 && (
            <div><Label>Department</Label>
              <Select value={form.department_id} onValueChange={v => setForm(p => ({ ...p, department_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent>{departments.map((d: any) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          )}
          {branches.length > 0 && (
            <div><Label>Branch</Label>
              <Select value={form.branch_id} onValueChange={v => setForm(p => ({ ...p, branch_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Select branch" /></SelectTrigger>
                <SelectContent>{branches.map((b: any) => <SelectItem key={b.id} value={b.id}>{b.branch_name}{b.city ? ` — ${b.city}` : ""}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          )}
          <div><Label>Joined Date</Label><Input type="date" value={form.joined_at} onChange={e => setForm(p => ({ ...p, joined_at: e.target.value }))} /></div>
          <Button onClick={handleSubmit} className="w-full">Submit for Verification</Button>
          <p className="text-xs text-muted-foreground text-center">Your claim will be visible as "Pending" until the org admin approves it.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PendingRequests({ orgId, onAction }: { orgId: string; onAction: any }) {
  const { data: pending = [] } = useOrgMembers(orgId, "pending");

  if (pending.length === 0) return <p className="text-sm text-muted-foreground text-center py-8">No pending requests</p>;

  return (
    <div className="space-y-3">
      {pending.map(m => {
        const profile = (m as any).profile || {};
        return (
          <Card key={m.id}>
            <CardContent className="pt-4 flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={profile.avatar_url} />
                <AvatarFallback>{(profile.full_name || "?")[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{profile.full_name}</div>
                <div className="text-xs text-muted-foreground">Claims: {m.designation}</div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="default" onClick={() => onAction({ memberId: m.id, action: "verified" })}>
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Approve
                </Button>
                <Button size="sm" variant="outline" onClick={() => onAction({ memberId: m.id, action: "rejected", reason: "Not verified" })}>
                  <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function AddBranchCard({ orgId, onSave }: any) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ branch_name: "", branch_type: "branch", city: "", state: "", address_line: "", pincode: "", is_headquarters: false });

  const handleSubmit = () => {
    if (!form.branch_name.trim()) { toast.error("Branch name required"); return; }
    onSave({ org_id: orgId, ...form });
    setOpen(false);
    setForm({ branch_name: "", branch_type: "branch", city: "", state: "", address_line: "", pincode: "", is_headquarters: false });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm"><Plus className="h-4 w-4 mr-1" /> Add Location</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Add Office Location</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>Name *</Label><Input value={form.branch_name} onChange={e => setForm(p => ({ ...p, branch_name: e.target.value }))} placeholder="e.g. Mumbai — Nariman Point" /></div>
          <div><Label>Type</Label>
            <Select value={form.branch_type} onValueChange={v => setForm(p => ({ ...p, branch_type: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="head_office">Head Office</SelectItem>
                <SelectItem value="branch">Branch Office</SelectItem>
                <SelectItem value="regional">Regional Office</SelectItem>
                <SelectItem value="representative">Representative Office</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div><Label>Address</Label><Input value={form.address_line} onChange={e => setForm(p => ({ ...p, address_line: e.target.value }))} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>City</Label><Input value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} /></div>
            <div><Label>State</Label><Input value={form.state} onChange={e => setForm(p => ({ ...p, state: e.target.value }))} /></div>
          </div>
          <div><Label>Pincode</Label><Input value={form.pincode} onChange={e => setForm(p => ({ ...p, pincode: e.target.value }))} /></div>
          <div className="flex items-center gap-2">
            <Switch checked={form.is_headquarters} onCheckedChange={v => setForm(p => ({ ...p, is_headquarters: v }))} />
            <Label>Headquarters</Label>
          </div>
          <Button onClick={handleSubmit} className="w-full">Save Location</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
