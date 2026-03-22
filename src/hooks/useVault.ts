/**
 * useVault — Secure document vault hook.
 *
 * Manages file uploads/downloads to the private `vault` storage bucket.
 * Supports categorization (KYC, tax, certificates, etc.), share-link
 * generation via random tokens, and auto-sync from verification docs.
 *
 * Files are uploaded directly to Supabase Storage, with metadata
 * tracked in the `vault_files` table.
 */
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const VAULT_CATEGORIES = [
  { value: "kyc", label: "KYC Documents" },
  { value: "tax", label: "Tax & ROC" },
  { value: "verification", label: "Verification Proofs" },
  { value: "certificates", label: "Certificates & Licenses" },
  { value: "media", label: "Media & Images" },
  { value: "other", label: "Other" },
] as const;

export type VaultCategory = (typeof VAULT_CATEGORIES)[number]["value"];

export interface VaultFile {
  id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  public_url: string | null;
  category: string;
  tags: string[];
  description: string;
  share_token: string | null;
  is_shared: boolean;
  source: string;
  source_ref: string | null;
  created_at: string;
  updated_at: string;
}

export function useVault(userId: string | null) {
  const [files, setFiles] = useState<VaultFile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchFiles = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("vault_files")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Vault fetch error:", error);
    } else {
      setFiles((data as any[]) ?? []);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const uploadFile = async (
    file: File,
    category: VaultCategory,
    description: string = "",
    tags: string[] = []
  ) => {
    if (!userId) return null;

    const ext = file.name.split(".").pop();
    const filePath = `${userId}/${category}/${Date.now()}_${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("vault")
      .upload(filePath, file);

    if (uploadError) {
      toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
      return null;
    }

    const { data: inserted, error: insertError } = await supabase
      .from("vault_files")
      .insert({
        user_id: userId,
        file_name: file.name,
        file_path: filePath,
        file_type: file.type,
        file_size: file.size,
        category,
        description,
        tags,
        source: "upload",
      } as any)
      .select()
      .single();

    if (insertError) {
      toast({ title: "Failed to save record", description: insertError.message, variant: "destructive" });
      return null;
    }

    toast({ title: "File uploaded", description: `${file.name} saved to vault.` });
    await fetchFiles();
    return inserted as unknown as VaultFile;
  };

  const deleteFile = async (fileId: string, filePath: string) => {
    await supabase.storage.from("vault").remove([filePath]);
    await supabase.from("vault_files").delete().eq("id", fileId);
    toast({ title: "File deleted" });
    await fetchFiles();
  };

  const toggleShare = async (fileId: string, currentlyShared: boolean, ttlDays: number = 7) => {
    const updates: any = currentlyShared
      ? { is_shared: false, share_token: null, share_expires_at: null }
      : {
          is_shared: true,
          share_token: crypto.randomUUID().replace(/-/g, "").slice(0, 16),
          share_expires_at: new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000).toISOString(),
        };

    await supabase.from("vault_files").update(updates).eq("id", fileId);
    await fetchFiles();
    toast({
      title: currentlyShared ? "Sharing disabled" : "Share link created",
      description: currentlyShared ? undefined : `Link expires in ${ttlDays} days.`,
    });
  };

  const getSignedUrl = async (filePath: string) => {
    const { data } = await supabase.storage.from("vault").createSignedUrl(filePath, 3600);
    return data?.signedUrl ?? null;
  };

  const syncVerificationDocs = async () => {
    if (!userId) return;

    const { data: verDocs } = await supabase
      .from("verification_requests")
      .select("id, document_name, document_url, document_type")
      .eq("user_id", userId);

    if (!verDocs?.length) return;

    const { data: existing } = await supabase
      .from("vault_files")
      .select("source_ref")
      .eq("user_id", userId)
      .eq("source", "verification");

    const existingRefs = new Set((existing as any[])?.map((e) => e.source_ref) ?? []);

    const newDocs = verDocs.filter((d) => !existingRefs.has(d.id));
    if (!newDocs.length) return;

    const inserts = newDocs.map((d) => ({
      user_id: userId,
      file_name: d.document_name,
      file_path: d.document_url,
      file_type: d.document_type || "application/pdf",
      file_size: 0,
      category: "verification",
      source: "verification",
      source_ref: d.id,
      description: "Auto-synced from verification request",
    }));

    await supabase.from("vault_files").insert(inserts as any);
    await fetchFiles();
  };

  return { files, loading, uploadFile, deleteFile, toggleShare, getSignedUrl, syncVerificationDocs, refetch: fetchFiles };
}
