import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PublicPageLayout } from "@/components/PublicPageLayout";
import { Button } from "@/components/ui/button";
import { FileText, Download, ShieldCheck, AlertCircle, Loader2 } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";

interface SharedFile {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_path: string;
  category: string;
  description: string;
  created_at: string;
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "Unknown size";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
};

const SharedVaultFile = () => {
  const { shareToken } = useParams<{ shareToken: string }>();
  const [file, setFile] = useState<SharedFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [downloading, setDownloading] = useState(false);

  usePageMeta({
    title: file ? `Shared File: ${file.file_name}` : "Shared File",
    description: "A file shared securely via findoo Vault.",
  });

  useEffect(() => {
    if (!shareToken) return;

    const fetchFile = async () => {
      const { data, error: fetchError } = await supabase
        .from("vault_files")
        .select("id, file_name, file_type, file_size, file_path, category, description, created_at")
        .eq("share_token", shareToken)
        .eq("is_shared", true)
        .maybeSingle();

      if (fetchError || !data) {
        setError(true);
      } else {
        setFile(data as SharedFile);
      }
      setLoading(false);
    };

    fetchFile();
  }, [shareToken]);

  const handleDownload = async () => {
    if (!file) return;
    setDownloading(true);
    try {
      const { data } = await supabase.storage
        .from("vault")
        .createSignedUrl(file.file_path, 300);

      if (data?.signedUrl) {
        const a = document.createElement("a");
        a.href = data.signedUrl;
        a.download = file.file_name;
        a.target = "_blank";
        a.click();
      }
    } catch {
      // silently fail
    }
    setDownloading(false);
  };

  if (loading) {
    return (
      <PublicPageLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PublicPageLayout>
    );
  }

  if (error || !file) {
    return (
      <PublicPageLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center max-w-md">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold font-heading text-foreground mb-2">File Not Found</h1>
            <p className="text-muted-foreground mb-6">
              This shared link is invalid, has expired, or the owner has disabled sharing.
            </p>
            <Button asChild variant="outline">
              <Link to="/">Go to findoo</Link>
            </Button>
          </div>
        </div>
      </PublicPageLayout>
    );
  }

  return (
    <PublicPageLayout>
      <div className="min-h-[60vh] flex items-center justify-center py-16">
        <div className="w-full max-w-md mx-auto">
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-5">
              <FileText className="h-8 w-8 text-primary" />
            </div>

            <h1 className="text-xl font-bold font-heading text-foreground mb-1">
              {file.file_name}
            </h1>

            <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground mb-4">
              <span className="capitalize">{file.category}</span>
              <span>•</span>
              <span>{formatFileSize(file.file_size)}</span>
              <span>•</span>
              <span>{new Date(file.created_at).toLocaleDateString()}</span>
            </div>

            {file.description && (
              <p className="text-sm text-muted-foreground mb-6">{file.description}</p>
            )}

            <Button onClick={handleDownload} disabled={downloading} className="w-full mb-4">
              {downloading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Download File
            </Button>

            <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5" />
              Shared securely via findoo Vault
            </div>
          </div>
        </div>
      </div>
    </PublicPageLayout>
  );
};

export default SharedVaultFile;
