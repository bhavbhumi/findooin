import { useEffect, useState } from "react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { SubscriptionSettings } from "@/components/settings/SubscriptionSettings";
import { supabase } from "@/integrations/supabase/client";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/ThemeToggle";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bell, Mail, Shield, Eye, LogOut, Trash2, User, Lock, Palette,
  Heart, MessageCircle, UserPlus, Users, MessageSquare, Loader2,
  Activity, Network, FolderLock, CreditCard,
} from "lucide-react";
import { useTabPrivacy, visibilityLabels, type TabVisibility, type TabPrivacySettings } from "@/hooks/useTabPrivacy";

interface UserSettings {
  email_notifications: boolean;
  notify_likes: boolean;
  notify_comments: boolean;
  notify_follows: boolean;
  notify_connections: boolean;
  notify_messages: boolean;
  profile_visibility: string;
  show_email: boolean;
  show_phone: boolean;
}

const defaultSettings: UserSettings = {
  email_notifications: true,
  notify_likes: true,
  notify_comments: true,
  notify_follows: true,
  notify_connections: true,
  notify_messages: true,
  profile_visibility: "public",
  show_email: false,
  show_phone: false,
};

const Settings = () => {
  usePageMeta({ title: "Settings" });
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { settings: tabPrivacy, updateSettings: updateTabPrivacy, isSaving: tabPrivacySaving } = useTabPrivacy(currentUserId);

  // Email change
  const [showEmailChange, setShowEmailChange] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailChangeLoading, setEmailChangeLoading] = useState(false);

  // Password change
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordChangeLoading, setPasswordChangeLoading] = useState(false);

  // Account deletion
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return;
      setUserEmail(session.user.email || "");
      setCurrentUserId(session.user.id);
      loadSettings(session.user.id);
    });
  }, []);

  const loadSettings = async (uid: string) => {
    setLoading(true);
    const { data } = await supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", uid)
      .maybeSingle();

    if (data) {
      setSettings({
        email_notifications: data.email_notifications,
        notify_likes: data.notify_likes,
        notify_comments: data.notify_comments,
        notify_follows: data.notify_follows,
        notify_connections: data.notify_connections,
        notify_messages: data.notify_messages,
        profile_visibility: data.profile_visibility,
        show_email: data.show_email,
        show_phone: data.show_phone,
      });
    }
    setLoading(false);
  };

  const saveSettings = async () => {
    setSaving(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase
      .from("user_settings")
      .upsert({
        user_id: session.user.id,
        ...settings,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });

    if (error) {
      toast.error("Failed to save settings");
    } else {
      toast.success("Settings saved");
    }
    setSaving(false);
  };

  const handleSignOut = async () => {
    const { removeSession } = await import("@/lib/session-manager");
    await removeSession();
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") return;
    setDeleteLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("delete-account");
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success("Account deleted successfully. Goodbye!");
      await supabase.auth.signOut();
      window.location.href = "/";
    } catch (err: any) {
      toast.error(err.message || "Failed to delete account");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;
    setEmailChangeLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail.trim() });
      if (error) throw error;
      toast.success("Confirmation email sent to both old and new addresses. Please confirm to complete the change.");
      setShowEmailChange(false);
      setNewEmail("");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setEmailChangeLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      toast.error("Passwords don't match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setPasswordChangeLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success("Password updated successfully");
      setShowPasswordChange(false);
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setPasswordChangeLoading(false);
    }
  };

  const updateSetting = (key: keyof UserSettings, value: boolean | string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  // Extracted outside render to avoid forwardRef warning
  const renderSettingRow = (icon: React.ElementType, label: string, description: string, checked: boolean, onCheckedChange: (v: boolean) => void) => {
    const Icon = icon;
    return (
      <div className="flex items-center justify-between py-3">
        <div className="flex items-start gap-3">
          <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">{label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          </div>
        </div>
        <Switch checked={checked} onCheckedChange={onCheckedChange} />
      </div>
    );
  };

  return (
    <AppLayout maxWidth="max-w-2xl" className="pt-4 px-4">
      <h1 className="text-2xl font-bold font-heading text-foreground mb-1">Settings</h1>
      <p className="text-sm text-muted-foreground mb-6">Manage your account, privacy, and notification preferences.</p>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-xl border border-border bg-card animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Appearance */}
          <section className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Palette className="h-4 w-4 text-foreground" />
              <h2 className="text-base font-semibold font-heading text-foreground">Appearance</h2>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Theme</p>
                <p className="text-xs text-muted-foreground">Choose light, dark, or system default</p>
              </div>
              <ThemeToggle />
            </div>
          </section>

          {/* Account */}
          <section className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <User className="h-4 w-4 text-foreground" />
              <h2 className="text-base font-semibold font-heading text-foreground">Account</h2>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-foreground">Email</p>
                <p className="text-xs text-muted-foreground">{userEmail}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => { setNewEmail(""); setShowEmailChange(true); }}>
                Change
              </Button>
            </div>
            <Separator className="my-2" />
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-foreground">Password</p>
                <p className="text-xs text-muted-foreground">Update your password</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => { setNewPassword(""); setConfirmNewPassword(""); setShowPasswordChange(true); }}>
                <Lock className="h-3.5 w-3.5 mr-1" /> Update
              </Button>
            </div>
          </section>

          {/* Notification Preferences */}
          <section className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="h-4 w-4 text-foreground" />
              <h2 className="text-base font-semibold font-heading text-foreground">Notifications</h2>
            </div>
            {renderSettingRow(Mail, "Email notifications", "Receive email notifications for important activity", settings.email_notifications, (v) => updateSetting("email_notifications", v))}
            <Separator />
            {renderSettingRow(Heart, "Likes", "When someone likes your post", settings.notify_likes, (v) => updateSetting("notify_likes", v))}
            <Separator />
            {renderSettingRow(MessageCircle, "Comments", "When someone comments on your post", settings.notify_comments, (v) => updateSetting("notify_comments", v))}
            <Separator />
            {renderSettingRow(UserPlus, "Follows", "When someone follows you", settings.notify_follows, (v) => updateSetting("notify_follows", v))}
            <Separator />
            {renderSettingRow(Users, "Connection requests", "When someone sends you a connection request", settings.notify_connections, (v) => updateSetting("notify_connections", v))}
            <Separator />
            {renderSettingRow(MessageSquare, "Messages", "When someone sends you a direct message", settings.notify_messages, (v) => updateSetting("notify_messages", v))}
          </section>

          {/* Privacy */}
          <section className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-4 w-4 text-foreground" />
              <h2 className="text-base font-semibold font-heading text-foreground">Privacy</h2>
            </div>
            {renderSettingRow(Eye, "Show email on profile", "Allow others to see your email address", settings.show_email, (v) => updateSetting("show_email", v))}
            <Separator />
            {renderSettingRow(Eye, "Show phone on profile", "Allow others to see your phone number", settings.show_phone, (v) => updateSetting("show_phone", v))}
          </section>

          {/* Tab Privacy */}
          <section className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 mb-1">
              <Eye className="h-4 w-4 text-foreground" />
              <h2 className="text-base font-semibold font-heading text-foreground">Profile Tab Visibility</h2>
            </div>
            <p className="text-xs text-muted-foreground mb-4">Control who can see specific tabs on your profile.</p>

            {([
              { key: "activity_visibility" as const, icon: Activity, label: "Activity", desc: "Your activity timeline and interactions" },
              { key: "network_visibility" as const, icon: Users, label: "Network", desc: "Your connections, followers, and following" },
              { key: "vault_visibility" as const, icon: FolderLock, label: "Vault", desc: "Your uploaded documents and files" },
            ]).map(({ key, icon: Icon, label, desc }, idx) => (
              <div key={key}>
                {idx > 0 && <Separator className="my-3" />}
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-start gap-3">
                    <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                    </div>
                  </div>
                  <Select
                    value={tabPrivacy[key]}
                    onValueChange={(v) => {
                      const updated = { ...tabPrivacy, [key]: v as TabVisibility };
                      updateTabPrivacy(updated).then(() => {
                        import("sonner").then(({ toast }) => toast.success(`${label} visibility updated`));
                      });
                    }}
                  >
                    <SelectTrigger className="w-[160px] h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.entries(visibilityLabels) as [TabVisibility, string][]).map(([value, lbl]) => (
                        <SelectItem key={value} value={value} className="text-xs">{lbl}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </section>

          {/* Subscription */}
          <section className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="h-4 w-4 text-foreground" />
              <h2 className="text-base font-semibold font-heading text-foreground">Subscription</h2>
            </div>
            <SubscriptionSettings />
          </section>

          {/* Save */}
          <Button onClick={saveSettings} disabled={saving} className="w-full">
            {saving ? "Saving..." : "Save Settings"}
          </Button>

          {/* Danger zone */}
          <section className="rounded-xl border border-destructive/30 bg-card p-5">
            <h2 className="text-base font-semibold font-heading text-foreground mb-3">Danger Zone</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Sign out</p>
                <p className="text-xs text-muted-foreground">Sign out of your account on this device</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleSignOut} className="text-destructive border-destructive/30 hover:bg-destructive/10">
                <LogOut className="h-3.5 w-3.5 mr-1" /> Sign Out
              </Button>
            </div>
            <Separator className="my-3" />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-destructive">Delete account</p>
                <p className="text-xs text-muted-foreground">Permanently delete your account and all data</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => { setDeleteConfirmText(""); setShowDeleteConfirm(true); }} className="text-destructive border-destructive/30 hover:bg-destructive/10">
                <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
              </Button>
            </div>
          </section>
        </div>
      )}

      {/* Email Change Dialog */}
      <Dialog open={showEmailChange} onOpenChange={setShowEmailChange}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-heading">Change Email</DialogTitle>
            <DialogDescription>Enter your new email address. You'll need to confirm both old and new email addresses.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEmailChange} className="space-y-4">
            <div className="space-y-2">
              <Label>Current Email</Label>
              <Input value={userEmail} disabled className="opacity-60" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newEmail">New Email</Label>
              <Input id="newEmail" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="new@example.com" required />
            </div>
            <Button type="submit" className="w-full" disabled={emailChangeLoading}>
              {emailChangeLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Confirmation
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Password Change Dialog */}
      <Dialog open={showPasswordChange} onOpenChange={setShowPasswordChange}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-heading">Update Password</DialogTitle>
            <DialogDescription>Choose a new password for your account.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPwd">New Password</Label>
              <Input id="newPwd" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" required minLength={6} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPwd">Confirm Password</Label>
              <Input id="confirmPwd" type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} placeholder="••••••••" required minLength={6} />
            </div>
            <Button type="submit" className="w-full" disabled={passwordChangeLoading}>
              {passwordChangeLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Password
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Account Confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive font-heading">Delete your account?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <span className="block">This action is <strong>permanent and irreversible</strong>. All your data — posts, connections, messages, vault files, and profile — will be permanently erased.</span>
              <span className="block text-xs">To confirm, type <strong>DELETE</strong> below.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            placeholder='Type "DELETE" to confirm'
            className="mt-2"
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={deleteConfirmText !== "DELETE" || deleteLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Permanently Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
};

export default Settings;
