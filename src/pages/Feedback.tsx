import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Lightbulb, Map, FileText, User, Shield, Plus, Package } from "lucide-react";
import { useRole } from "@/contexts/RoleContext";
import { FeatureHub } from "@/components/feedback/FeatureHub";
import { RoadmapSwimlane } from "@/components/feedback/RoadmapSwimlane";
import { ChangelogTimeline } from "@/components/feedback/ChangelogTimeline";
import { MyActivityPanel } from "@/components/feedback/MyActivityPanel";
import { FeedbackAdminPanel } from "@/components/feedback/FeedbackAdminPanel";
import { usePageMeta } from "@/hooks/usePageMeta";
import AppLayout from "@/components/AppLayout";

const Feedback = () => {
  usePageMeta({ title: "Product Hub — findoo", description: "Explore platform modules, vote on features, and shape findoo's future" });
  const { hasRole } = useRole();
  const isAdmin = hasRole("admin");
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  return (
    <AppLayout maxWidth="max-w-6xl">
      <div className="py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Package className="h-5 w-5 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">Product Hub</h1>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Explore modules, rate features, suggest improvements, and track our roadmap</p>
          </div>
          <Button onClick={() => setShowSubmitModal(true)} size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Suggest a Feature</span>
            <span className="sm:hidden">Suggest</span>
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="hub" className="space-y-4">
          <TabsList className="w-full justify-start bg-muted/50 h-auto flex-wrap gap-1 p-1">
            <TabsTrigger value="hub" className="gap-1.5 text-xs sm:text-sm">
              <Lightbulb className="h-3.5 w-3.5" />
              Feature Hub
            </TabsTrigger>
            <TabsTrigger value="roadmap" className="gap-1.5 text-xs sm:text-sm">
              <Map className="h-3.5 w-3.5" />
              Roadmap
            </TabsTrigger>
            <TabsTrigger value="changelog" className="gap-1.5 text-xs sm:text-sm">
              <FileText className="h-3.5 w-3.5" />
              Changelog
            </TabsTrigger>
            <TabsTrigger value="activity" className="gap-1.5 text-xs sm:text-sm">
              <User className="h-3.5 w-3.5" />
              My Activity
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="admin" className="gap-1.5 text-xs sm:text-sm text-primary">
                <Shield className="h-3.5 w-3.5" />
                Admin
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="hub">
            <FeatureHub showSubmitModal={showSubmitModal} onCloseSubmitModal={() => setShowSubmitModal(false)} />
          </TabsContent>
          <TabsContent value="roadmap">
            <RoadmapSwimlane />
          </TabsContent>
          <TabsContent value="changelog">
            <ChangelogTimeline />
          </TabsContent>
          <TabsContent value="activity">
            <MyActivityPanel />
          </TabsContent>
          {isAdmin && (
            <TabsContent value="admin">
              <FeedbackAdminPanel />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Feedback;
