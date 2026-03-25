/**
 * AdminModuleWrapper — Wraps any admin module component with a
 * "Module Spec" tab that displays the living product document.
 */
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ModuleFeatureDoc } from "./ModuleFeatureDoc";
import { FileText } from "lucide-react";

interface AdminModuleWrapperProps {
  moduleKey: string;
  children: React.ReactNode;
}

export function AdminModuleWrapper({ moduleKey, children }: AdminModuleWrapperProps) {
  const [tab, setTab] = useState("module");

  return (
    <Tabs value={tab} onValueChange={setTab} className="space-y-4">
      <div className="flex justify-end">
        <TabsList className="h-8">
          <TabsTrigger value="module" className="text-xs px-3 py-1">
            Module
          </TabsTrigger>
          <TabsTrigger value="spec" className="text-xs px-3 py-1 gap-1">
            <FileText className="h-3 w-3" />
            Module Spec
          </TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="module" className="mt-0">
        {children}
      </TabsContent>
      <TabsContent value="spec" className="mt-0">
        <ModuleFeatureDoc moduleKey={moduleKey} />
      </TabsContent>
    </Tabs>
  );
}
