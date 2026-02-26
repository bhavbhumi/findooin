import { supabase } from "@/integrations/supabase/client";

/**
 * Upload a file to a storage bucket.
 * Files are stored under `{userId}/{timestamp}_{filename}` for isolation.
 * Returns the public URL on success.
 */
export async function uploadFile(
  bucket: string,
  file: File,
  userId: string,
): Promise<{ url: string; path: string } | { error: string }> {
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${userId}/${timestamp}_${safeName}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error(`Upload to ${bucket} failed:`, error);
    return { error: error.message };
  }

  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return { url: urlData.publicUrl, path };
}

/**
 * Delete a file from a storage bucket.
 */
export async function deleteFile(bucket: string, path: string): Promise<void> {
  await supabase.storage.from(bucket).remove([path]);
}
