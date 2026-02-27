import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Upload, X, FileText } from "lucide-react";
import { VAULT_CATEGORIES, type VaultCategory } from "@/hooks/useVault";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (file: File, category: VaultCategory, description: string, tags: string[]) => Promise<any>;
}

const MAX_SIZE_MB = 10;

export function VaultUploadDialog({ open, onOpenChange, onUpload }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState<VaultCategory>("other");
  const [description, setDescription] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setFile(null);
    setCategory("other");
    setDescription("");
    setTags([]);
    setTagInput("");
  };

  const handleSubmit = async () => {
    if (!file) return;
    setUploading(true);
    await onUpload(file, category, description, tags);
    setUploading(false);
    reset();
    onOpenChange(false);
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t) && tags.length < 10) {
      setTags([...tags, t]);
      setTagInput("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload to Vault</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* File drop zone */}
          <div
            className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-accent transition-colors"
            onClick={() => inputRef.current?.click()}
          >
            {file ? (
              <div className="flex items-center gap-3 justify-center">
                <FileText className="h-8 w-8 text-accent" />
                <div className="text-left">
                  <p className="text-sm font-medium truncate max-w-[200px]">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); setFile(null); }}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <>
                <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Click to select a file (max {MAX_SIZE_MB}MB)</p>
              </>
            )}
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f && f.size <= MAX_SIZE_MB * 1024 * 1024) setFile(f);
              }}
            />
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as VaultCategory)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {VAULT_CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label>Description (optional)</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} maxLength={200} placeholder="Brief note about this file..." />
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <Label>Tags (optional)</Label>
            <div className="flex gap-2">
              <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="Add tag..." maxLength={30}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
              />
              <Button variant="outline" size="sm" onClick={addTag} disabled={!tagInput.trim()}>Add</Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {tags.map((t) => (
                  <Badge key={t} variant="secondary" className="text-xs cursor-pointer" onClick={() => setTags(tags.filter((x) => x !== t))}>
                    {t} <X className="h-2.5 w-2.5 ml-1" />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <Button className="w-full" disabled={!file || uploading} onClick={handleSubmit}>
            {uploading ? "Uploading..." : "Upload to Vault"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
