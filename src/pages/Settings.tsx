import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AppNavbar from "@/components/AppNavbar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Bell, Mail, Shield, Eye, LogOut, Trash2, User, Lock,
  Heart, MessageCircle, UserPlus, Users, MessageSquare,
} from "lucide-react";

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
  const navigate = useNavigate();
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { navigate("/auth"); return; }
      setUserEmail(session.user.email || "");
      loadSettings(session.user.id);
    });
  }, [navigate]);

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
    await supabase.auth.signOut();
    navigate("/");
  };

  const updateSetting = (key: keyof UserSettings, value: boolean | string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const SettingRow = ({ icon: Icon, label, description, checked, onCheckedChange }: {
    icon: React.ElementType;
    label: string;
    description: string;
    checked: boolean;
    onCheckedChange: (v: boolean) => void;
  }) => (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-start gap-3">
        <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
        <div>
          <Label className="text-sm font-medium text-foreground">{label}</Label>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <AppNavbar />
      <div className="container max-w-2xl mx-auto pt-4 px-4">
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
                <Button variant="outline" size="sm" onClick={() => toast.info("Email change coming soon")}>
                  Change
                </Button>
              </div>
              <Separator className="my-2" />
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-foreground">Password</p>
                  <p className="text-xs text-muted-foreground">Update your password</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => toast.info("Password change coming soon")}>
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

              <SettingRow
                icon={Mail}
                label="Email notifications"
                description="Receive email notifications for important activity"
                checked={settings.email_notifications}
                onCheckedChange={(v) => updateSetting("email_notifications", v)}
              />
              <Separator />
              <SettingRow
                icon={Heart}
                label="Likes"
                description="When someone likes your post"
                checked={settings.notify_likes}
                onCheckedChange={(v) => updateSetting("notify_likes", v)}
              />
              <Separator />
              <SettingRow
                icon={MessageCircle}
                label="Comments"
                description="When someone comments on your post"
                checked={settings.notify_comments}
                onCheckedChange={(v) => updateSetting("notify_comments", v)}
              />
              <Separator />
              <SettingRow
                icon={UserPlus}
                label="Follows"
                description="When someone follows you"
                checked={settings.notify_follows}
                onCheckedChange={(v) => updateSetting("notify_follows", v)}
              />
              <Separator />
              <SettingRow
                icon={Users}
                label="Connection requests"
                description="When someone sends you a connection request"
                checked={settings.notify_connections}
                onCheckedChange={(v) => updateSetting("notify_connections", v)}
              />
              <Separator />
              <SettingRow
                icon={MessageSquare}
                label="Messages"
                description="When someone sends you a direct message"
                checked={settings.notify_messages}
                onCheckedChange={(v) => updateSetting("notify_messages", v)}
              />
            </section>

            {/* Privacy */}
            <section className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-4 w-4 text-foreground" />
                <h2 className="text-base font-semibold font-heading text-foreground">Privacy</h2>
              </div>

              <SettingRow
                icon={Eye}
                label="Show email on profile"
                description="Allow others to see your email address"
                checked={settings.show_email}
                onCheckedChange={(v) => updateSetting("show_email", v)}
              />
              <Separator />
              <SettingRow
                icon={Eye}
                label="Show phone on profile"
                description="Allow others to see your phone number"
                checked={settings.show_phone}
                onCheckedChange={(v) => updateSetting("show_phone", v)}
              />
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
                <Button variant="outline" size="sm" onClick={() => toast.info("Account deletion coming soon")} className="text-destructive border-destructive/30 hover:bg-destructive/10">
                  <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                </Button>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
