import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  FileText, Image, File, MoreVertical, Download, Share2, Trash2, Link2, Copy, ExternalLink
} from "lucide-react";
import { format } from "date-fns";
import type { VaultFile } from "@/hooks/useVault";
import { VAULT_CATEGORIES } from "@/hooks/useVault";
import { useToast } from "@/hooks/use-toast";

interface Props {
  file: VaultFile;
  onDelete: (id: string, path: string) => void;
  onToggleShare: (id: string, shared: boolean) => void;
  onDownload: (path: string, name: string) => void;
}

const fileIcon = (type: string) => {
  if (type.startsWith("image/")) return <Image className="h-8 w-8 text-accent" />;
  if (type.includes("pdf")) return <FileText className="h-8 w-8 text-destructive" />;
  return <File className="h-8 w-8 text-muted-foreground" />;
};

const categoryLabel = (value: string) =>
  VAULT_CATEGORIES.find((c) => c.value === value)?.label ?? value;

export function VaultFileCard({ file, onDelete, onToggleShare, onDownload }: Props) {
  const { toast } = useToast();
  const [deleting, setDeleting] = useState(false);

  const copyShareLink = () => {
    if (!file.share_token) return;
    const url = `${window.location.origin}/vault/shared/${file.share_token}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Share link copied!" });
  };

  return (
    <Card className="border-border hover:border-accent/40 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
            {fileIcon(file.file_type)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{file.file_name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.file_size / 1024).toFixed(0)} KB • {format(new Date(file.created_at), "dd MMM yyyy")}
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0">
                    <MoreVertical className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onDownload(file.file_path, file.file_name)}>
                    <Download className="h-3.5 w-3.5 mr-2" /> Download
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onToggleShare(file.id, file.is_shared)}>
                    <Share2 className="h-3.5 w-3.5 mr-2" /> {file.is_shared ? "Disable Sharing" : "Create Share Link"}
                  </DropdownMenuItem>
                  {file.is_shared && (
                    <DropdownMenuItem onClick={copyShareLink}>
                      <Copy className="h-3.5 w-3.5 mr-2" /> Copy Share Link
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={async () => { setDeleting(true); await onDelete(file.id, file.file_path); setDeleting(false); }}
                    disabled={deleting}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <Badge variant="outline" className="text-[10px] py-0">{categoryLabel(file.category)}</Badge>
              {file.source === "verification" && (
                <Badge variant="secondary" className="text-[10px] py-0 bg-accent/10 text-accent">Auto-synced</Badge>
              )}
              {file.is_shared && (
                <Badge variant="secondary" className="text-[10px] py-0 bg-status-success/10 text-status-success">
                  <Link2 className="h-2.5 w-2.5 mr-0.5" /> Shared
                </Badge>
              )}
              {file.tags?.map((t) => (
                <Badge key={t} variant="secondary" className="text-[10px] py-0">{t}</Badge>
              ))}
            </div>

            {file.description && (
              <p className="text-xs text-muted-foreground mt-1.5 line-clamp-1">{file.description}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
