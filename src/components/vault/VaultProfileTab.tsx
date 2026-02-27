import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FindooLoader } from "@/components/FindooLoader";
import { useVault, VAULT_CATEGORIES } from "@/hooks/useVault";
import { VaultUploadDialog } from "@/components/vault/VaultUploadDialog";
import { VaultFileCard } from "@/components/vault/VaultFileCard";
import { Plus, FolderLock, ExternalLink, RefreshCw } from "lucide-react";

interface Props {
  profileId: string;
}

export function VaultProfileTab({ profileId }: Props) {
  const { files, loading, uploadFile, deleteFile, toggleShare, getSignedUrl, syncVerificationDocs } = useVault(profileId);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const recentFiles = useMemo(() => files.slice(0, 5), [files]);

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

  if (loading) return <FindooLoader size="sm" text="Loading vault..." />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderLock className="h-4 w-4 text-accent" />
          <h3 className="font-semibold text-sm">My Vault</h3>
          <Badge variant="secondary" className="text-[10px]">{files.length} files</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleSync} disabled={syncing}>
            <RefreshCw className={`h-3 w-3 mr-1 ${syncing ? "animate-spin" : ""}`} /> Sync
          </Button>
          <Button size="sm" onClick={() => setUploadOpen(true)}>
            <Plus className="h-3 w-3 mr-1" /> Upload
          </Button>
        </div>
      </div>

      {/* Category summary */}
      <div className="flex flex-wrap gap-2">
        {VAULT_CATEGORIES.map((c) => {
          const count = files.filter((f) => f.category === c.value).length;
          if (count === 0) return null;
          return (
            <Badge key={c.value} variant="outline" className="text-xs">
              {c.label}: {count}
            </Badge>
          );
        })}
      </div>

      {recentFiles.length === 0 ? (
        <Card className="border-border">
          <CardContent className="p-8 text-center">
            <FolderLock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Your vault is empty</p>
            <p className="text-xs text-muted-foreground mt-1">Upload KYC, tax docs, certificates, and more.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {recentFiles.map((file) => (
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

      {files.length > 5 && (
        <Link to="/vault">
          <Button variant="outline" className="w-full" size="sm">
            <ExternalLink className="h-3 w-3 mr-1.5" /> View All in Vault ({files.length} files)
          </Button>
        </Link>
      )}

      <VaultUploadDialog open={uploadOpen} onOpenChange={setUploadOpen} onUpload={uploadFile} />
    </div>
  );
}
