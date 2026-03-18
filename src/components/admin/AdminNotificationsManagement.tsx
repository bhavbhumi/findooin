/**
 * AdminNotificationsManagement — Broadcast notifications, push management,
 * and notification analytics.
 */
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Bell, Send, Users, Eye, Search, RefreshCw,
  CheckCircle2, Mail, Smartphone, MessageSquare, Megaphone
} from "lucide-react";
import { toast } from "sonner";
import { format, formatDistanceToNow, subDays } from "date-fns";

const NOTIFICATION_TYPES = [
  { key: "announcement", label: "Announcement", icon: Megaphone },
  { key: "feature_update", label: "Feature Update", icon: Bell },
  { key: "maintenance", label: "Maintenance", icon: Bell },
  { key: "promotion", label: "Promotion", icon: Mail },
];

const TARGET_SEGMENTS = [
  { key: "all", label: "All Users" },
  { key: "verified", label: "Verified Users" },
  { key: "intermediary", label: "Intermediaries" },
  { key: "issuer", label: "Issuers" },
  { key: "investor", label: "Investors" },
  { key: "staff", label: "Staff Only" },
];

export function AdminNotificationsManagement() {
  const [tab, setTab] = useState("broadcast");
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const qc = useQueryClient();

  // Fetch recent notifications (admin-sent broadcasts)
  const { data: recentNotifications = [], isLoading } = useQuery({
    queryKey: ["admin-notifications-log"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .in("type", ["announcement", "feature_update", "maintenance", "promotion"])
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data;
    },
  });

  // Notification stats
  const { data: notifStats } = useQuery({
    queryKey: ["admin-notification-stats"],
    queryFn: async () => {
      const now = new Date();
      const week = subDays(now, 7);

      const { count: totalCount } = await supabase.from("notifications").select("*", { count: "exact", head: true });
      const { count: unreadCount } = await supabase.from("notifications").select("*", { count: "exact", head: true }).eq("read", false);
      const { count: weekCount } = await supabase.from("notifications").select("*", { count: "exact", head: true }).gte("created_at", week.toISOString());

      // Count broadcast notifications
      const broadcasts = recentNotifications.length;
      
      return {
        total: totalCount || 0,
        unread: unreadCount || 0,
        thisWeek: weekCount || 0,
        broadcasts,
      };
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold font-heading flex items-center gap-2">
            <Bell className="h-5 w-5" /> Notifications
          </h2>
          <p className="text-sm text-muted-foreground">Manage broadcasts and notification delivery</p>
        </div>
        <Button size="sm" onClick={() => setBroadcastOpen(true)}>
          <Send className="h-3.5 w-3.5 mr-1" /> Broadcast
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Sent", value: notifStats?.total || 0, icon: Bell, color: "text-primary" },
          { label: "Unread", value: notifStats?.unread || 0, icon: Eye, color: "text-yellow-500" },
          { label: "This Week", value: notifStats?.thisWeek || 0, icon: Send, color: "text-emerald-500" },
          { label: "Broadcasts", value: notifStats?.broadcasts || 0, icon: Megaphone, color: "text-purple-500" },
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

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="broadcast">Broadcast Log</TabsTrigger>
          <TabsTrigger value="channels">Channels</TabsTrigger>
        </TabsList>

        <TabsContent value="broadcast" className="mt-3">
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-4 space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
              ) : recentNotifications.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Megaphone className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No broadcast notifications sent yet</p>
                  <p className="text-xs mt-1">Use the Broadcast button to send announcements to users</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Type</TableHead>
                      <TableHead className="text-xs">Message</TableHead>
                      <TableHead className="text-xs">Recipient</TableHead>
                      <TableHead className="text-xs">Read</TableHead>
                      <TableHead className="text-xs">Sent</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentNotifications.slice(0, 50).map((notif) => (
                      <TableRow key={notif.id}>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px] capitalize">{notif.type.replace("_", " ")}</Badge>
                        </TableCell>
                        <TableCell className="text-xs max-w-[300px] truncate">{notif.message}</TableCell>
                        <TableCell className="text-xs font-mono text-muted-foreground">{notif.user_id.slice(0, 8)}...</TableCell>
                        <TableCell>
                          {notif.read ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                          ) : (
                            <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="channels" className="mt-3">
          <div className="grid sm:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2"><Bell className="h-4 w-4" /> In-App</CardTitle>
                <CardDescription className="text-xs">Real-time in-app notification bell</CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant="default" className="text-[10px]">Active</Badge>
                <p className="text-xs text-muted-foreground mt-2">
                  All notification types are delivered in-app via the notification bell.
                  Users receive real-time updates for connections, comments, likes, and system events.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2"><Mail className="h-4 w-4" /> Email</CardTitle>
                <CardDescription className="text-xs">Auth & transactional emails</CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant="default" className="text-[10px]">Active</Badge>
                <p className="text-xs text-muted-foreground mt-2">
                  Auth emails (password reset, verification) and transactional emails (contact confirmations) 
                  are sent via the configured email domain. Monitor delivery in the Email Dashboard.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2"><Smartphone className="h-4 w-4" /> Push (PWA)</CardTitle>
                <CardDescription className="text-xs">Web push notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant="secondary" className="text-[10px]">Planned</Badge>
                <p className="text-xs text-muted-foreground mt-2">
                  PWA push notifications will allow reaching users even when they're not actively using the app.
                  Requires service worker integration and user opt-in.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <BroadcastDialog open={broadcastOpen} onOpenChange={setBroadcastOpen} />
    </div>
  );
}

function BroadcastDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    type: "announcement",
    message: "",
    segment: "all",
  });

  const broadcast = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Build user query based on segment
      let query = supabase.from("profiles").select("id");
      
      if (form.segment === "verified") {
        query = query.eq("verification_status", "verified");
      } else if (form.segment === "staff") {
        query = query.eq("is_staff", true);
      }
      // For role-based segments, we need to join user_roles
      // For simplicity, we'll get all profiles and filter

      const { data: profiles, error: pErr } = await query.limit(1000);
      if (pErr) throw pErr;

      if (!profiles || profiles.length === 0) {
        throw new Error("No users found in this segment");
      }

      // If role-based segment, filter by role
      let targetIds = profiles.map(p => p.id);
      
      if (["intermediary", "issuer", "investor"].includes(form.segment)) {
        const { data: roleUsers } = await supabase
          .from("user_roles")
          .select("user_id")
          .eq("role", form.segment);
        
        if (roleUsers) {
          const roleUserIds = new Set(roleUsers.map(r => r.user_id));
          targetIds = targetIds.filter(id => roleUserIds.has(id));
        }
      }

      // Insert notifications in batches
      const batchSize = 100;
      let inserted = 0;
      for (let i = 0; i < targetIds.length; i += batchSize) {
        const batch = targetIds.slice(i, i + batchSize).map(uid => ({
          user_id: uid,
          actor_id: user.id,
          type: form.type,
          message: form.message,
          reference_type: "broadcast",
        }));
        const { error } = await supabase.from("notifications").insert(batch);
        if (error) throw error;
        inserted += batch.length;
      }

      return inserted;
    },
    onSuccess: (count) => {
      qc.invalidateQueries({ queryKey: ["admin-notifications-log"] });
      qc.invalidateQueries({ queryKey: ["admin-notification-stats"] });
      toast.success(`Broadcast sent to ${count} users`);
      onOpenChange(false);
      setForm({ type: "announcement", message: "", segment: "all" });
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Send className="h-4 w-4" /> Broadcast Notification</DialogTitle>
          <DialogDescription>Send a notification to a user segment</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm(f => ({ ...f, type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {NOTIFICATION_TYPES.map(t => <SelectItem key={t.key} value={t.key}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Target Segment</Label>
              <Select value={form.segment} onValueChange={(v) => setForm(f => ({ ...f, segment: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TARGET_SEGMENTS.map(s => <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Message *</Label>
            <Textarea rows={3} value={form.message}
              onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))}
              placeholder="Write your notification message..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => broadcast.mutate()} disabled={!form.message.trim() || broadcast.isPending}>
            {broadcast.isPending ? "Sending..." : "Send Broadcast"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
