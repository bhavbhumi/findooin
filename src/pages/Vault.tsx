import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FindooLoader } from "@/components/FindooLoader";
import { useVault, VAULT_CATEGORIES } from "@/hooks/useVault";
import { VaultUploadDialog } from "@/components/vault/VaultUploadDialog";
import { VaultFileCard } from "@/components/vault/VaultFileCard";
import {
  Plus, Search, FolderLock, FileText, Image, Shield,
  Award, File, LayoutGrid, RefreshCw
} from "lucide-react";

const CATEGORY_ICONS: Record<string, typeof FileText> = {
  kyc: Shield,
  tax: FileText,
  verification: Award,
  certificates: Award,
  media: Image,
  other: File,
};

const Vault = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setUserId(session.user.id);
    });
  }, []);

  const { files, loading, uploadFile, deleteFile, toggleShare, getSignedUrl, syncVerificationDocs } = useVault(userId);

  const handleDownload = async (path: string, name: string) => {
    const url = await getSignedUrl(path);
    if (url) {
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      a.click();
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    await syncVerificationDocs();
    setSyncing(false);
  };

  const filteredFiles = useMemo(() => {
    let result = files;
    if (activeCategory !== "all") {
      result = result.filter((f) => f.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (f) =>
          f.file_name.toLowerCase().includes(q) ||
          f.description?.toLowerCase().includes(q) ||
          f.tags?.some((t) => t.includes(q))
      );
    }
    return result;
  }, [files, activeCategory, search]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: files.length };
    VAULT_CATEGORIES.forEach((c) => {
      counts[c.value] = files.filter((f) => f.category === c.value).length;
    });
    return counts;
  }, [files]);

  return (
    <AppLayout maxWidth="max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        {/* Main Content */}
        <div className="min-w-0 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-lg bg-accent/10 flex items-center justify-center">
                <FolderLock className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">My Vault</h1>
                <p className="text-xs text-muted-foreground">{files.length} files • Private & secure</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleSync} disabled={syncing}>
                <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${syncing ? "animate-spin" : ""}`} />
                Sync Docs
              </Button>
              <Button size="sm" onClick={() => setUploadOpen(true)}>
                <Plus className="h-3.5 w-3.5 mr-1.5" /> Upload
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search files, tags..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Category Tabs */}
          <Tabs value={activeCategory} onValueChange={setActiveCategory}>
            <div className="overflow-x-auto -mx-1 px-1">
              <TabsList className="inline-flex w-max bg-card border border-border rounded-xl h-10 p-1">
                <TabsTrigger value="all" className="rounded-lg text-xs px-3 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
                  <LayoutGrid className="h-3 w-3 mr-1" /> All ({categoryCounts.all})
                </TabsTrigger>
                {VAULT_CATEGORIES.map((c) => {
                  const Icon = CATEGORY_ICONS[c.value] || File;
                  return (
                    <TabsTrigger key={c.value} value={c.value} className="rounded-lg text-xs px-3 data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
                      <Icon className="h-3 w-3 mr-1" /> {c.label.split(" ")[0]} ({categoryCounts[c.value] ?? 0})
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </div>
          </Tabs>

          {/* File List */}
          {loading ? (
            <FindooLoader text="Loading vault..." />
          ) : filteredFiles.length === 0 ? (
            <Card className="border-border">
              <CardContent className="p-10 text-center">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                  <FolderLock className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-sm font-medium">
                  {search ? "No files match your search" : "No files in this category"}
                </p>
                <p className="text-muted-foreground text-xs mt-1">
                  Upload your KYC proofs, tax documents, certificates, and more.
                </p>
                <Button size="sm" className="mt-4" onClick={() => setUploadOpen(true)}>
                  <Plus className="h-3.5 w-3.5 mr-1.5" /> Upload First File
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filteredFiles.map((file) => (
                <VaultFileCard
                  key={file.id}
                  file={file}
                  onDelete={deleteFile}
                  onToggleShare={toggleShare}
                  onDownload={handleDownload}
                />
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-20 space-y-4">
            <Card className="border-border">
              <CardContent className="p-4 space-y-3">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Shield className="h-4 w-4 text-accent" /> Storage Overview
                </h3>
                <div className="space-y-2">
                  {VAULT_CATEGORIES.map((c) => {
                    const count = categoryCounts[c.value] ?? 0;
                    const Icon = CATEGORY_ICONS[c.value] || File;
                    return (
                      <button
                        key={c.value}
                        onClick={() => setActiveCategory(c.value)}
                        className={`w-full flex items-center justify-between p-2 rounded-lg text-xs transition-colors hover:bg-muted ${activeCategory === c.value ? "bg-accent/10 text-accent" : "text-foreground"}`}
                      >
                        <span className="flex items-center gap-2">
                          <Icon className="h-3.5 w-3.5" /> {c.label}
                        </span>
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{count}</Badge>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold mb-2">Quick Tips</h3>
                <ul className="text-xs text-muted-foreground space-y-1.5">
                  <li>• Click "Sync Docs" to auto-import verification documents</li>
                  <li>• Use share links to securely share specific files</li>
                  <li>• All files are private by default</li>
                  <li>• Max file size: 10MB per file</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </aside>
      </div>

      <VaultUploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onUpload={uploadFile}
      />
    </AppLayout>
  );
};

export default Vault;
