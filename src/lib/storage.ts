import { supabase } from "@/integrations/supabase/client";

const MAX_FILE_SIZE_MB = 10;

const ALLOWED_TYPES: Record<string, string[]> = {
  "post-attachments": [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ],
  "verification-docs": [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
  ],
  avatars: ["image/jpeg", "image/png", "image/webp"],
  banners: ["image/jpeg", "image/png", "image/webp"],
};

interface UploadResult {
  url: string;
  path: string;
  file_name: string;
  file_type: string;
  file_size: number;
}

interface UploadError {
  error: string;
}

/**
 * Validate a file before upload.
 * Returns an error message string, or null if valid.
 */
export function validateFile(
  file: File,
  bucket: string,
): string | null {
  const allowed = ALLOWED_TYPES[bucket];
  if (!allowed) return `Unknown upload destination "${bucket}".`;

  if (!allowed.includes(file.type)) {
    const friendly = allowed
      .map((t) => t.split("/").pop()?.toUpperCase())
      .join(", ");
    return `File type "${file.type || "unknown"}" is not allowed. Accepted: ${friendly}.`;
  }

  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    return `File size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds the ${MAX_FILE_SIZE_MB}MB limit.`;
  }

  return null;
}

/**
 * Upload a file via the upload-file edge function.
 * Handles auth, validation, and graceful error messaging.
 */
export async function uploadFile(
  bucket: string,
  file: File,
  _userId: string,
): Promise<UploadResult | UploadError> {
  // Client-side validation first (fast feedback)
  const validationError = validateFile(file, bucket);
  if (validationError) {
    return { error: validationError };
  }

  try {
    // Get current session token
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return { error: "You must be signed in to upload files." };
    }

    // Build multipart form
    const formData = new FormData();
    formData.append("file", file);
    formData.append("bucket", bucket);

    // Call edge function
    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/upload-file`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: formData,
      },
    );

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || `Upload failed (${response.status})` };
    }

    return {
      url: data.url,
      path: data.path,
      file_name: data.file_name,
      file_type: data.file_type,
      file_size: data.file_size,
    };
  } catch (err: any) {
    console.error("Upload error:", err);

    // Provide user-friendly messages for common failures
    if (err.message?.includes("Failed to fetch") || err.message?.includes("NetworkError")) {
      return { error: "Network error — please check your connection and try again." };
    }
    if (err.message?.includes("timeout")) {
      return { error: "Upload timed out — the file may be too large. Try a smaller file." };
    }

    return { error: err.message || "An unexpected error occurred during upload." };
  }
}

/**
 * Delete a file upload record.
 */
export async function deleteFile(bucket: string, path: string): Promise<{ error?: string }> {
  try {
    const { error } = await supabase
      .from("file_uploads")
      .delete()
      .eq("file_path", path)
      .eq("bucket", bucket);

    if (error) {
      return { error: "Failed to remove file record." };
    }
    return {};
  } catch (err: any) {
    return { error: err.message || "Failed to delete file." };
  }
}
