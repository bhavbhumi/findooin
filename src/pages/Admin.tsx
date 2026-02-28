import { useState, useEffect } from "react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsAdmin } from "@/hooks/useAdmin";
import { FindooLoader } from "@/components/FindooLoader";
import AppNavbar from "@/components/AppNavbar";
import { Shield, ShieldCheck, Users, Flag, LayoutDashboard, BookOpen, Activity } from "lucide-react";
import { AdminVerificationQueue } from "@/components/admin/AdminVerificationQueue";
import { AdminUserManagement } from "@/components/admin/AdminUserManagement";
import { AdminContentModeration } from "@/components/admin/AdminContentModeration";
import { AdminOverview } from "@/components/admin/AdminOverview";
import { AdminBlogManagement } from "@/components/admin/AdminBlogManagement";
import { AdminAuditLog } from "@/components/admin/AdminAuditLog";

export default function Admin() {
  usePageMeta({ title: "Admin Panel" });
  const navigate = useNavigate();
  const { data: isAdmin, isLoading } = useIsAdmin();
  const [tab, setTab] = useState("overview");

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      navigate("/feed");
    }
  }, [isAdmin, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FindooLoader text="Checking access..." />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />
      <div className="container max-w-6xl py-6 px-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-heading text-foreground">Admin Panel</h1>
            <p className="text-sm text-muted-foreground">Manage users, verification & moderation</p>
          </div>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="w-full grid grid-cols-6 h-10 mb-6">
            <TabsTrigger value="overview" className="gap-1.5 text-xs sm:text-sm">
              <LayoutDashboard className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="verification" className="gap-1.5 text-xs sm:text-sm">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Verification</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-1.5 text-xs sm:text-sm">
              <Users className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="moderation" className="gap-1.5 text-xs sm:text-sm">
              <Flag className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Reports</span>
            </TabsTrigger>
            <TabsTrigger value="blog" className="gap-1.5 text-xs sm:text-sm">
              <BookOpen className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Blog</span>
            </TabsTrigger>
            <TabsTrigger value="audit" className="gap-1.5 text-xs sm:text-sm">
              <Activity className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Audit</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview"><AdminOverview /></TabsContent>
          <TabsContent value="verification"><AdminVerificationQueue /></TabsContent>
          <TabsContent value="users"><AdminUserManagement /></TabsContent>
          <TabsContent value="moderation"><AdminContentModeration /></TabsContent>
          <TabsContent value="blog"><AdminBlogManagement /></TabsContent>
          <TabsContent value="audit"><AdminAuditLog /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
