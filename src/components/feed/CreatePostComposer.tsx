import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp, BookOpen, Megaphone, Newspaper, FileText,
  Paperclip, X, Image, File, Send, Loader2,
} from "lucide-react";
import { toast } from "sonner";

const POST_TYPES = [
  { value: "text", label: "Post", icon: FileText },
  { value: "market_commentary", label: "Market Commentary", icon: TrendingUp },
  { value: "research_note", label: "Research Note", icon: BookOpen },
  { value: "announcement", label: "Announcement", icon: Megaphone },
  { value: "article", label: "Article", icon: Newspaper },
] as const;

const ALLOWED_FILE_TYPES: Record<string, string[]> = {
  "application/pdf": [".pdf"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": [".pptx"],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
};

const MAX_FILE_SIZE_MB = 10;
const MAX_CONTENT_LENGTH = 3000;

function extractHashtags(text: string): string[] {
  const matches = text.match(/#(\w+)/g);
  if (!matches) return [];
  const unique = [...new Set(matches.map((m) => m.replace("#", "")))];
  return unique;
}

function getAcceptString() {
  return Object.keys(ALLOWED_FILE_TYPES).join(",");
}

function isFileAllowed(file: File): { ok: boolean; reason?: string } {
  if (!Object.keys(ALLOWED_FILE_TYPES).includes(file.type)) {
    return { ok: false, reason: `File type "${file.type || "unknown"}" is not allowed. Accepted: PDF, JPG, PNG, WEBP, DOCX, PPTX, XLSX.` };
  }
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    return { ok: false, reason: `File size exceeds ${MAX_FILE_SIZE_MB}MB limit.` };
  }
  return { ok: true };
}

export function CreatePostComposer() {
  const [userId, setUserId] = useState<string | null>(null);
  const [canPost, setCanPost] = useState<boolean | null>(null);
  const [postType, setPostType] = useState("text");
  const [content, setContent] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return;
      setUserId(session.user.id);
      // Check if user has investor-only role (cannot post)
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id);

      if (!roles || roles.length === 0) {
        setCanPost(false);
        return;
      }
      const roleSet = new Set(roles.map((r) => r.role));
      // If user ONLY has investor role, they cannot post
      const investorOnly = roleSet.size === 1 && roleSet.has("investor");
      setCanPost(!investorOnly);
    });
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const check = isFileAllowed(file);
    if (!check.ok) {
      toast.error(check.reason);
      e.target.value = "";
      return;
    }
    setAttachment(file);
    e.target.value = "";
  }, []);

  const handleSubmit = async () => {
    if (!userId || !content.trim()) return;
    if (content.length > MAX_CONTENT_LENGTH) {
      toast.error(`Content exceeds ${MAX_CONTENT_LENGTH} character limit.`);
      return;
    }

    setSubmitting(true);
    try {
      const hashtags = extractHashtags(content);

      const insertData = {
        author_id: userId,
        content: content.trim(),
        post_type: postType as "text" | "market_commentary" | "research_note" | "announcement" | "article",
        hashtags: hashtags.length > 0 ? hashtags : null,
        attachment_name: attachment ? attachment.name : null,
        attachment_type: attachment ? attachment.type : null,
        attachment_url: attachment ? `attachment://${attachment.name}` : null,
      };

      const { error } = await supabase.from("posts").insert(insertData);
      if (error) throw error;

      setContent("");
      setPostType("text");
      setAttachment(null);
      queryClient.invalidateQueries({ queryKey: ["feed-posts"] });
      toast.success("Post published!");
    } catch (err: any) {
      toast.error(err.message || "Failed to publish post.");
    } finally {
      setSubmitting(false);
    }
  };

  // Don't render if user can't post or still loading
  if (canPost === null) return null;
  if (!canPost) return null;

  const hashtags = extractHashtags(content);
  const charCount = content.length;
  const overLimit = charCount > MAX_CONTENT_LENGTH;

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Select value={postType} onValueChange={setPostType}>
          <SelectTrigger className="w-[200px] h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {POST_TYPES.map((t) => {
              const Icon = t.icon;
              return (
                <SelectItem key={t.value} value={t.value}>
                  <span className="flex items-center gap-2">
                    <Icon className="h-3.5 w-3.5" />
                    {t.label}
                  </span>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        <span className={`ml-auto text-[10px] tabular-nums ${overLimit ? "text-destructive font-semibold" : "text-muted-foreground"}`}>
          {charCount}/{MAX_CONTENT_LENGTH}
        </span>
      </div>

      <Textarea
        placeholder="Share an insight, research note, or market update..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="min-h-[80px] resize-none text-sm border-none shadow-none focus-visible:ring-0 p-0"
        maxLength={MAX_CONTENT_LENGTH + 100}
      />

      {/* Extracted hashtags preview */}
      {hashtags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {hashtags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-[10px] bg-accent/10 text-accent font-medium">
              #{tag}
            </Badge>
          ))}
        </div>
      )}

      {/* Attachment preview */}
      {attachment && (
        <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary/50 px-3 py-2">
          {attachment.type.startsWith("image") ? (
            <Image className="h-4 w-4 text-muted-foreground shrink-0" />
          ) : (
            <File className="h-4 w-4 text-muted-foreground shrink-0" />
          )}
          <span className="text-xs text-muted-foreground truncate flex-1">{attachment.name}</span>
          <span className="text-[10px] text-muted-foreground">{(attachment.size / 1024 / 1024).toFixed(1)}MB</span>
          <button onClick={() => setAttachment(null)} className="text-muted-foreground hover:text-destructive">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Actions row */}
      <div className="flex items-center gap-2 pt-1 border-t border-border">
        <label className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
          <Paperclip className="h-4 w-4" />
          <input
            type="file"
            className="hidden"
            accept={getAcceptString()}
            onChange={handleFileChange}
          />
        </label>
        <span className="text-[10px] text-muted-foreground">
          PDF, Images, DOCX, PPTX, XLSX · Max {MAX_FILE_SIZE_MB}MB
        </span>
        <div className="flex-1" />
        <Button
          size="sm"
          className="h-8 px-4 gap-1.5"
          disabled={!content.trim() || overLimit || submitting}
          onClick={handleSubmit}
        >
          {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
          Publish
        </Button>
      </div>
    </div>
  );
}
